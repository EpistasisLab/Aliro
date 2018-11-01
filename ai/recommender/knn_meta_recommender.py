"""
Recommender system for Penn AI.
"""
import pandas as pd
import json 
import urllib.request, urllib.parse
from .base import BaseRecommender
#from ..metalearning import get_metafeatures
from xgboost import XGBRegressor
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
    def __init__(self, ml_type='classifier', metric=None, db_path='',api_key=''):
        """Initialize recommendation system."""
        if ml_type not in ['classifier', 'regressor']:
            raise ValueError('ml_type must be "classifier" or "regressor"')

        self.ml_type = ml_type
        
        # path for grabbing dataset metafeatures
        self.mf_path = '/'.join([db_path,'api/datasets'])
        # print('mf_path:',self.mf_path)
        self.api_key = api_key
        self.static_payload = {'apikey':self.api_key}

        if metric is None:
            self.metric = 'bal_accuracy' if self.ml_type == 'classifier' else 'mse'
        else:
            self.metric = metric

        # df of datasets and their metafeatures
        self.dataset_mf = pd.DataFrame()

        # lookup table: dataset name to best ML+P
        self.best_mlp = pd.DataFrame(columns=['dataset','algorithm','parameters','score'])
        self.best_mlp.set_index('dataset',inplace=True)
                
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
        # transform data for learning a model from it 
        self.update_dataset_mf(results_data) 

        # update internal model
        self.update_model(results_data)

    def get_metafeatures(self, d):
        """Fetches dataset metafeatures, returning dataframe."""
        # print('fetching data for', d)
        payload={}
        # payload = {'metafeatures'}
        payload.update(self.static_payload)
        params = json.dumps(payload).encode('utf8')
        # print('full path:', self.mf_path+'/'+d)
        try:
            req = urllib.request.Request(self.mf_path+'/'+d, data=params)
            r = urllib.request.urlopen(req)
            
            data = json.loads(r.read().decode(r.info().get_param('charset')
                                      or 'utf-8'))[0]
        except Exception as e:
            print('exception when grabbing metafeature data for',d)
            raise e
        
        mf = [data['metafeatures']]
        # print('mf:',mf)
        df = pd.DataFrame.from_records(mf,columns=mf[0].keys())
        # print('df:',df)
        df['dataset'] = data['_id']
        df.sort_index(axis=1, inplace=True)

        return df

    def transform_ml_p(self,df_ml_p):
        """Encodes categorical labels and transforms them using a one hot encoding."""
        df_ml_p = self.params_to_features(df_ml_p)
        # df_tmp = pd.DataFrame(columns=self.ml_p.columns)
        # df_tmp = df_tmp.append(df_ml_p)
        # df_tmp.fillna('nan', inplace=True)
        df_ml_p = df_ml_p.apply(lambda x: self.LE[x.name].transform(x))
        # df_ml_p = df_ml_p.apply(lambda x: self.LE[x.name].transform(x))

        # print('df_ml_p after LE transform:',df_ml_p)
        # X_ml_p = self.OHE.transform(df_ml_p.values)
        X_ml_p = df_ml_p.values
        # X_ml_p = self.OHE.transform(df_ml_p.values)
        # print('df_ml_p after OHE (',X_ml_p.shape,':\n',X_ml_p)
        return X_ml_p

    def update_dataset_mf(self,results_data):
        """Transforms metafeatures and results data into learnable format."""
        dataset_metafeatures = []
        for d in results_data['dataset'].unique():
            if len(self.dataset_mf)==0 or d not in self.dataset_mf.index:
                # fetch metafeatures from server for dataset and append
                df = self.get_metafeatures(d)        
                df['dataset'] = d
                # print('metafeatures:',df)
                dataset_metafeatures.append(df)
        if dataset_metafeatures:
            df_mf = pd.concat(dataset_metafeatures).set_index('dataset')
            # print('df_mf:',df_mf['dataset'], df_mf) 
            self.dataset_mf = self.dataset_mf.append(df_mf)
            # print('self.dataset_mf:\n',self.dataset_mf)
 
    def update_model(self,results_data):
        """Stores best MLP on each dataset."""
        print('updating model')
        for d,dfg in results_data.groupby('dataset'):
            if (len(self.best_mlp) == 0 or
                d not in self.best_mlp.index or
                dfg[self.metric].max() > self.best_mlp.loc[d,'score']):
                self.best_mlp.loc[d,'score'] = dfg[self.metric].max()
                dfg = dfg.reset_index()
                idx = dfg[self.metric].argmax()
                # print('dfg:\n',dfg)
                print('new best for',d,':',dfg.loc[idx,'algorithm'],'idx:',idx)
                self.best_mlp.loc[d,'algorithm'] = dfg.loc[idx,'algorithm']
                self.best_mlp.loc[d,'parameters'] = dfg.loc[idx,'parameters']
        print('model updated')
                
    def recommend(self, dataset_id=None, n_recs=1):
        """Return a model and parameter values expected to do best on dataset.

        Parameters
        ----------
        dataset_id: string
            ID of the dataset for which the recommender is generating recommendations.
        n_recs: int (default: 1), optional
            Return a list of length n_recs in order of estimators and parameters expected to do 
            best.
        """
        # TODO: predict scores over many variations of ML+P and pick the best
        # return ML+P for best average y
        try:
            ml_rec, p_rec, rec_score = self.best_model_prediction(dataset_id, n_recs)

            for (m,p,r) in zip(ml_rec, p_rec, rec_score):
                print('ml_rec:', m, 'p_rec', p, 'rec_score',r)
            ml_rec, p_rec, rec_score = ml_rec[:n_recs], p_rec[:n_recs], rec_score[:n_recs]
            
        except Exception as e:
            print( 'error running self.best_model_prediction for',dataset_id)
            # print('ml_rec:', ml_rec)
            # print('p_rec', p_rec)
            # print('rec_score',rec_score)
            raise e 

        # update the recommender's memory with the new algorithm-parameter combos that it recommended
        # ml_rec = ml_rec[:n_recs]
        # p_rec = p_rec[:n_recs]
        # rec_score = rec_score[:n_recs]

        # if dataset_id is not None:
        #     self.trained_dataset_models.update(
        #                                 ['|'.join([dataset_id, ml, p])
        #                                 for ml, p in zip(ml_rec, p_rec)])

        return ml_rec, p_rec, rec_score

    def best_model_prediction(self,dataset_id, n_recs=1):
        """Predict scores over many variations of ML+P and pick the best"""
        # get dataset metafeatures
        df_mf = self.get_metafeatures(dataset_id) 
        mf = df_mf.drop('dataset',axis=1).values.flatten()

        # compute the neighbors of past results 
        nbrs = NearestNeighbors(n_neighbors=n_recs, algorithm='ball_tree')
        # print('fitting nbrs to self.dataset_mf with shape',
        #       self.dataset_mf.values.shape)
        rs = RobustScaler()
        X = rs.fit_transform(self.dataset_mf.values)
        nbrs.fit(self.dataset_mf.values)
        # find n_recs nearest neighbors to new dataset
        # print('querying neighbors with mf of shape',mf.shape)
        distances,indices = nbrs.kneighbors(rs.transform(mf.reshape(1,-1)))
        # print('distances:',distances)
        # print('indices:',indices)
        dataset_idx = [self.dataset_mf.index[i] for i in indices[0]]
        # recommend the mlp results closest to the dataset in metafeature space
        ml_recs, p_recs, scores = [],[],[]

        # print('self.best_mlp:',self.best_mlp)
        for i,dist in zip(dataset_idx,distances[0]):   
            print(i,dist)
            ml_recs.append(self.best_mlp.loc[i,'algorithm'])
            p_recs.append(self.best_mlp.loc[i,'parameters'])
            scores.append(dist)

        return ml_recs,p_recs,scores
        
