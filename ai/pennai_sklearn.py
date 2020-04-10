from sklearn.tree import DecisionTreeClassifier
import numpy as np
import pandas as pd
from time import sleep
import time
import datetime
import pickle
import pdb

import os
from ai.knowledgebase_loader import load_default_knowledgebases
from ai.metalearning.get_metafeatures import generate_metafeatures
from ai.metalearning.datasest_describe import Dataset
import logging
import sys
from ai.recommender.average_recommender import AverageRecommender
from ai.recommender.random_recommender import RandomRecommender
from ai.recommender.knn_meta_recommender import KNNMetaRecommender
# from ai.recommender.svd_recommender import SVDRecommender
from ai.recommender.surprise_recommenders import (CoClusteringRecommender,
        KNNWithMeansRecommender, KNNDatasetRecommender, KNNMLRecommender,
        SlopeOneRecommender, SVDRecommender)
from collections import OrderedDict
from sklearn.model_selection import cross_val_score

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

    """
    mode="classification"

    def __init__(self,
                rec_class=None,
                verbose=True,
                warm_start=False,
                scoring="accuracy",
                n_recs=10,
                n_iters=10,
                knowledgebase=None,
                kb_metafeatures=None,
                ml_p_file=None,
                term_condition='n_recs x n_iters',
                max_time=50):
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

    def fit_init_(self)



        # recommendation engines for different problem types
        # will be expanded as more types of probles are supported
        # (classification, regression, unsupervised, etc.)
        self.rec_engines = {
            self.mode: None
        }

        # Request manager settings
        self.n_recs_=self.n_recs if self.n_recs>0 else 1
        self.continuous= n_recs<1
        # timestamp of the last time new experiments were processed
        self.last_update = 0

        self.initilize_recommenders(self.rec_class) # set self.rec_engines

        # build dictionary of ml ids to names conversion
        # print('ml_id_to_name:',self.ml_id_to_name)

        # dictionary of dataset threads, initilized and used by q_utils.
        # Keys are datasetIds, values are q_utils.DatasetThread instances.
        #WGL: this should get moved to the request manager
        self.dataset_threads = {}

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

        df = pd.concat([X, y], axis=1, ignore_index=True)
        dataset = Dataset(df=df,
                        dependent_col="pennai_target",
                        prediction_type=self.mode
                        )
        self.datasetId = dataset.m_data_hash()

        meta_features = generate_metafeatures(dataset)
        mf = [meta_features]
        df = pd.DataFrame.from_records(mf,columns=meta_features.keys())
        print('api_utils:get_metafeatures')
        #include dataset name
        df['dataset'] = data['name']
        df.sort_index(axis=1, inplace=True)
        return df

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

        algorithms = json.load(open(projects_json, encoding="utf8"))

        if (categoryFilter):
            assert isinstance(categoryFilter, str)
            algorithms = [a for a in algorithms if a['category'] == categoryFilter]

        result = [] # returned value
        good_def = True # checks that json for ML is in good form

        for i,x in enumerate(algorithms):
            logger.debug('Checking ML: ' + str(x['name']))
            # import scikit obj from string
            exec('from {} import {}'.format(x['path'], x['name']))
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

                for ahc in all_hyperparam_combos:
                    if 'invalidParameterCombinations' in x.keys():
                        if not self.valid_combo(ahc,
                                x['invalidParameterCombinations']):
                            continue
                    result.append({'algorithm':x['_id'],
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

        self.DEFAULT_REC_ARGS = {'metric': self.scoring}

        # Create supervised learning recommenders
        if self.rec_class is not None:
            self.rec_engines[self.mode] = self.rec_class(**self.DEFAULT_REC_ARGS)
        else:
            self.rec_engines[self.mode]  = RandomRecommender(**self.DEFAULT_REC_ARGS)

        # this line also need refactor # todo !!!
        # set the registered ml parameters in the recommenders

        ml_p = self.get_all_ml_p()
        assert ml_p is not None
        assert len(ml_p) > 0
        self.rec_engines[self.mode].ml_p = ml_p
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
        self.ml_name_to_id = {v:k for k,v in self.ml_id_to_name.items()}
        kb['resultsData']['algorithm'] = kb['resultsData']['algorithm'].apply(
                                          lambda x: self.ml_name_to_id[x])


        all_df_mf = pd.DataFrame.from_records(kb['metafeaturesData']).transpose()
        # all_df_mf = pd.DataFrame.from_records(metafeatures).transpose()
        # keep only metafeatures with results
        self.dataset_mf_cache = all_df_mf.reindex(kb['resultsData'].dataset.unique())
        # self.update_dataset_mf(kb['resultsData'])
        self.rec_engines[self.mode].update(kb['resultsData'], self.dataset_mf_cache, source='knowledgebase')

        logger.info('Knowledgebase loaded')


    ##-----------------
    ## Utility methods
    ##-----------------

    # todo ! to working yet
    def get_results_metafeatures(self, results_data):
        """
        Return a pandas dataframe of metafeatures associated with the datasets
        in results_data.

        Retireves metafeatures from self.dataset_mf_cache if they exist,
        otherwise queries the api and updates the cache.

        :param results_data: experiment results with associated datasets

        """
        logger.debug('results_data:'+str(results_data.columns))
        logger.debug('results_data:'+str(results_data.head()))

        dataset_metafeatures = []
        dataset_indicies = results_data['dataset'].unique()

        # add dataset metafeatures to the cache
        for d in dataset_indicies:
            if len(self.dataset_mf_cache)==0 or d not in self.dataset_mf_cache.index:
                df = self.labApi.get_metafeatures(d)
                df['dataset'] = d
                dataset_metafeatures.append(df)
        if dataset_metafeatures:
            df_mf = pd.concat(dataset_metafeatures).set_index('dataset')
            self.dataset_mf_cache = self.dataset_mf_cache.append(df_mf)


        logger.info(f'mf:\n {list(self.dataset_mf_cache.index.values)}')
        logger.info(f'indicies: \n\n {dataset_indicies}')

        new_mf = self.dataset_mf_cache.loc[dataset_indicies, :]
        assert len(new_mf) == len(dataset_indicies)
        logger.info(f"new_mf: {new_mf}")

        return new_mf


    def update_recommender(self):
        """Update recommender models based on new experiment results in
        self.new_data, and then clear self.new_data.
        """
        if(hasattr(self,'new_data') and len(self.new_data) >= 1):
            new_mf = self.get_results_metafeatures(self.new_data)
            self.rec_engines[self.mode].update(self.new_data, new_mf)
            logger.info(time.strftime("%Y %I:%M:%S %p %Z",time.localtime())+
                    ': recommender updated')
            # reset new data
            self.new_data = pd.DataFrame()


    ##-----------------
    ## Syncronous actions an AI request can take
    ##-----------------
    def generate_recommendations(self):
        """

        :returns list of maps that represent request payload objects
        """
        logger.info("generate_recommendations({},{})".format(datasetId, numOfRecs))

        recommendations = []

        #  metafeature need to generate from independent codes # todo

        #metafeatures = self.labApi.get_metafeatures(datasetId)

        # key code for generate recomendation need call this line or this function into fit
        ml, p, ai_scores = self.rec_engines[predictionType].recommend(
            dataset_id=self.datasetId,
            n_recs=self.n_recs_,
            dataset_mf=self.meta_features)

        for alg,params,score in zip(ml,p,ai_scores):
            # TODO: just return dictionaries of parameters from rec
            # modified_params = eval(params) # turn params into a dictionary

            recommendations.append({'dataset_id':datasetId,
                    'algorithm':eval(alg), # convert string to scikit-learn obj
                    'parameters':params,
                    'ai_score':score,
                    })

        return recommendations


    def fit(X,y):
        """Trains PennAI on X,y.

        initialize: train recommender or load saved recommender state
        until stop criterion is met:
            get recommendations for X,y
            fit and cross validate recommended ML configs
            update recommender based on CV scores
        finalize: store best model, or make ensemble of trained models that meet some performance threshold

        """
        # load kb and metafeature
        # load ml_p
        self.fit_init_()

        # generate datasetId based on import X, y
        # make pd.DataFrameBased on X, y
        if isinstance(X, np.ndarray):
            X = pd.DataFrame(X)
        if "pennai_target" in X.columns:
            raise ValueError('The column name "pennai_target" is not allowed in X, '
            'please check your dataset and remove/rename that column')

        if isinstance(y, pd.Series):
            y.rename('pennai_target')
        elif isinstance(y, np.ndarray):
            y = pd.Series(y, name="pennai_target")

        # get meta_features based on X, y
        self.meta_features = self.generate_metafeatures_from_X_y(X, y)

        for _ in self.n_iters:
            recommendations = self.generate_recommendations(self)

            for r in recommendations:

                est = r['algorithm'].set_params(r['parameters'])
                cv_scores = cross_val_score(
                                            estimator=est,
                                            X=X,
                                            y=y,
                                            cv=10,
                                            scoring=self.scoring
                                            )
                # avg_cv_score is the score to evaluate recomendation
                r['cv_scores'] = cv_scores
                r['avg_cv_score'] = np.mean(cv_scores)

            # update recommender each iteration # to do





    def predict(X):
        """Predict using trained model."""
