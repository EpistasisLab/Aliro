"""
Recommender system for Penn AI.
"""
import pandas as pd
import json 
import urllib.request, urllib.parse
from .base import BaseRecommender
#from ..metalearning import get_metafeatures
from sklearn.neural_network import MLPRegressor
from sklearn.preprocessing import LabelEncoder, OneHotEncoder
from sklearn.pipeline import Pipeline
import numpy as np
from collections import defaultdict, OrderedDict
from ..db_utils import get_all_ml_p_from_db  
import pdb

class MLPMetaRecommender(BaseRecommender):
    """Penn AI meta recommender.
    Recommends machine learning algorithms and parameters as follows:
    maintains an internal model of the form f_d(ML,P,MF) = E
    where 
    d is the dataset
    ML is the machine learning
    P is the ML parameters
    MF is the metafeatures associated with d
        
    to produce recommendations for dataset d, it does the following:
    E_a = f_d(ML_a,P_a,MF_d) prediction of performance of a on d
    Sort E_a for several a (sampled from ML+P options)
    recommend top E_a 

    Parameters
    ----------
    ml_type: str, 'classifier' or 'regressor'
        Recommending classifiers or regressors. Used to determine ML options.
    
    metric: str (default: accuracy for classifiers, mse for regressors)
        The metric by which to assess performance on the datasets.
    """
    def __init__(self, ml_type='classifier', metric=None, db_path='',api_key='', ml_p=None,
                 sample_size=None):
        """Initialize recommendation system."""
        if ml_type not in ['classifier', 'regressor']:
            raise ValueError('ml_type must be "classifier" or "regressor"')

        self.ml_type = ml_type

        if metric is None:
            self.metric = 'bal_accuracy' if self.ml_type == 'classifier' else 'mse'
        else:
            self.metric = metric
        # path for grabbing dataset metafeatures
        self.mf_path = '/'.join([db_path,'api/datasets'])
        # print('mf_path:',self.mf_path)
        self.api_key = api_key
        self.static_payload = {'apikey':self.api_key}

        # training data
        self.training_features = None
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

        self.ml_p = self.params_to_features(self.ml_p, init=True)
        
        self.ml_p = self.ml_p.drop_duplicates() # just in case duplicates are present
        self.ordinal_params = ['alpha','binarize','learning_rate','subsample','tol','C',
                               'n_neighbors','p','n_estimators','min_samples_split',
                               'min_samples_leaf','max_depth']

        if sample_size == None:
            self.sample_size = len(self.ml_p)
        else:
            self.sample_size = min(sample_size, len(self.ml_p))
        # Encoding the variables
        self.LE = defaultdict(LabelEncoder)
        self.OHE = OneHotEncoder(sparse=False)
        # pdb.set_trace()
        self.ml_p = self.ml_p.apply(lambda x: self.LE[x.name].fit_transform(x))
        # one hot encode everything
        self.X_ml_p = self.OHE.fit_transform(self.ml_p.values)
        
        print('loaded {nalg} ml/parameter combinations with '
                '{nparams} parameters'.format(nalg=self.X_ml_p.shape[0],
                                                     nparams=self.X_ml_p.shape[1]-1))

        # our ML
        self.ml = MLPRegressor(hidden_layer_sizes=(100,40,20,10), activation='relu', solver='adam',
                               warm_start=False,max_iter=200,verbose=False)

    def params_to_features(self, df, init=False):
        """convert parameter dictionaries to dataframe columns"""
        # pdb.set_trace()
        try:
            param = df['parameters'].apply(eval)
            param = pd.DataFrame.from_records(list(param))
            param = param.applymap(str)
            # get rid of trailing .0 added to integer vals 
            param = param.applymap(lambda x: x[:-2] if x[-2:] == '.0' else x)
            param = param.reset_index(drop=True)
            # print('param:',param)
            df = df.drop('parameters',axis=1).reset_index(drop=True)
            df = pd.concat([df, param],axis=1)

            if not init: # need to add additional parameter combos for other ml
                df_tmp = pd.DataFrame(columns=self.ml_p.columns)
                df_tmp = df_tmp.append(df)
                df_tmp.fillna('nan', inplace=True)
                df = df_tmp
            # sort columns by name 
            df.sort_index(axis=1, inplace=True)
            # print('df:',df)
        except Exception as e:
            print(e)
            pdb.set_trace() 
        return df

    def features_to_params(self, df ):
        """convert dataframe columns to parameter dictionaries"""
        param = df.to_dict('index')
        plist = []
        for k,v in param.items():
            tmp = {k1:v1 for k1,v1 in v.items() if v1 != 'nan'}
            for k1,v1 in tmp.items():
                try:
                    tmp[k1] = int(v1)
                except:
                    try:
                        tmp[k1] = float(v1)
                    except:
                        pass
                    pass
            plist.append(str(tmp))

        return plist 


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
        # keep track of unique dataset / parameter / classifier combos in results_data
        dap = (results_data['dataset'].values + '|' +
               results_data['algorithm'].values + '|' +
               results_data['parameters'].values)
        d_ml_p = np.unique(dap)
        self.trained_dataset_models.update(d_ml_p)
        # transform data for learning a model from it 
        self.setup_training_data(results_data) 

        # update internal model
        self.update_model()

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
        X_ml_p = self.OHE.transform(df_ml_p.values)
        # X_ml_p = df_ml_p.values
        # print('df_ml_p after OHE transform (',X_ml_p.shape,':\n',X_ml_p)
        # print(np.where(np.isnan(self.X_ml_p)))
        return X_ml_p

    def setup_training_data(self,results_data):
        """Transforms metafeatures and results data into learnable format."""
        dataset_metafeatures = []
        for d in results_data['dataset'].unique():
            # fetch metafeatures from server for dataset and append
            df = self.get_metafeatures(d)        
            # print('metafeatures:',df)
            dataset_metafeatures.append(df)
            
        df_mf = pd.concat(dataset_metafeatures,ignore_index=True)

        # join df_mf to results_data to get mf rows for each result
        results_mf = pd.merge(results_data, df_mf, on='dataset', how='outer')
        df_mf = results_mf.loc[:,results_mf.columns.isin(df_mf.columns)]
        df_mf = df_mf.drop('dataset',axis=1)
        # print('df_mf:',df_mf)
        # print('dataset_metafeatures:',dataset_metafeatures)
        # transform algorithms and parameters to one hot encoding 
        df_ml_p = results_data.loc[:, results_data.columns.isin(['algorithm','parameters'])]
        X_ml_p = self.transform_ml_p(df_ml_p)
        # print('df_ml_p shape:',df_ml_p.shape)
        # join algorithm/parameters with dataset metafeatures
        # print('df_mf shape:',df_mf.shape) 
        self.training_features = np.hstack((X_ml_p,df_mf.values))
        # self.training_features = X_ml_p 
         
        # print('training data:',self.training_features)
        # print('training columns:',self.training_features[:10])
        # transform data using label encoder and one hot encoder
        self.training_y = results_data[self.metric].values
        assert(len(self.training_y)==len(self.training_features))
         
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
            ml_rec, p_rec, rec_score = self.best_model_prediction(dataset_id, 10)

            for (m,p,r) in zip(ml_rec, p_rec, rec_score):
                print('ml_rec:', m, 'p_rec', p, 'rec_score',r)
            ml_rec, p_rec, rec_score = ml_rec[:n_recs], p_rec[:n_recs], rec_score[:n_recs]
            # # if a dataset is specified, do not make recommendations for
            # # algorithm-parameter combos that have already been run
            # if dataset_id is not None:
            #     rec = [r for r in rec if dataset_id + '|' + r not in
            #            self.trained_dataset_models]

            # ml_rec = [r.split('|')[0] for r in rec]
            # p_rec = [r.split('|')[1] for r in rec]
            # rec_score = [self.scores[r] for r in rec]
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

    def update_model(self):
        """Trains model on datasets and metafeatures."""
        print('updating model...',end='')
        # print(np.where(np.isnan(self.training_features)))
        # print(np.where(np.isnan(self.training_y)))
        # print(np.where(np.isinf(self.training_features)))
        # print(np.where(np.isinf(self.training_y)))
        # print(self.training_features.shape)
        # for xi,yi in zip(self.training_features, self.training_y):
        self.ml.partial_fit(self.training_features, self.training_y)
        print('model updated')

    def best_model_prediction(self,dataset_id, n_recs=1):
        """Predict scores over many variations of ML+P and pick the best"""
        # get dataset metafeatures
        df_mf = self.get_metafeatures(dataset_id) 
        mf = df_mf.drop('dataset',axis=1).values.flatten()
        # setup input data by sampling ml+p combinations from all possible combos 
        # choices = np.random.choice(len(self.X_ml_p),size=self.sample_size,replace=False)
        X_ml_p = self.X_ml_p[np.random.choice(len(self.X_ml_p),size=self.sample_size,replace=False)]
        # print('generating predictions for:')
        # df_tmp = pd.DataFrame(X_ml_p,columns=self.ml_p.columns)
        # print(df_tmp.apply(lambda x: self.LE[x.name].inverse_transform(x)))
        # make prediction data consisting of ml + p combinations plus metafeatures
        # TODO: clean mf data
        predict_features = np.array([np.hstack((ml_p, mf)) for ml_p in X_ml_p])
        # predict_features = X_ml_p 
        # print('predict_features:',predict_features.shape)
        # generate predicted scores

        predict_scores = self.ml.predict(predict_features)
        # print('predict_scores:',predict_scores)

        # grab best scores
        predict_idx = np.argsort(predict_scores)[::-1][:n_recs]
        # print('predict_idx:',predict_idx) 
        # indices in X_ml_p that match best prediction scores
        predict_ml_p = X_ml_p[predict_idx]
        predict_ml_p = X_ml_p
        # print('predict_ml_p(',predict_ml_p.shape,'):',predict_ml_p)
        # print('self.OHE.n_values:',self.OHE.n_values_)
        # print('self.OHE.feature_indices_:',self.OHE.feature_indices_)
        # pred_ml_p_df = df_tmp.loc[predict_idx,:]
        # print('df_tmp[predict_idx]:',pred_ml_p_df)
        # invert the one hot encoding
        fi = self.OHE.feature_indices_
        predict_ml_p_le = np.array([[x[fi[i]:fi[i+1]].dot(np.arange(nv)) 
                                    for i,nv in enumerate(self.OHE.n_values_)]
                                    for x in list(predict_ml_p)]
                                  )
        # predict_ml_p_le = predict_ml_p
        # print('predict_ml_p_le:',predict_ml_p_le)
        # predict_ml_p_le = np.array(predict_ml_p_le).reshape(n_recs,-1)
        # print('transformed predict_ml_p_le:',predict_ml_p_le)
        df_pr_ml_p = pd.DataFrame(
                                  data=predict_ml_p_le,
                                  columns = self.ml_p.columns, dtype=np.int64)
        # # invert the label encoding 
        # df_pr_ml_p = df_tmp.loc[predict_idx,:]
        # print('df_pr_ml_p:',df_pr_ml_p)
        # print(df_pr_ml_p.describe())
        df_pr_ml_p = df_pr_ml_p.apply(lambda x: self.LE[x.name].inverse_transform(x))
        # predict_ml_p = df_pr_ml_p.values

        # grab recommendations
        ml_recs = list(df_pr_ml_p['algorithm'].values)
        p_recs = self.features_to_params(df_pr_ml_p.drop('algorithm',axis=1))
        scores = predict_scores[predict_idx]
        # pdb.set_trace()

        return ml_recs,p_recs,scores
        
