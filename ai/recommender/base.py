"""
Recommender system for Penn AI.

"""
from sklearn.tree import DecisionTreeClassifier
import numpy as np
import pandas as pd
from .dataset_describe import Dataset
from collections import OrderedDict
import json
import urllib
import requests
from pandas.io.json import json_normalize
import pdb

class Recommender():
    """Penn AI recommender.

    Parameters
    ----------
    ml: object, default: None
        the machine learning algorithm used as a meta-model. unused if
        metafeatures are not included

    ml_type: str, 'classifier' | 'regressor'
        recommending classifiers or regressors. used to determine ML
        options.

    metric: str, default: 'bal_accuracy'
        the metric by which to assess performance in the data

    """

    def __init__(self,ml=None,ml_type = 'classifier',
                 metric='accuracy'):
        """initialize recommendation system."""
        self.ml = ml
        self.ml_type = ml_type
        self.metric = metric

        if self.ml == None:
            self.ml = DecisionTreeClassifier()

        if self.ml_type == 'classifier':
            self.models = ['LogisticRegression',
                             'DecisionTreeClassifier',
                             'KNeighborsClassifier',
                             'SVC',
                             'RandomForestClassifier',
                             'GradientBoostingClassifier']
        elif self.ml_type == 'regresssor':
            self.models = ['ElasticNet',
                             'DecisionTreeRegressor`',
                             'NearestNeighborRegressor',
                             'SVR',
                             'RandomForestRegressor',
                             'GradientBoostingRegressor']
        else:
            raise ValueError('ml_type must be ''classifier'' '
                             'or ''regressor''')

        # empty scores pandas series
        self.scores = pd.Series()
        # number of datasets trained on so far
        self.w = 0
        # maintain a set of dataset-algorithm-parameter combinations that have
        # https://github.com/EpistasisLab/penn-ai.gitalready been evaluated
        self.trained_dataset_models = set()

    def update(self,results_data,learner=None,data_name=None):
        """update meta-models by incorporating new data.

        Parameters
        ----------
        results_data: DataFrame with at least these columns:
                'algorithm'
                'parameters'
                self.metric
        """
        self.fit(results_data)

    def recommend(self,dataset=None,dataset_id=None,n_recs=1):
        """return a model and parameter values expected to do best on
        dataset.
        n_recs (default: 1): optionally, return a list of length n_recs
        in order of estimators and parameters expected to do best."""

        # return ML+P for best average y
        try:
            rec = self.scores.sort_values(ascending=False).index.values

            # if a dataset is specified, do not make recommendations for
            # algorithm-parameter combos that have already been run
            if dataset_id is not None:
                rec = [r for r in rec if dataset_id + '|' + r not in
                       self.trained_dataset_models]

            ml_rec = [r.split('|')[0] for r in rec]
            p_rec = [r.split('|')[1] for r in rec]
            rec_score = [self.scores[r] for r in rec]
        except AttributeError:
            print('rec:',rec)
            print('self.scores:',self.scores)
            print('self.w:',self.w)
            raise AttributeError

        # update the recommender's memory with the new algorithm-parameter
        # combos that it recommended
        ml_rec = ml_rec[:n_recs]
        p_rec = p_rec[:n_recs]
        rec_score = rec_score[:n_recs]

        if dataset_id is not None:
            self.trained_dataset_models.update(
                                        ['|'.join([dataset_id, ml, p])
                                        for ml, p in zip(ml_rec, p_rec)])

        return ml_rec, p_rec, rec_score
        # # get metafeatures of the dataset
        # metafeatures = self.metafeatures(dataset)
        # scores = np.array()
        # for ml in self.learners:
        #     score = ml.predict(dataset)
        #     self.

    def get_metafeatures(self,dataset):
        """returns a dict of metafeatures for this data.
        Parameters
        ----------
        data: DataFrame including:
            a 'class' column with dependent variable,
        """

        dataset = Dataset(data, dependent_col = 'class',
                          prediction_type='classification')

        meta_features = OrderedDict()
        for i in dir(dataset):
            result = getattr(dataset, i)
            if (not i.startswith('__') and not i.startswith('_')
                and hasattr(result, '__call__')):
                meta_features[i] = result()
        # meta_features['dataset'] = data['dataset']
        return meta_features

    def fit(self,results_data):
        """Fit ML / Parameter recommendation based on overall performance
        in results_data.
        Updates self.scores

        Parameters
        ----------
        results_data: DataFrame with columns corresponding to:
                'algorithm'
                'parameters'
                self.metric
        """
        # make combined data columns of datasets, classifiers, and parameters
        results_data.loc[:,'algorithm-parameters'] = (
                                       results_data['algorithm'].values + '|' +
                                       results_data['parameters'].values)

        results_data.loc[:,'dataset-algorithm-parameters'] = (
                                       results_data['dataset'].values + '|' +
                                       results_data['algorithm'].values + '|' +
                                       results_data['parameters'].values)

        # get unique dataset / parameter / classifier combos in results_data
        ml_p = results_data['algorithm-parameters'].unique()
        d_ml_p = results_data['dataset-algorithm-parameters'].unique()
        self.trained_dataset_models.update(d_ml_p)

        # get average balanced accuracy by classifier-parameter combo
        new_scores = results_data.groupby(('algorithm' +
                                           '-parameters'))[self.metric].mean()
        new_weights = results_data.groupby('algorithm' + '-parameters').size()
        # update scores
        self.update_scores(new_scores, new_weights)

    def is_number(self,s):
        """check if parameter is a number."""
        try:
            float(s)
            return True
        except ValueError:
            return False

    def update_scores(self,new_scores,new_weights):
        """update scores based on new_scores"""
        # pdb.set_trace()
        new_ind = new_scores.index.values
        if len(self.scores.index)==0:
            self.scores = new_scores
            self.w = new_weights
        else:
            for n in new_ind:
                if n in self.scores.index.values:
                    step = new_weights[n]/(self.w[n]+new_weights[n])
                    self.scores.loc[n] = (self.scores[n] +
                                          step*(new_scores[n]-self.scores[n]))
                else:
                    self.scores.loc[n] = new_scores[n]
            # update weights
            self.w = self.w.add(new_weights, fill_value=0)
