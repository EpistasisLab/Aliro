"""
Recommender system for Penn AI.

"""
from sklearn.tree import DecisionTreeClassifier
import numpy as np
import pandas as pd
from dataset_describe import Dataset
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
    method: str, default: 'ml_p'
        the problem formulation.
        options: 'ml_p' | 'ml_mf' | 'ml_p_mf'
        ml_p: recommend a ML and parameters without modeling metafeatures.
        ml_mf: recommend a ML using metafeatures.
        ml_p_mf: recommend a ML and parameters using metafeatures.

    ml: object, default: None
        the machine learning algorithm used as a meta-model. unused if
        metafeatures are not included

    ml_type: str, 'classifier' | 'regressor'
        recommending classifiers or regressors. used to determine ML
        options.

    metric: str, default: 'bal_accuracy'
        the metric by which to assess performance in the data

    """

    def __init__(self,method='ml_p',ml=None,ml_type = 'classifier',
                 metric='bal_accuracy',
                 db_path='http://ibi-admin-031.med.upenn.edu/api/datasets',
                 extra_payload=dict()):
        """initialize recommendation system."""
        self.method = method
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
        # access to database
        self.db_path = db_path
        # api key for the recommender
        self.api_key='Oed+kIyprDrUq/3oWU5Jpyd22PqhG/CsUvI8oc9l39E='
        # optional extra payloads (e.g. user id) for posting to the db
        self.extra_payload = extra_payload
        # store a list of keys that have been trained on
        self.trained_data_ids = []

    def db_to_results_data(self):
        """load json files from db and convert to results_data.
        Output: a DataFrame with at least these columns:
                self.ml_type
                'parameters'
                self.metric
        """
        payload = {'token':self.api_key,
                #    'filter_ids':self.trained_data_ids,
                    'algorithm': self.models,
                    'experiments': 'finished',
                  }
        payload.update(self.extra_payload)
        print('payload:',payload)
        ##post the payload to the API
        r = requests.post(self.db_path, data = json.dumps(payload))
        if r.status_code==503:
            raise ValueError('Failed to connect to database',r.reason)
        print(r)
        # pdb.set_trace()
        response = json.loads(r.text)
        print('response:',response[0])
        results = pd.DataFrame(response)
        # ai = pd.DataFrame(response[0]['ai'])
        print('results:\n',results)
        # print('ai:',ai)
        
    def results_in_db(self,ml,p,dataset_name):
        """checks whether results are already in database."""

    def update(self,results_data,learner=None,data_name=None):
        """update meta-models by incorporating new data.

        Parameters
        ----------
        results_data: DataFrame with at least these columns:
                self.ml_type
                'parameters'
                self.metric
        """
        # grab new results from database
        results_data = db_to_results_data()

        if self.method=='ml_p':
            # recommending ML and Parameters based on overall performance
            self.fit_ml_p(results_data)
        elif self.method=='ml_p_mf':
            # recommending ML and parameters based on metafeatures of data
            self.fit_ml_p_mf(results_data,data_name)

    def recommend(self,dataset=None,n_recs=1):
        """return a model and parameter values expected to do best on
        dataset.
        n_recs (default: 1): optionally, return a list of length n_recs
        in order of estimators and parameters expected to do best."""

        if self.method=='ml_p':
            # return ML+P for best average y
            try:
                rec = self.scores.sort_values(ascending=False).index[:n_recs].values
                ml_rec = [r.split(':')[0] for r in rec]
                p_rec = [r.split(':')[1] for r in rec]
            except AttributeError:
                print('rec:',rec)
                print('self.scores:',self.scores)
                print('self.w:',self.w)
                raise AttributeError
            return ml_rec, p_rec
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

        dataset = Dataset(data, dependent_col = 'class', prediction_type='classification')

        meta_features = OrderedDict()
        for i in dir(dataset):
            result = getattr(dataset, i)
            if (not i.startswith('__') and not i.startswith('_')
                and hasattr(result, '__call__')):
                meta_features[i] = result()
        # meta_features['dataset'] = data['dataset']
        return meta_features

    def fit_ml_p(self,results_data):
        """Fit ML / Parameter recommendation based on overall performance
        in results_data.
        Updates self.scores

        Parameters
        ----------
        results_data: DataFrame with columns corresponding to:
                self.ml_type
                'parameters'
                self.metric
        """
        # make combined data column of classifiers and parameters
        results_data.loc[:,self.ml_type+'-parameters'] = (
                                       results_data[self.ml_type].values + ':' +
                                       results_data['parameters'].values)
        # get unique parameter / classifier combos in results_data
        ml_p = results_data[self.ml_type+'-parameters'].unique()
        # get average balanced accuracy by classifier-parameter combo
        new_scores = results_data.groupby((self.ml_type +
                                           '-parameters'))[self.metric].mean()
        new_weights = results_data.groupby(self.ml_type + '-parameters').size()
        # update scores
        self.update_scores(new_scores, new_weights)

    def dictify(self,p):
        """convert parameter entry into dictionary."""
        d = dict()
        for ps in p.split(','):
            if str(ps.split('=')[0]) != '':
                if self.is_number(ps.split('=')[-1]):
                    d[str(ps.split('=')[0])] = float(ps.split('=')[-1])
                else:
                    d[str(ps.split('=')[0])] = ps.split('=')[-1]
        return d

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
                    step = new_weights[n]/self.w[n]
                    self.scores.loc[n] = (self.scores[n] +
                                          step*(new_scores[n]-self.scores[n]))
                else:
                    self.scores.loc[n] = new_scores[n]
            # update weights
            self.w = self.w.add(new_weights, fill_value=0)
