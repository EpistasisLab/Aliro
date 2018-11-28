"""
Recommender system for Penn AI.
"""
import pandas as pd
from .base import BaseRecommender
import numpy as np
import pdb
# from ..api_utils import get_all_ml_p_from_db  

class ExhaustiveRecommender(BaseRecommender):
    """Penn AI random recommender.

    Recommends random machine learning algorithms and parameters from the possible algorithms
    fetched from the server.

    Parameters
    ----------
    ml_type: str, 'classifier' or 'regressor'
        Recommending classifiers or regressors. Used to determine ML options.

    metric: str (default: accuracy for classifiers, mse for regressors)
        The metric by which to assess performance on the datasets.

    db_path: path to the server. 
    """


    def __init__(self, ml_type='classifier', metric=None, db_path='http://lab:5080', api_key='' ):
        """Initialize recommendation system."""
        if ml_type not in ['classifier', 'regressor']:
            raise ValueError('ml_type must be "classifier" or "regressor"')

        self.ml_type = ml_type

        if metric is None:
            self.metric = 'accuracy' if self.ml_type == 'classifier' else 'mse'
        else:
            self.metric = metric

        # ml p options
        self.db_path = db_path
        self.api_key = api_key
        #self.ml_p = get_all_ml_p_from_db('/'.join([db_path,'api/projects']),api_key)
        self.ml_p = get_all_ml_p_from_db('/'.join([db_path,'api/preferences']),api_key)
        self.exhaustive_ml = {}
        #self.ml_p = all_ml_p['algorithm'].values + '|' + all_ml_p['parameters'].values 
        
        # number of datasets trained on so far
        #self.w = 0

        # pull algorithm/parameter combinations from the server. 
        #self.ml_p = self.get_ml_p()

        # maintain a set of dataset-algorithm-parameter combinations that have already been 
        # evaluated
        ml_rec,p_rec=[],[]
        self.exhaustive = {}
        self.exhaustive_n = 0;
        #the index of the last recommended exhaustive experiment
        self.last_n = 0;
        for ml_tmp in  sorted(self.ml_p['algorithm'].unique()):
            for p_tmp in (self.ml_p.loc[self.ml_p['algorithm']==ml_tmp])['parameters']:
                self.exhaustive[self.exhaustive_n] = {}
                self.exhaustive[self.exhaustive_n][0] = ml_tmp
                self.exhaustive[self.exhaustive_n][1] = p_tmp
                self.exhaustive_n = self.exhaustive_n + 1
        self.trained_dataset_models = set()

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

        results_data.loc[:, 'dataset-algorithm-parameters'] = (
                                       results_data['dataset'].values + '|' +
                                       results_data['algorithm'].values + '|' +
                                       results_data['parameters'].values)
        #pdb.set_trace()
        # get unique dataset / parameter / classifier combos in results_data
        #self.ml_p = results_data['algorithm-parameters'].unique()
        d_ml_p = results_data['dataset-algorithm-parameters'].unique()
        self.trained_dataset_models.update(d_ml_p)


    def recommend(self, dataset_id=None, n_recs=1):
        """Return a model and parameter values expected to do best on dataset.

        Parameters
        ----------
        dataset_id: string
            ID of the dataset for which the recommender is generating recommendations.
        n_recs: int (default: 1), optional
            Return a list of len n_recs in order of estimators and parameters expected to do best.
        """

        # return ML+P for best average y
        #print(self.ml_p)
        try:
            ml_rec,p_rec,rec_score=[],[],[]
            rec_not_new = False 
            n=0
            print("recommending " + str(self.last_n) + " to " + str(self.last_n + n_recs - 1))
            while (n < n_recs):
                    next_n = self.last_n + n
                    exhaustive_rec = self.exhaustive[next_n]
                    ml_tmp = exhaustive_rec[0]
                    p_tmp = exhaustive_rec[1]
                    if dataset_id is not None:
                        rec_not_new = (dataset_id + '|' + ml_tmp + '|' + p_tmp in
                                                     self.trained_dataset_models)
                    # if a dataset is specified, do not make recommendations for
                    # algorithm-parameter combos that have already been run
                    if rec_not_new:
                        print(p_tmp)
                        print(str(next_n) + ' not new')
                    else:
                        ml_rec.append(ml_tmp)
                        p_rec.append(p_tmp)
                        rec_score.append(0) 
                    n=n+1
            self.last_n = self.last_n + n_recs
            
            #if dataset_id is not None:
            #    rec = [r for r in rec if dataset_id + '|' + r not in
            #           self.trained_dataset_models]

            #ml_rec = [r.split('|')[0] for r in rec]
            #p_rec = [r.split('|')[1] for r in rec]
            #rec_score = [0 for r in rec]
        except AttributeError:
            print('rec:', rec)
            print('self.scores:', self.scores)
            print('self.w:', self.w)
            raise AttributeError

        if dataset_id is not None:
            self.trained_dataset_models.update(
                                        ['|'.join([dataset_id, ml, p])
                                        for ml, p in zip(ml_rec, p_rec)])

        return ml_rec, p_rec, rec_score
