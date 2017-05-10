"""
Recommender system for Penn AI.

"""
from sklearn.tree import DecisionTreeClassifier
import numpy as np
import pandas as pd
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
                 metric='bal_accuracy'):
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
                             'NearestNeighborClassifier',
                             'SVC',
                             'RandomForestClassifier',
                             'GradientBoostingClassifier']
        elif self.ml_type == 'regresssion':
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
    def update(self,data,learner=None):
        """update meta-models by incorporating new data.

        Parameters
        ----------
        data: DataFrame with at least these columns:
                self.ml_type
                'parameters'
                self.metric
        """
        if self.method=='ml_p':
            # recommending ML and Parameters based on overall performance
            self.fit_ml_p(data)

    def recommend(self,data=None,n_recs=1):
        """return a model and parameter values expected to do best on
        dataset.
        n_recs (default: 1): optionally, return a list of length n_recs
        in order of estimators and parameters expected to do best."""

        if self.method=='ml_p':
            # return ML+P for best average y
            if n_recs==1:
                # pdb.set_trace()
                rec = np.argmax(self.scores)
                ml_rec = rec.split(':')[0]
                p_rec = rec.split(':')[1]
            else:
                rec = self.scores.sort_values(ascending=False).index[:n_recs].values
                ml_rec = [r.split(':')[0] for r in rec]
                p_rec = [r.split(':')[1] for r in rec]
            return ml_rec, p_rec
        # # get metafeatures of the dataset
        # metafeatures = self.metafeatures(dataset)
        # scores = np.array()
        # for ml in self.learners:
        #     score = ml.predict(dataset)
        #     self.

    def metafeatures(self,data):
        """returns a column vector of metafeatures for this dataset."""

    def fit_ml_p(self,data):
        """Fit ML / Parameter recommendation based on overall performance
        in data.
        Updates self.scores

        Parameters
        ----------
        data: DataFrame with columns corresponding to:
                self.ml_type
                'parameters'
                self.metric
        """
        # make combined data column of classifiers and parameters
        data.loc[:,self.ml_type+'-parameters'] = (data[self.ml_type].values + ':' +
                                        data['parameters'].values)
        # get unique parameter / classifier combos in data
        ml_p = data[self.ml_type+'-parameters'].unique()
        # get average balanced accuracy by classifier-parameter combo
        new_scores = (data.groupby(self.ml_type + '-parameters')[self.metric].mean())
        # update scores
        self.update_scores(new_scores)

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

    def update_scores(self,new_scores):
        """update scores based on new_scores"""
        # pdb.set_trace()
        new_ind = new_scores.index.values
        if len(self.scores.index)==0:
            self.scores = new_scores
            self.w = new_scores.shape[0]
        else:
            step = new_scores.shape[0]/self.w
            for n in new_ind:
                if n in self.scores.index.values:
                    self.scores.loc[n] = (self.scores[n] +
                                          step*(new_scores[n]-self.scores[n]))
                else:
                    self.scores.loc[n] = new_scores[n]
            self.w += new_scores.shape[0]
