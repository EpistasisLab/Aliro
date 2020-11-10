import numpy as np
import pandas as pd
import time
from datetime import datetime
import pickle
import os
import warnings
import logging
import sys
from ..knowledgebase_utils import load_knowledgebase
from ..metalearning import generate_metafeatures
from ..metalearning import Dataset
from ..metrics import SCORERS
from ..recommender import (
    AverageRecommender,
    RandomRecommender,
    KNNMetaRecommender,
    CoClusteringRecommender,
    KNNWithMeansRecommender,
    KNNDatasetRecommender,
    KNNMLRecommender,
    SlopeOneRecommender,
    SVDRecommender)
from .config import classifier_config_dict, regressor_config_dict

from sklearn.model_selection import cross_val_score, ParameterGrid
from sklearn.base import BaseEstimator, ClassifierMixin, RegressorMixin
from sklearn.ensemble import VotingClassifier, VotingRegressor
from sklearn.exceptions import ConvergenceWarning
from joblib import Parallel, delayed
# ignore ConvergenceWarning in SVR and SVC
warnings.filterwarnings("ignore", category=ConvergenceWarning)

logger = logging.getLogger(__name__)
GitHub_URL = ("https://github.com/EpistasisLab/pennai/raw/"
            "ai_sklearn_api/data/knowledgebases/")

class PennAI(BaseEstimator):
    """Penn AI standalone sklearn wrapper.

    Responsible for:
    - checking for user requests for recommendations,
    - checking for new results from experiments,
    - calling the recommender system to generate experiment recommendations,
    - posting the recommendations to the API.
    - handling communication with the API.

    :param rec_class: ai.BaseRecommender - recommender to use
    :param verbose: int, 0 quite, 1 info, 2 debug
    :param serialized_rec: string or None
        Path of the file to save/load a serialized recommender.
        If the filename is not provided, the default filename based on the recommender
        type, and metric, and knowledgebase used.
    :param scoring: str - scoring for evaluating recommendations
    :param n_recs: int - number of recommendations to make for each iteration
    :param n_iters: int = total number of iteration
    :param knowledgebase: file - input file for knowledgebase
    :param kb_metafeatures: inputfile for metafeature
    :param config_dict: python dictionary - inputfile for hyperparams space for all ML algorithms
    :param ensemble: if it is a integer N, PennAI will use
            VotingClassifier/VotingRegressor to ensemble
            top N best models into one model.
    :param max_time_mins: maximum time in minutes that PennAI can run
    :param stopping_criteria: int, optional
            A number of iterations without improvments in best metric.
            Stop recommendations early if the best metric
            does not improve in the number of iterations iterations.
    :param random_state: random state for recommenders
    :param n_jobs: int (default: 1) The number of cores to dedicate to
            computing the scores with joblib. Assigning this parameter to -1
            will dedicate as many cores as are available on your system.

    """

    def __init__(self,
                 rec_class=None,
                 verbose=0,
                 serialized_rec=None,
                 scoring=None,
                 n_recs=10,
                 n_iters=10,
                 knowledgebase=None,
                 kb_metafeatures=None,
                 config_dict=None,
                 ensemble=None,
                 max_time_mins=None,
                 stopping_criteria=None,
                 random_state=None,
                 n_jobs=1):
        """Initializes AI managing agent."""

        self.rec_class = rec_class
        self.verbose = verbose
        self.serialized_rec = serialized_rec
        self.scoring = scoring
        self.n_recs = n_recs
        self.n_iters = n_iters
        self.knowledgebase = knowledgebase
        self.kb_metafeatures = kb_metafeatures
        self.config_dict = config_dict
        self.ensemble = ensemble
        self.max_time_mins = max_time_mins
        self.stopping_criteria = stopping_criteria
        self.random_state = random_state
        self.n_jobs = n_jobs

    def _fit_init(self):
        """
        fit initilization
        """

        # recommendation engines for different problem types
        # will be expanded as more types of probles are supported
        # (classification, regression, unsupervised, etc.)
        if self.scoring is not None:
            self.scoring_ = self.scoring

        # match scoring_ to metric in knowledgebase
        metric_match = {
            "accuracy": "accuracy",
            "balanced_accuracy": "bal_accuracy",
            "f1": "macrof1",
            "f1_macro": "macrof1",
            "r2": "r2_cv_mean",
            "explained_variance": "explained_variance_cv_mean",
            "neg_mean_squared_error": "neg_mean_squared_error_cv_mean"
        }
        self.metric_ = metric_match[self.scoring_]

        if self.verbose == 2:
            logger_level = logging.DEBUG
        elif self.verbose == 1:
            logger_level = logging.INFO
        elif self.verbose <= 0:
            logger_level = logging.ERROR

        logger.setLevel(logger_level)
        ch = logging.StreamHandler()
        formatter = logging.Formatter('%(module)s: %(levelname)s: %(message)s')
        ch.setFormatter(formatter)
        logger.addHandler(ch)

        # Request manager settings
        self.n_recs_ = self.n_recs if self.n_recs > 0 else 1

        # local dataframe of datasets and their metafeatures
        self.dataset_mf_cache = pd.DataFrame()


        self._initilize_recommenders(self.rec_class)  # set self.rec_engine


        if self.stopping_criteria is not None:
            if self.stopping_criteria < 0:
                raise ValueError(
                        "stopping_criteria should be a positive number.")
            self.best_score_init = -float("inf")
            self.bad_iteration = 0

        if self.max_time_mins is not None:
            if self.max_time_mins < 0:
                raise ValueError("max_time_mins should be a positive number.")


    def _generate_metafeatures_from_X_y(self, X, y):
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
        df = pd.DataFrame.from_records(mf, columns=meta_features.keys())
        # include dataset name
        df['dataset'] = self.datasetId
        df.sort_index(axis=1, inplace=True)
        return df

    def _valid_combo(self, combo, bad_combos):
        """Checks if parameter combination is valid."""
        for bad_combo in bad_combos:
            bc = {}
            for b in bad_combo:
                bc.update(b)
            bad = True
            for k, v in bc.items():
                if combo[k] != v:
                    bad = False
        return not bad

    def _get_all_ml_p(self, categoryFilter=None):
        """
        Returns a list of ml and parameter options based on config dictionary

        :returns: pd.DataFrame - unique ml algorithm and parameter combinations
            with columns 'alg_name', 'category', 'alg_name', 'parameters'
            'parameters' is a dictionary of parameters
        """

        if self.config_dict is not None:
            self.config_dict_ = self.config_dict

        result = []  # returned value
        self.algorithms = []

        for k, v in self.config_dict_.items():
            k_split = k.split('.')
            model_name = k_split[-1]
            algo = {}
            algo['name'] = model_name
            algo['path'] = ".".join(k_split[:-1])
            logger.debug('Checking ML: ' + model_name)
            # get a dictionary of hyperparameters and their values
            hyperparam_dict = v['params']
            if "static_parameters" in v.keys():
                self.static_parameters[model_name] = v["static_parameters"]
            else:
                self.static_parameters[model_name] = {}

            all_hyperparam_combos = list(ParameterGrid(hyperparam_dict))
            #print('\thyperparams: ',hyperparam_dict)
            logger.debug(
                '{} hyperparameter combinations for {}'.format(
                    len(all_hyperparam_combos), model_name)
                    )
            # print(all_hyperparam_combos)

            for ahc in all_hyperparam_combos:
                if 'invalid_params_comb' in v.keys():
                    if not self._valid_combo(
                            ahc, v['invalid_params_comb']):
                        continue
                result.append({'algorithm': model_name,
                               'category': self.mode,
                               'parameters': ahc,
                               'alg_name': model_name})

            self.algorithms.append(algo)


        # convert to dataframe, making sure there are no duplicates
        all_ml_p = pd.DataFrame(result)
        tmp = all_ml_p.copy()
        tmp['parameters'] = tmp['parameters'].apply(str)
        assert (len(all_ml_p) == len(tmp.drop_duplicates()))

        if (len(all_ml_p) > 0):
            logger.info(str(len(all_ml_p)) + ' ml-parameter options loaded')
            logger.info('_get_all_ml_p() algorithms:' +
                        str(all_ml_p.algorithm.unique()))
        else:
            logger.error('_get_all_ml_p() parsed no results')

        return all_ml_p
    # -----------------
    # Init methods
    # -----------------

    def _initilize_recommenders(self, rec_class):
        """
        Initilize recommender
        """
        # default supervised learning recommender settings

        self.REC_ARGS = {'metric': self.metric_,
                            'ml_type': self.ml_type,
                            'random_state': self.random_state}

        # add static_parameters for each ML methods
        self.static_parameters = {}

        # set the registered ml parameters in the recommenders
        ml_p = self._get_all_ml_p()

        self.REC_ARGS['ml_p'] = ml_p

        if self.knowledgebase and self.kb_metafeatures: #both are not None
            self.kb_ = self.knowledgebase
            self.mf_ = self.kb_metafeatures
        elif self.knowledgebase or self.kb_metafeatures: # one of them are missing
            raise ValueError(
                "please provide both knowledgebase and kb_metafeatures")

        resultsData = self._load_kb()
        logger.info('Knowledgebase loaded')

        if self.serialized_rec:
            head_tail = os.path.split(self.serialized_rec)
            self.REC_ARGS['serialized_rec_filename'] = head_tail[1]
            self.REC_ARGS['serialized_rec_directory'] = head_tail[0]
            self.REC_ARGS['load_serialized_rec'] = "always"
            self.REC_ARGS['knowledgebase_results'] = resultsData

        # Create supervised learning recommenders
        if self.rec_class is not None:
            self.rec_engine = self.rec_class(
                **self.REC_ARGS)
        else:
            self.rec_engine = SVDRecommender(
                **self.REC_ARGS)

        if not self.serialized_rec:
            self.rec_engine.update(
                resultsData, self.dataset_mf_cache, source='pennai')


        logger.debug("recomendation engines initilized。 ")


    def _load_kb(self):
        """Bootstrap the recommenders with the knowledgebase."""
        logger.info('loading pmlb knowledgebase')

        kb = load_knowledgebase(
            resultsFiles=[self.kb_],
            metafeaturesFiles=[self.mf_]
        )

        all_df_mf = kb['metafeaturesData'].set_index('_id', drop=False)

        # keep only metafeatures with results
        df = all_df_mf.loc[kb['resultsData'][self.mode]['_id'].unique()]
        self.dataset_mf_cache = self.dataset_mf_cache.append(df)

        return kb['resultsData'][self.mode]

    # -----------------
    # Utility methods
    # -----------------

    # todo ! to working yet

    def _get_results_metafeatures(self):
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

        return df

    def _update_recommender(self, new_results_df):
        """Update recommender models based on new experiment results in
        new_results_df.
        """
        if len(new_results_df) >= 1:
            new_mf = self._get_results_metafeatures()
            self.rec_engine.update(new_results_df, new_mf)
            logger.debug(time.strftime("%Y %I:%M:%S %p %Z", time.localtime()) +
                        ': recommender updated')

    # -----------------
    # Syncronous actions an AI request can take
    # -----------------
    def _generate_recommendations(self):
        """

        :returns list of maps that represent request payload objects
        """
        logger.debug(
            "_generate_recommendations({},{})".format(
                self.datasetId, self.n_recs_))

        recommendations = []

        ml, p, ai_scores = self.rec_engine.recommend(
            dataset_id=self.datasetId,
            n_recs=self.n_recs_,
            dataset_mf=self.meta_features)

        for alg, params, score in zip(ml, p, ai_scores):

            recommendations.append({'dataset_id': self.datasetId,
                                    'algorithm': alg,
                                    'parameters': params,
                                    'ai_score': score,
                                    })

        return recommendations

    def _stop_by_max_time_mins(self):
        """Stop optimization process once maximum minutes have elapsed."""
        if self.max_time_mins:
            total_mins_elapsed = (
                datetime.now() - self._start_datetime).total_seconds() / 60.
            return total_mins_elapsed >= self.max_time_mins
        else:
            return False

    def _stop_by_stopping_criteria(self):
        """Stop optimization process once stopping_criteria have reached."""

        if self.stopping_criteria is not None:
            if self.best_score_iter > self.best_score_init:
                # a new loop
                self.best_score_init = self.best_score_iter
                # iteration without improvments
                self.bad_iteration = 0
            else:
                self.bad_iteration += 1

            if self.bad_iteration >= self.stopping_criteria:
                return True
            else:
                return False

        else:
            return False

    def fit(self, X, y):
        """Trains PennAI on X,y.

        Parameters
        ----------
        X: array-like {n_samples, n_features}
            Feature matrix of the training set
        y : ndarray of shape (n_samples,)
            Target of the training set

        Returns
        -------
        self : object

        """

        self._fit_init()


        # generate datasetId based on import X, y
        # make pd.DataFrameBased on X, y
        if isinstance(X, np.ndarray):
            columns = ["Feature_{}".format(i) for i in range(X.shape[1])]
            features = pd.DataFrame(X, columns=columns)
        if "pennai_target" in features.columns:
            raise ValueError(
                'The column name "pennai_target" is not allowed in X, '
                'please check your dataset and remove/rename that column')

        # get meta_features based on X, y
        self.meta_features = self._generate_metafeatures_from_X_y(features, y)
        # save all results
        self.recomms = []

        for i, x in enumerate(self.algorithms):
            logger.debug('Importing ML methods: ' + str(x['name']))
            # import scikit obj from string
            exec('from {} import {}'.format(x['path'], x['name']))
        self._start_datetime = datetime.now()

        for i in range(self.n_iters):
            # stop by max_time if step
            if self._stop_by_max_time_mins():
                logger.info(
                    "Stop optimization process since"
                    " {} minutes have elapsed.".format(
                        self.max_time_mins))
                break


            logger.info("Start iteration #{}".format(i + 1))
            recommendations = self._generate_recommendations()
            new_results = []
            ests = []
            ress = []

            for r in recommendations:
                logger.debug(r)
                # evaluate each recomendation
                # convert string to scikit-learn obj
                est = eval(r['algorithm'])()

                # convert str to bool/none
                params = r['parameters']
                for k, v in params.items():
                    if isinstance(v, str):
                        new_v = _bool_or_none(v)
                        params[k] = new_v
                # add staticparameters
                params.update(self.static_parameters[r['algorithm']])
                avail_params = est.get_params()

                if 'random_state' in avail_params and self.random_state:
                    params['random_state'] = self.random_state

                est.set_params(**params)
                # initilize a result
                res = {
                    '_id': self.datasetId,
                    'algorithm': r['algorithm'],
                    'parameters': params,
                }
                ests.append(est)
                ress.append(res)
            # Parallel computing step
            scores_list = Parallel(n_jobs=self.n_jobs)(delayed(
                cross_val_score)(estimator=est,
                                 X=X,
                                 y=y,
                                 cv=10,
                                 scoring=self.scoring_)
                for est in ests)
            # summary result
            for res, scores in zip(ress, scores_list):
                res[self.metric_] = np.mean(scores)
                new_results.append(res)

            self.recomms += new_results

            new_results_df = pd.DataFrame(new_results)
            # get best score in each iteration
            self.best_score_iter = new_results_df[self.metric_].max()
            # update recommender each iteration
            self._update_recommender(new_results_df)
            # get best score in new results in this iteration

            # stop by stopping_criteria
            if self._stop_by_stopping_criteria():
                logger.info(
                    "Stop optimization process since recommendations"
                    " did not imporve over {} iterations.".format(
                        self.stopping_criteria))
                break

        # convert to pandas.DataFrame from finalize result
        self.recomms = pd.DataFrame(self.recomms)
        self.recomms.sort_values(
            by=self.metric_,
            ascending=False,
            inplace=True
        )
        self.best_result_score = self.recomms[self.metric_].values[0]
        self.best_result = self.recomms.iloc[0]
        self.best_algorithm = self.best_result['algorithm']
        self.best_params = self.best_result['parameters']

        if not self.ensemble:
            self.estimator = eval(self.best_algorithm)()
            self.estimator.set_params(**self.best_params)
        else:
            ensemble_ests = self.recomms['algorithm'].values[:self.ensemble]
            ests_params = self.recomms['parameters'].values[:self.ensemble]
            estimators = []
            for est, params in zip(ensemble_ests, ests_params):
                estimator = eval(est)()
                estimator.set_params(**params)
                est_name = 'clf' + str(len(estimators))
                estimators.append((est_name, estimator))
            if self.mode == "classification":
                self.estimator = VotingClassifier(estimators=estimators,
                                                  voting='hard',
                                                  n_jobs=self.n_jobs)
            else:
                self.estimator = VotingRegressor(estimators=estimators,
                                                 voting='hard',
                                                 n_jobs=self.n_jobs)

        self.estimator.fit(X, y)
        logger.info("Best model: {}".format(self.estimator))

        return self

    def predict(self, X):
        """
        Predictions for X.

        Parameters
        ----------
        X: array-like {n_samples, n_features}
            Feature matrix of the testing set
        Returns
        -------
        y : ndarray of shape (n_samples,)
            The predicted target.
        """
        if not hasattr(self, 'estimator'):
            raise RuntimeError(
                'A estimator has not yet been optimized.'
                ' Please call fit() first.'
                )
        return self.estimator.predict(X)

    def score(self, X, y):
        """Return the score on the given testing data using the user-specified
        scoring function.
        Parameters
        ----------
        X: array-like {n_samples, n_features}
            Feature matrix of the testing set
        y : ndarray of shape (n_samples,)
            Target of the testing set
        Returns
        -------
        accuracy_score: float
            The estimated test set accuracy
        """
        if not hasattr(self, 'estimator'):
            raise RuntimeError(
                'A estimator has not yet been optimized.'
                ' Please call fit() first.'
                )
        scorer = SCORERS[self.scoring_]
        score = scorer(
            self.estimator,
            X,
            y
        )
        return score

    #def save(self, filename):
        #"""save pickled recommender.
        #Parameters
        #----------
        #filename: string
            #Filename for saving pickled recommender.

        #Returns
        #-------
        #None
        #"""
        #self.rec_engine.save(filename)


def _bool_or_none(val):
    """Convert string to boolean type/None.
    Parameters
    ----------
    val: string
        Value of a parameter in string type

    Returns
    -------
    _: boolean or None
        Converted value in boolean type
    """
    if (val.lower() == 'true'):
        return True
    elif (val.lower() == 'false'):
        return False
    elif (val.lower() == 'none'):
        return None
    else:
        return val



class PennAIClassifier(PennAI, ClassifierMixin):
    """PennAI engine for classification tasks.

    Read more in the :ref:`userguide_sklearn_api`.

    Parameters
    ----------
    rec_class: ai.recommender.base.BaseRecommender or None
        Recommender to use in the PennAI engine.
        if it is None, PennAI will use SVDRecommender by default.
    verbose: int
        0 quite, 1 info, 2 debug
    serialized_rec: string or None
        Path of the file to save/load a serialized recommender.
        If the filename is not provided, the default filename based
        on the recommender type, and metric, and knowledgebase used.
    scoring: str
        scoring for evaluating recommendations. It could be "accuracy",
        "balanced_accuracy", "f1", "f1_macro"
    n_recs: int
        number of recommendations to make for each iteration
    n_iters: int
        total number of iterations
    knowledgebase: str
        input file for knowledgebase
    kb_metafeatures: str
        input file for metafeature
    config_dict: python dictionary
        dictionary for hyperparameter search space for all ML algorithms
    ensemble: int
        if it is a integer N, PennAI will use VotingClassifier/VotingRegressor
        to ensemble top N best models into one model.
    max_time_mins:
        maximum time in minutes that PennAI can run
    stopping_criteria: int
        A number of iterations without improvments in best metric.
        Stop recommendations early if the best metric
        does not improve in the number of iterations iterations.
    random_state: int
        random state for recommenders
    n_jobs: int
        The number of cores to dedicate to computing the scores with joblib.
        Assigning this parameter to -1 will dedicate as many cores as
        are available on your system.

    """
    mode = "classification"
    scoring_ = "accuracy"
    ml_type = "classifier"
    config_dict_ = classifier_config_dict
    kb_ = GitHub_URL + "sklearn-benchmark-data-knowledgebase-r6.tsv.gz"
    mf_ = GitHub_URL + "pmlb_classification_metafeatures.csv.gz"


class PennAIRegressor(PennAI, RegressorMixin):
    """PennAI engine for regression tasks.

    Read more in the :ref:`userguide_sklearn_api`.

    Parameters
    ----------
    rec_class: ai.recommender.base.BaseRecommender or None
        Recommender to use in the PennAI engine.
        if it is None, PennAI will use SVDRecommender by default.
    verbose: int
        0 quite, 1 info, 2 debug
    serialized_rec: string or None
        Path of the file to save/load a serialized recommender.
        If the filename is not provided, the default filename based
        on the recommender type, and metric, and knowledgebase used.
    scoring: str
        scoring for evaluating recommendations. It could be "r2",
        "explained_variance", "neg_mean_squared_error"
    n_recs: int
        number of recommendations to make for each iteration
    n_iters: int
        total number of iterations
    knowledgebase: str
        input file for knowledgebase
    kb_metafeatures: str
        input file for metafeature
    config_dict: python dictionary
        dictionary for hyperparameter search space for all ML algorithms
    ensemble: int
        if it is a integer N, PennAI will use VotingClassifier/VotingRegressor
        to ensemble top N best models into one model.
    max_time_mins:
        maximum time in minutes that PennAI can run
    stopping_criteria: int
        A number of iterations without improvments in best metric.
        Stop recommendations early if the best metric
        does not improve in the number of iterations iterations.
    random_state: int
        random state for recommenders
    n_jobs: int
        The number of cores to dedicate to computing the scores with joblib.
        Assigning this parameter to -1 will dedicate as many cores as
        are available on your system.

    """
    mode = "regression"
    scoring_ = "neg_mean_squared_error"
    ml_type = "regressor"
    config_dict_ = regressor_config_dict
    kb_ = GitHub_URL + "pmlb_regression_results.tsv.gz"
    mf_ = GitHub_URL + "pmlb_regression_metafeatures.csv.gz"
