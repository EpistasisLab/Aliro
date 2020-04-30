import numpy as np
import pandas as pd
import time
import datetime
import pickle
import pdb
import json
import os
import random
from ai.knowledgebase_loader import load_knowledgebase
from ai.metalearning.get_metafeatures import generate_metafeatures
from ai.metalearning.dataset_describe import Dataset
import logging
import sys
from ai.recommender.average_recommender import AverageRecommender
from ai.recommender.random_recommender import RandomRecommender
from ai.recommender.knn_meta_recommender import KNNMetaRecommender
from ai.metrics import SCORERS
# from ai.recommender.svd_recommender import SVDRecommender
from ai.recommender.surprise_recommenders import (CoClusteringRecommender,
        KNNWithMeansRecommender, KNNDatasetRecommender, KNNMLRecommender,
        SlopeOneRecommender, SVDRecommender)

from sklearn.model_selection import cross_val_score, ParameterGrid
from sklearn.base import BaseEstimator, ClassifierMixin, RegressorMixin

logger = logging.getLogger(__name__)
logger.setLevel(logging.ERROR)
ch = logging.StreamHandler()
formatter = logging.Formatter('%(module)s: %(levelname)s: %(message)s')
ch.setFormatter(formatter)
logger.addHandler(ch)




class PennAI(BaseEstimator):
    """Penn AI standalone sklearn wrapper.

    Responsible for:
    - checking for user requests for recommendations,
    - checking for new results from experiments,
    - calling the recommender system to generate experiment recommendations,
    - posting the recommendations to the API.
    - handling communication with the API.

    :param rec_class: ai.BaseRecommender - recommender to use
    :param verbose: Boolean # todo not working
    :param warm_start: Boolean - if true, attempt to load the ai state from the plk file
    :param scoring: str - scoring for evaluating recommendations
    :param n_recs: int - number of recommendations to make for each iteration
    :param n_iters: int = total number of iteration
    :param knowledgebase: file - input file for knowledgebase
    :param kb_metafeatures: inputfile for metafeature
    :param ml_p_file: inputfile for hyperparams space for all ML algorithms
    :param term_condition: terminate condition # todo
    :param max_time: maximum time in minutes that PennAI can run # todo
    :param random_state: random state for recommenders

    """
    mode="classification"

    def __init__(self,
                rec_class=None,
                verbose=True, # todo
                warm_start=False,
                scoring=None,
                n_recs=10,
                n_iters=10,
                knowledgebase=None,
                kb_metafeatures=None,
                ml_p_file=None,
                term_condition='n_recs x n_iters',
                max_time=50,
                random_state=None):
        """Initializes AI managing agent."""

        self.rec_class = rec_class
        self.verbose = verbose
        self.warm_start = warm_start
        self.scoring = scoring
        self.n_recs = n_recs
        self.n_iters = n_iters
        self.knowledgebase = knowledgebase
        self.kb_metafeatures = kb_metafeatures
        self.ml_p_file=ml_p_file
        self.term_condition = term_condition
        self.max_time = max_time
        self.random_state = random_state

    def fit_init_(self):
        """
        fit initilization
        """

        # recommendation engines for different problem types
        # will be expanded as more types of probles are supported
        # (classification, regression, unsupervised, etc.)
        if self.scoring is not None:
            self.scoring_ = self.scoring

        # match scoring_ to metric in knowledgebase
        metric_match ={
        "accuracy": "accuracy",
        "balanced_accuracy": "bal_accuracy",
        "f1": "macrof1",
        "f1_macro": "macrof1",
        "r2": "r2_cv_mean",
        "explained_variance": "explained_variance_cv_mean",
        "neg_mean_squared_error": "neg_mean_squared_error_cv_mean"
        }
        self.metric_ = metric_match[self.scoring_]

        self.rec_engines = {
            self.mode: None
        }

        # Request manager settings
        self.n_recs_=self.n_recs if self.n_recs>0 else 1
        #self.continuous= self.n_recs<1
        # timestamp of the last time new experiments were processed
        #self.last_update = 0

        self.initilize_recommenders(self.rec_class) # set self.rec_engines

        # build dictionary of ml ids to names conversion
        # print('ml_id_to_name:',self.ml_id_to_name)

        # local dataframe of datasets and their metafeatures
        self.dataset_mf_cache = pd.DataFrame()

        if self.knowledgebase:
            self.load_kb()

        # terminate value
        if self.term_condition == 'n_recs':
            self.term_value = self.n_recs_
        elif self.term_condition == 'time':
            self.term_value = max_time
        else:
            self.term_value = None

        # if there is a pickle file, load it as the recommender scores
        assert not (self.warm_start), "The `warm_start` option is not yet supported"

    def generate_metafeatures_from_X_y(self, X, y):
        """
        Return meta_features based on input X and y in fit().
        :param X: pd.DataFrame
        :param y: pd.Series

        """
        df = X.copy()
        df['pennai_target'] = y
        dataset = Dataset(df=df,
                        dependent_col="pennai_target",
                        prediction_type=self.mode
                        )
        self.datasetId = dataset.m_data_hash()

        meta_features = generate_metafeatures(dataset)
        mf = [meta_features]
        df = pd.DataFrame.from_records(mf,columns=meta_features.keys())
        #include dataset name
        df['dataset'] = self.datasetId
        df.sort_index(axis=1, inplace=True)
        return df

    def valid_combo(self, combo, bad_combos):
        """Checks if parameter combination is valid."""
        for bad_combo in bad_combos:
            bc = {}
            for b in bad_combo:
                bc.update(b)
            bad = True
            for k,v in bc.items():
                if combo[k] != v:
                    bad = False
        return not bad

    def get_all_ml_p(self, categoryFilter = None):
        """
        Returns a list of ml and parameter options based on projects.json

        :returns: pd.DataFrame - unique ml algorithm and parameter combinations
            with columns 'alg_name', 'category', 'alg_name', 'parameters'
            'parameters' is a dictionary of parameters
        """
        logger.info("get_all_ml_p()")
        if self.ml_p_file is None:
            self.ml_p_file_ = "dockers/dbmongo/files/projects.json"
        else:
            self.ml_p_file_ = self.ml_p_file

        self.algorithms = json.load(open(self.ml_p_file_, encoding="utf8"))
        # exclude algorithm in different mode
        self.algorithms = [a for a in self.algorithms if a['category'] == self.mode]

        result = [] # returned value
        good_def = True # checks that json for ML is in good form

        for i,x in enumerate(self.algorithms):
            logger.debug('Checking ML: ' + str(x['name']))

            hyperparams = x['schema'].keys()
            hyperparam_dict = {}

            # get a dictionary of hyperparameters and their values
            for h in hyperparams:
                logger.debug('  Checking hyperparams: x[''schema''][h]' +
                        str(x['schema'][h]))
                if 'ui' in x['schema'][h]:
                    if 'values' in x['schema'][h]['ui']:
                        hyperparam_dict[h] = x['schema'][h]['ui']['values']
                    else:
                        hyperparam_dict[h] = x['schema'][h]['ui']['choices']
                else:
                    good_def = False
            if good_def:
                all_hyperparam_combos = list(ParameterGrid(hyperparam_dict))
                #print('\thyperparams: ',hyperparam_dict)
                print(len(all_hyperparam_combos),'hyperparameter combinations for',
                        x['name'])
                #print(all_hyperparam_combos)

                for ahc in all_hyperparam_combos:
                    if 'invalidParameterCombinations' in x.keys():
                        if not self.valid_combo(ahc,
                                x['invalidParameterCombinations']):
                            continue
                    result.append({'algorithm':x['name'],
                                   'category':x['category'],
                                   'parameters':ahc,
                                   'alg_name':x['name']})
            else:
                logger.error('warning: ' + str(x['name']) + 'was skipped')
            good_def = True


        # convert to dataframe, making sure there are no duplicates
        all_ml_p = pd.DataFrame(result)
        tmp = all_ml_p.copy()
        tmp['parameters'] = tmp['parameters'].apply(str)
        assert ( len(all_ml_p) == len(tmp.drop_duplicates()) )

        if (len(all_ml_p) > 0):
            logger.info(str(len(all_ml_p)) + ' ml-parameter options loaded')
            logger.info('get_all_ml_p() algorithms:' + str(all_ml_p.algorithm.unique()))
        else:
            logger.error('get_all_ml_p() parsed no results')

        return all_ml_p
    ##-----------------
    ## Init methods
    ##-----------------
    def initilize_recommenders(self, rec_class):
        """
        Initilize recommender
        """
        # default supervised learning recommender settings

        self.DEFAULT_REC_ARGS = {'metric': self.metric_}
        #if self.random_state:
            #self.DEFAULT_REC_ARGS['random_state'] = self.random_state
        # this line also need refactor # todo !!!
        # set the registered ml parameters in the recommenders

        ml_p = self.get_all_ml_p()

        self.DEFAULT_REC_ARGS['ml_p'] = ml_p

        # Create supervised learning recommenders
        if self.rec_class is not None:
            self.rec_engines[self.mode] = self.rec_class(**self.DEFAULT_REC_ARGS)
        else:
            self.rec_engines[self.mode]  = RandomRecommender(**self.DEFAULT_REC_ARGS)

        #print('ml_p df head')
        #print(ml_p.head())
        assert ml_p is not None
        assert len(ml_p) > 0

        # if hasattr(self.rec_engines["classification"],'mlp_combos'):
        #     self.rec_engines["classification"].mlp_combos = self.rec_engines["classification"].ml_p['algorithm']+'|'+self.rec_engines["classification"].ml_p['parameters']
        # ml_p.to_csv('ml_p_options.csv')


        logger.debug("recomendation engines initilized: ")
        for prob_type, rec in self.rec_engines.items():
            logger.debug(f'\tproblemType: {prob_type} - {rec}')
            logger.debug('\trec.ml_p:\n'+str(rec.ml_p.head()))



    def load_kb(self):
        """Bootstrap the recommenders with the knowledgebase."""
        logger.info('loading pmlb knowledgebase')

        kb = load_knowledgebase(
                            resultsFiles=[self.knowledgebase],
                            metafeaturesFiles=[self.kb_metafeatures]
                            )

        # replace algorithm names with their ids
        #self.ml_name_to_id = {v:k for k,v in self.ml_id_to_name.items()}
        #kb['resultsData']['algorithm'] = kb['resultsData']['algorithm'].apply(
        #                                  lambda x: self.ml_name_to_id[x])

        all_df_mf = kb['metafeaturesData'].set_index('_id', drop=False)

        # all_df_mf = pd.DataFrame.from_records(metafeatures).transpose()
        # keep only metafeatures with results
        df = all_df_mf.loc[kb['resultsData'][self.mode]['_id'].unique()]
        self.dataset_mf_cache = self.dataset_mf_cache.append(df)
        # self.update_dataset_mf(kb['resultsData'])

        self.rec_engines[self.mode].update(kb['resultsData'][self.mode],
                self.dataset_mf_cache, source='knowledgebase')
        logger.info('Knowledgebase loaded')


    ##-----------------
    ## Utility methods
    ##-----------------

    # todo ! to working yet
    def get_results_metafeatures(self):
        """
        Return a pandas dataframe of metafeatures

        Retireves metafeatures from self.dataset_mf_cache if they exist,
        otherwise queries the api and updates the cache.

        :param results_data: experiment results with associated datasets

        """

        d = self.datasetId
        df = self.meta_features
        df['dataset'] = d
        df.set_index('dataset', inplace=True)
        self.dataset_mf_cache = self.dataset_mf_cache.append(df)
        logger.info(f'mf:\n {list(self.dataset_mf_cache.index.values)}')

        return df


    def update_recommender(self, new_results_df):
        """Update recommender models based on new experiment results in
        new_results_df.
        """
        if len(new_results_df) >= 1:
            new_mf = self.get_results_metafeatures()
            self.rec_engines[self.mode].update(new_results_df, new_mf)
            logger.info(time.strftime("%Y %I:%M:%S %p %Z",time.localtime())+
                    ': recommender updated')

    ##-----------------
    ## Syncronous actions an AI request can take
    ##-----------------
    def generate_recommendations(self):
        """

        :returns list of maps that represent request payload objects
        """
        logger.info("generate_recommendations({},{})".format(self.datasetId, self.n_recs_))

        recommendations = []

        #  metafeature need to generate from independent codes # todo

        #metafeatures = self.labApi.get_metafeatures(datasetId)

        # key code for generate recomendation need call this line or this function into fit
        ml, p, ai_scores = self.rec_engines[self.mode].recommend(
            dataset_id=self.datasetId,
            n_recs=self.n_recs_,
            dataset_mf=self.meta_features)

        for alg,params,score in zip(ml,p,ai_scores):
            # TODO: just return dictionaries of parameters from rec
            # modified_params = eval(params) # turn params into a dictionary

            recommendations.append({'dataset_id':self.datasetId,
                    'algorithm': alg,
                    'parameters':params,
                    'ai_score':score,
                    })

        return recommendations


    def fit(self, X,y):
        """Trains PennAI on X,y.

        initialize: train recommender or load saved recommender state
        until stop criterion is met:
            get recommendations for X,y
            fit and cross validate recommended ML configs
            update recommender based on CV scores
        finalize: store best model, or make ensemble of trained models that meet some performance threshold

        """

        self.fit_init_()
        if self.random_state is not None:
            random.seed(self.random_state)
            np.random.seed(self.random_state)

        # generate datasetId based on import X, y
        # make pd.DataFrameBased on X, y
        if isinstance(X, np.ndarray):
            columns = ["Feature_{}".format(i) for i in range(X.shape[1])]
            X = pd.DataFrame(X, columns=columns)
        if "pennai_target" in X.columns:
            raise ValueError('The column name "pennai_target" is not allowed in X, '
            'please check your dataset and remove/rename that column')

        # get meta_features based on X, y
        self.meta_features = self.generate_metafeatures_from_X_y(X, y)
        # save all results
        self.recomms = []

        for i,x in enumerate(self.algorithms):
            logger.debug('Importing ML methods: ' + str(x['name']))
            # import scikit obj from string
            exec('from {} import {}'.format(x['path'], x['name']))
        for i in range(self.n_iters):
            print("Start iteration #", i+1)
            recommendations = self.generate_recommendations()
            new_results = []
            for r in recommendations:

                print(r)
                # evaluate each recomendation
                est = eval(r['algorithm'])() # convert string to scikit-learn obj
                params = r['parameters']
                if hasattr(est, 'random_state') and self.random_state:
                    params['random_state'] = self.random_state
                est.set_params(**params)
                # initilize a result
                res = {
                '_id': self.datasetId,
                'algorithm': r['algorithm'],
                'parameters': params,
                }
                try:
                    cv_scores = cross_val_score(
                                                estimator=est,
                                                X=X,
                                                y=y,
                                                cv=10,
                                                scoring=self.scoring_,
                                                error_score = 'raise'
                                                )
                except Exception:
                    # todo for better error message
                    logger.info(time.strftime("%Y %I:%M:%S %p %Z",time.localtime())+
                            ': recommendation: ' + str(r) + 'is invaild.')
                    continue
                res[self.metric_] =  np.mean(cv_scores)
                new_results.append(res)

            self.recomms += new_results

            new_results_df = pd.DataFrame(new_results)
            # get best score
            best_score_iter = new_results_df[self.metric_].max()
            # update recommender each iteration
            self.update_recommender(new_results_df)
            # get best score in new results in this iteration
             # todo for early stop termination


        # convert to pandas.DataFrame from finalize result
        self.recomms = pd.DataFrame(self.recomms)
        self.best_result_score = self.recomms[self.metric_].max()
        self.best_result = self.recomms[self.recomms[self.metric_] == self.best_result_score]
        self.best_algorithm = self.best_result['algorithm'].values[0]
        self.best_params = self.best_result['parameters'].values[0]
        self.estimator = eval(self.best_algorithm)()
        self.estimator.set_params(**self.best_params)
        # fit best estimator with X, y
        self.estimator.fit(X, y)

        return self


    def predict(self, X):
        """Predict using trained model."""
        if not hasattr(self,'estimator'):
            raise RuntimeError('A estimator has not yet been optimized. Please call fit() first.')
        return self.estimator.predict(X)

    def score(self, X, y):
        """Return the score on the given testing data using the user-specified scoring function.
        Parameters
        ----------
        X: array-like {n_samples, n_features}
            Feature matrix of the testing set
        y: array-like {n_samples}
            List of class labels for prediction in the testing set
        Returns
        -------
        accuracy_score: float
            The estimated test set accuracy
        """
        if not hasattr(self,'estimator'):
            raise RuntimeError('A estimator has not yet been optimized. Please call fit() first.')
        scorer = SCORERS[self.scoring_]
        score = scorer(
            self.estimator,
            X,
            y
        )
        return score

class PennAIClassifier(PennAI, ClassifierMixin):
    mode = "classification"
    scoring_ = "accuracy"

class PennAIRegressor(PennAI, RegressorMixin):
    mode = "regression"
    scoring_ = "neg_mean_squared_error"
