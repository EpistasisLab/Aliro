"""
Recommender system for Penn AI.
"""
import pandas as pd
# import json 
# import urllib.request, urllib.parse
from .base import BaseRecommender
#from ..metalearning import get_metafeatures
from sklearn.preprocessing import RobustScaler 
from sklearn.pipeline import Pipeline
import numpy as np
from collections import defaultdict, OrderedDict
import pdb
from surprise import Reader, Dataset, mySVD
# import pyximport
# pyximport.install()
# from .svdedit import mySVD
from collections import defaultdict
import itertools as it

class SVDRecommender(BaseRecommender):
    """Penn AI SVD recommender.
    Recommends machine learning algorithms and parameters using the SVD++ algorithm.
        - stores ML + P and every dataset.
        - learns a matrix factorization on the non-missing data.
        - given a dataset, estimates the rankings of all ML+P and returns the top n_recs. 

    Parameters
    ----------
    ml_type: str, 'classifier' or 'regressor'
        Recommending classifiers or regressors. Used to determine ML options.
    
    metric: str (default: accuracy for classifiers, mse for regressors)
        The metric by which to assess performance on the datasets.
    """
    def __init__(self, ml_type='classifier', metric=None, ml_p=None, datasets=None): 
        """Initialize recommendation system."""
        if ml_type not in ['classifier', 'regressor']:
            raise ValueError('ml_type must be "classifier" or "regressor"')

        self.ml_type = ml_type
        
        if metric is None:
            self.metric = 'bal_accuracy' if self.ml_type == 'classifier' else 'mse'
        else:
            self.metric = metric

        # get ml+p combos
        self.ml_p = ml_p.drop_duplicates()
        # get dataset names
        self.datasets = datasets
        # machine learning - parameter combinations
        self.mlp_combos = self.ml_p['algorithm']+'|'+self.ml_p['parameters']
        # store results
        self.results_df = pd.DataFrame()
        # reader for translating btw PennAI results and Suprise training set
        self.reader = Reader(rating_scale=(0,1))
        # algo is the online Surprise-based rec system
        self.algo = mySVD()
        
        # maintain a set of dataset-algorithm-parameter combinations that have already been 
        # evaluated
        self.trained_dataset_models = set()

    def update(self, results_data, results_mf=None):
        """Update ML / Parameter recommendations based on overall performance in results_data.

        :param results_data: DataFrame with columns corresponding to:
                'dataset'
                'algorithm'
                'parameters'
                self.metric
        :param results_mf: metafeatures for the datasets in results_data 
        """

        # update trained dataset models
        self.set_trained_dataset_models(results_data)

        # update internal model
        self.update_model(results_data)

    def set_trained_dataset_models(self, results_data):
        results_data.loc[:, 'dataset-algorithm-parameters'] = (
                                       results_data['dataset'].values + '|' +
                                       results_data['algorithm'].values + '|' +
                                       results_data['parameters'].values)

        # get unique dataset / parameter / classifier combos in results_data
        d_ml_p = results_data['dataset-algorithm-parameters'].unique()
        self.trained_dataset_models.update(d_ml_p)

    def update_training_data(self,results_data):
        """Fill in new data from the results"""
        results_data.loc[:, 'algorithm-parameters'] =  (results_data['algorithm'].values + '|' +
                                                        results_data['parameters'].values)
        results_data.rename(columns={self.metric:'score'},inplace=True)
        self.results_df = self.results_df.append(results_data[['algorithm-parameters',
                                                              'dataset','score']]
                                                ).drop_duplicates()

        data = Dataset.load_from_df(self.results_df[['dataset', 'algorithm-parameters', 
                                                     'score']], self.reader)
        # build training set from the data
        self.trainset = data.build_full_trainset()

    def update_model(self,results_data):
        """Stores new results and updates SVD."""
        # print('updating model')
        
        self.update_training_data(results_data)

        self.algo.partial_fit(self.trainset)
        
        # print('model updated') 

    def recommend(self, dataset_id, n_recs=1, dataset_mf = None):
        """Return a model and parameter values expected to do best on dataset.

        Parameters
        ----------
        dataset_id: string
            ID of the dataset for which the recommender is generating recommendations.
        n_recs: int (default: 1), optional
            Return a list of length n_recs in order of estimators and parameters expected to do 
            best.
        """
        # TODO: raise error if dataset_mf is None 
        try:
            predictions = []
            for alg_params in self.mlp_combos:
                # this prevents repeat recommendations
                if dataset_id+'|'+alg_params not in self.trained_dataset_models:  
                    predictions.append(self.algo.predict(dataset_id, alg_params,clip=False))
            
            ml_rec, p_rec, score_rec = self.get_top_n(predictions, n_recs)
            
            # for (m,p,r) in zip(ml_rec, p_rec, score_rec):
            #     print('ml_rec:', m, 'p_rec', p, 'score_rec',r)
            
        except Exception as e:
            print( 'error running self.best_model_prediction for',dataset_id)
            raise e 

        # update the recommender's memory with the new algorithm-parameter combos 
        # that it recommended
        self.trained_dataset_models.update(
                                    ['|'.join([dataset_id, ml, p])
                                    for ml, p in zip(ml_rec, p_rec)])

        return ml_rec, p_rec, score_rec

    def get_top_n(self,predictions, n=10):
        '''Return the top-N recommendation for each user from a set of predictions.
        
        Args:
            predictions(list of Prediction objects): The list of predictions, as
                returned by the test method of an algorithm.
            n(int): The number of recommendation to output for each user. Default
                is 10.

        Returns:
            ml recs, parameter recs, and their scores in three lists
        '''

        # grabs the ml ids and their estimated scores for this dataset 
        top_n = [] 
        for uid, iid, true_r, est, _ in predictions:
            top_n.append((iid, est))

        top_n = sorted(top_n, key=lambda x: x[1], reverse=True)[:n]
        
        ml_rec = [n[0].split('|')[0] for n in top_n]
        p_rec = [n[0].split('|')[1] for n in top_n]
        score_rec = [n[1] for n in top_n]
        return ml_rec, p_rec, score_rec 
