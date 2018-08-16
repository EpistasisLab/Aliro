"""
Recommender system for Penn AI.
"""
import pandas as pd
import json 
import urllib.request, urllib.parse
from .base import BaseRecommender
from ..metalearning import get_metafeatures
from sklearn.ensemble import RandomForestClassifier

class MetaRecommender(BaseRecommender):
    """Penn AI meta recommender.

    Recommends machine learning algorithms and parameters based on their average performance
    across all evaluated datasets.

    Parameters
    ----------
    ml_type: str, 'classifier' or 'regressor'
        Recommending classifiers or regressors. Used to determine ML options.

    metric: str (default: accuracy for classifiers, mse for regressors)
        The metric by which to assess performance on the datasets.

    """

    def __init__(self, ml_type='classifier', metric=None, db_path='',api_key=''):
        """Initialize recommendation system."""
        if ml_type not in ['classifier', 'regressor']:
            raise ValueError('ml_type must be "classifier" or "regressor"')

        self.ml_type = ml_type

        if metric is None:
            self.metric = 'accuracy' if self.ml_type == 'classifier' else 'mse'
        else:
            self.metric = metric
        # path for grabbing dataset metafeatures
        self.mf_path = '/'.join([db_path,'api/datasets'])
        print('mf_path:',self.mf_path)
        self.api_key = api_key
        self.static_payload = {'apikey':self.api_key}

        # training data
        self.training_data = pd.DataFrame()
        # store metafeatures of datasets that have been seen
        self.dataset_metafeatures = pd.DataFrame(columns=['dataset'])
        # maintain a set of dataset-algorithm-parameter combinations that have already been 
        # evaluated
        self.trained_dataset_models = set()
        # TODO: add option for ML estimator

    def update(self, results_data):
        """Update ML / Parameter recommendations based on overall performance in results_data.

        Updates self.scores

        Parameters
        ----------
        results_data: DataFrame with columns corresponding to:
                'dataset'
                'algorithm'
                'parameters'
                self.metric
        """
        # TODO: load metafeatures of datasets, create training data, fit model with warm restart
        # # one hot encode algorith-parameter combinations?
        # regress on scores for each dataset

        # make combined data columns of datasets, classifiers, and parameters
        results_data.loc[:, 'algorithm-parameters'] = (
                                       results_data['algorithm'].values + '|' +
                                       results_data['parameters'].values)

        results_data.loc[:, 'dataset-algorithm-parameters'] = (
                                       results_data['dataset'].values + '|' +
                                       results_data['algorithm'].values + '|' +
                                       results_data['parameters'].values)

        for d in results_data['dataset'].unique():
            if d not in self.dataset_metafeatures['dataset']:
                # fetch metafeatures from server for dataset and append
                print('fetching data for', d)
                 
                payload={}
                # payload = {'metafeatures'}
                payload.update(self.static_payload)
                req = urllib.request.Request((self.mf_path+'/'+d).encode(), data=payload)
                r = urllib.request.urlopen(req)
                
                data = json.loads(r.read().decode(r.info().get_param('charset')
                                          or 'utf-8'))

                # data = json.loads('/'.join([self.mf_path,d,'metafeatures.json']))
                print(data)

        # get unique dataset / parameter / classifier combos in results_data
        ml_p = results_data['algorithm-parameters'].unique()
        d_ml_p = results_data['dataset-algorithm-parameters'].unique()
        self.trained_dataset_models.update(d_ml_p)

        # update internal model
        self.update_model()
        
    def recommend(self, dataset_id=None, n_recs=1):
        """Return a model and parameter values expected to do best on dataset.

        Parameters
        ----------
        dataset_id: string
            ID of the dataset for which the recommender is generating recommendations.
        n_recs: int (default: 1), optional
            Return a list of length n_recs in order of estimators and parameters expected to do best.
        """
        # TODO: predict scores over many variations of ML+P and pick the best
        # return ML+P for best average y
        try:
            rec = self.best_model_prediction(dataset_id, n_recs)
            # if a dataset is specified, do not make recommendations for
            # algorithm-parameter combos that have already been run
            if dataset_id is not None:
                rec = [r for r in rec if dataset_id + '|' + r not in
                       self.trained_dataset_models]

            ml_rec = [r.split('|')[0] for r in rec]
            p_rec = [r.split('|')[1] for r in rec]
            rec_score = [self.scores[r] for r in rec]
        except AttributeError:
            print('rec:', rec)
            print('self.scores:', self.scores)
            print('self.w:', self.w)
            raise AttributeError

        # update the recommender's memory with the new algorithm-parameter combos that it recommended
        ml_rec = ml_rec[:n_recs]
        p_rec = p_rec[:n_recs]
        rec_score = rec_score[:n_recs]

        if dataset_id is not None:
            self.trained_dataset_models.update(
                                        ['|'.join([dataset_id, ml, p])
                                        for ml, p in zip(ml_rec, p_rec)])

        return ml_rec, p_rec, rec_score

    def update_model(self):
        """Trains model on datasets and metafeatures."""
        print('update model')
    def best_model_prediction(self,dataset_id, n_recs=1):
        """Predict scores over many variations of ML+P and pick the best"""
