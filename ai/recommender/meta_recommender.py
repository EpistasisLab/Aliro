"""
Recommender system for Penn AI.
"""
import pandas as pd
import json 
import urllib.request, urllib.parse
from .base import BaseRecommender
from ..metalearning import get_metafeatures
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder, OneHotEncoder
from sklearn.pipeline import Pipeline
import numpy as np

from ..db_utils import get_all_ml_p_from_db  
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

    def __init__(self, ml_type='classifier', metric=None, db_path='',api_key='', ml_p=None):
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
        # self.dataset_metafeatures = None
        # maintain a set of dataset-algorithm-parameter combinations that have already been 
        # evaluated
        self.trained_dataset_models = set()
        # TODO: add option for ML estimator
        self.first_update = True

	# load ML Parameter combinations and fit an encoding to them that can be used for
	# learning a model : score = f(ml,p,dataset,metafeatures)
        
        if ml_p is None:
            # pull algorithm/parameter combinations from the server. 
            self.ml_p = get_all_ml_p_from_db('/'.join([db_path,'api/preferences']),api_key)
        else:
            self.ml_p = ml_p

        print('ml_p:',self.ml_p)
        from collections import defaultdict
        self.LE = defaultdict(LabelEncoder)
        self.OHE = OneHotEncoder()
        # Encoding the variable
        self.ml_p = self.ml_p.apply(lambda x: self.LE[x.name].fit_transform(x))
        print('ml_p after LE:',self.ml_p)
        X = self.OHE.fit_transform(self.ml_p)
        # self.ml_p = self.ml_p.apply(lambda x: self.OHE[x.name].fit_transform(x))
        print('X after OHE:',X.shape)

        # Inverse the encoded
        # fit.apply(lambda x: self.LE[x.name].inverse_transform(x))

        # Using the dictionary to label future data
        # self.ml_p.apply(lambda x: self.LE[x.name].transform(x))

        # one hot encode algorithms 

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

        # # make combined data columns of datasets, classifiers, and parameters
        # results_data.loc[:, 'algorithm-parameters'] = (
        #                                results_data['algorithm'].values + '|' +
        #                                results_data['parameters'].values)

        dap = (results_data['dataset'].values + '|' +
               results_data['algorithm'].values + '|' +
               results_data['parameters'].values)
        # get unique dataset / parameter / classifier combos in results_data
        # ml_p = results_data['algorithm-parameters'].unique()
        print(dap)
        d_ml_p = np.unique(dap)
        self.trained_dataset_models.update(d_ml_p)
 
        dataset_metafeatures = []
        for d in results_data['dataset'].unique():
            # fetch metafeatures from server for dataset and append
            print('fetching data for', d)
            payload={}
            # payload = {'metafeatures'}
            payload.update(self.static_payload)
            params = json.dumps(payload).encode('utf8')
            print('full path:', self.mf_path+'/'+d)
            req = urllib.request.Request(self.mf_path+'/'+d, data=params)
            r = urllib.request.urlopen(req)
            
            data = json.loads(r.read().decode(r.info().get_param('charset')
                                      or 'utf-8'))[0]
            mf = [data['metafeatures']]
            # print('mf:',mf)
            df = pd.DataFrame.from_records(mf,columns=mf[0].keys())
            # print('df:',df)
            df['dataset'] = data['_id']
            print('metafeatures:',df)

            dataset_metafeatures.append(df)
            
        df_mf = pd.concat(dataset_metafeatures,ignore_index=True)
        print('df_mf:',df_mf)
        print('dataset_metafeatures:',dataset_metafeatures)
        # make training data
        # smash metafeature into results_data
        self.training_data = pd.concat([results_data,df_mf],axis=1)
        self.training_data.dropna(how='any',axis=1,inplace=True)
         
        print('training data:',self.training_data)
        print('training columns:',self.training_data.columns)
        # one-hot encode parameter combinations?
         
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
