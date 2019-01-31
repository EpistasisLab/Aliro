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
from sklearn.neighbors import NearestNeighbors

class KNNMetaRecommender(BaseRecommender):
    """Penn AI KNN meta recommender.
    Recommends machine learning algorithms and parameters as follows:
        - store the best ML + P on every dataset.
        - given a new dataset, measure its distance to all results in metafeature space. 
        - recommend ML + P with best performance on closest dataset.

    Parameters
    ----------
    ml_type: str, 'classifier' or 'regressor'
        Recommending classifiers or regressors. Used to determine ML options.
    
    metric: str (default: accuracy for classifiers, mse for regressors)
        The metric by which to assess performance on the datasets.
    """
    def __init__(self, ml_type='classifier', metric=None, ml_p = None): #, db_path='',api_key=''):
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
        # lookup table: dataset name to best ML+P
        self.best_mlp = pd.DataFrame(columns=['dataset','algorithm','parameters','score'])
        self.best_mlp.set_index('dataset',inplace=True)
          
        # local dataframe of datasets and their metafeatures
        self.dataset_mf = pd.DataFrame()
      
        # maintain a set of dataset-algorithm-parameter combinations that have already been 
        # evaluated
        self.trained_dataset_models = set()

    def update(self, results_data, results_mf):
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

        # save a copy of the results_mf with NaNs filled with zero 
        self.dataset_mf = results_mf.fillna(0.0) 
        # print('setting self.dataset_mf to ',self.dataset_mf)

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

    def update_model(self,results_data):
        """Stores best ML-P on each dataset."""
        # print('updating model')
        for d,dfg in results_data.groupby('dataset'):
            if (len(self.best_mlp) == 0 or
                d not in self.best_mlp.index or
                dfg[self.metric].max() > self.best_mlp.loc[d,'score']):
                self.best_mlp.loc[d,'score'] = dfg[self.metric].max()
                dfg = dfg.reset_index()
                idx = dfg[self.metric].idxmax()
                # print('dfg:\n',dfg)
                print('new best for',d,':',dfg.loc[idx,'algorithm'],'idx:',idx)
                self.best_mlp.loc[d,'algorithm'] = dfg.loc[idx,'algorithm']
                self.best_mlp.loc[d,'parameters'] = dfg.loc[idx,'parameters']
            else:
                print('skipping',d)
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
            ml_rec, p_rec, rec_score = self.best_model_prediction(dataset_id, 
                                                                  dataset_mf)
            if len(ml_rec) < n_recs: 
                print('len(ml_rec)=',len(ml_rec),'recommending random')
            while len(ml_rec) < n_recs:
                # add random ml_p recommendations until n_recs is met
                new_ml_rec = np.random.choice(self.ml_p['algorithm'].unique())
                new_p_rec = np.random.choice(self.ml_p.loc[self.ml_p['algorithm']==new_ml_rec]
                                              ['parameters'].unique())
                if (dataset_id + '|' + new_ml_rec + '|' + new_p_rec 
                        not in self.trained_dataset_models):
                    ml_rec.append(new_ml_rec)
                    p_rec.append(new_p_rec)
                    rec_score.append(np.nan)

            # ml_rec, p_rec, rec_score = self.filter_repeats(dataset_id, ml_rec, p_rec, rec_score,
            #         n_recs)

            # for (m,p,r) in zip(ml_rec, p_rec, rec_score):
            #     print('ml_rec:', m, 'p_rec', p, 'rec_score',r)
            ml_rec, p_rec, rec_score = ml_rec[:n_recs], p_rec[:n_recs], rec_score[:n_recs]
            assert(len(ml_rec) == n_recs)
            
        except Exception as e:
            print( 'error running self.best_model_prediction for',dataset_id)
            print('ml_rec:', ml_rec)
            print('p_rec', p_rec)
            print('rec_score',rec_score)
            raise e 

        # update the recommender's memory with the new algorithm-parameter combos 
        # that it recommended

        self.trained_dataset_models.update(
                                    ['|'.join([dataset_id, ml, p])
                                    for ml, p in zip(ml_rec, p_rec)])

        return ml_rec, p_rec, rec_score

    def filter_repeats(self, dataset_id, ml_rec, p_rec, rec_score, n_recs):
        """Uses trained_dataset_models to filter recs that have already been run"""
        # Filter recommendations for
        # algorithm-parameter combos that have already been run
        rec = ['|'.join([dataset_id, ml, p]) for ml, p in zip(ml_rec, p_rec)]
        try:
            frec,idx = zip(*((r,i) for i,r in enumerate(rec) 
                             if r not in self.trained_dataset_models))
        except ValueError as e:
            print("WARNING: can't filter results, probably all recommmendations are repeats")
            return ml_rec, p_rec, rec_score

        # print('rec:',rec) 
        # print('idx:',idx) 
        if len(frec) >= n_recs:
            ml_rec = [r.split('|')[1] for r in frec]
            p_rec = [r.split('|')[2] for r in frec]
            rec_score = [rec_score[i] for i in idx]
        else:
            print("WARNING: can't filter recommendations, possibly repeating")
        return ml_rec, p_rec, rec_score

    def best_model_prediction(self, dataset_id, df_mf, n_recs=1):
        """Predict scores over many variations of ML+P and pick the best"""
        # get dataset metafeatures
        # df_mf = self.get_metafeatures(dataset_id) 
        mf = df_mf.drop('dataset',axis=1).fillna(0.0).values.flatten()

        # compute the neighbors of past results 
        nbrs = NearestNeighbors(n_neighbors=len(self.dataset_mf), algorithm='ball_tree')
        # print('fitting nbrs to self.dataset_mf with shape',
        #       self.dataset_mf.values.shape)
        rs = RobustScaler()
        X = rs.fit_transform(self.dataset_mf.values)
        nbrs.fit(X)
        # find n_recs nearest neighbors to new dataset
        # print('querying neighbors with mf of shape',mf.shape)
        distances,indices = nbrs.kneighbors(rs.transform(mf.reshape(1,-1)))
        # print('distances:',distances)
        # print('indices:',indices)
        dataset_idx = [self.dataset_mf.index[i] for i in indices[0]]
        # recommend the mlp results closest to the dataset in metafeature space
        ml_recs, p_recs, scores = [],[],[]

        # print('self.best_mlp:',self.best_mlp)
        for i,(d,dist) in enumerate(zip(dataset_idx,distances[0])):   
            if i < 10:
                print('closest dataset:',d,'distance:',dist)
            if dist > 0.0:    # don't recommend based on this same dataset
                alg_params = (self.best_mlp.loc[d,'algorithm'] + '|' +
                              self.best_mlp.loc[d,'parameters'])
                # only recommend if not already recommended
                if dataset_id+'|'+alg_params not in self.trained_dataset_models:  
                    ml_recs.append(self.best_mlp.loc[d,'algorithm'])
                    p_recs.append(self.best_mlp.loc[d,'parameters'])
                    scores.append(dist)

        return ml_recs,p_recs,scores
        
