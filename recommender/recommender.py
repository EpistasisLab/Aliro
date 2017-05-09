"""
Recommender system for Penn AI.

"""
from sklearn.tree import DecisionTreeClassifier

class Recommender():
    """Class for recommender"""
    def __init__(self,ml=None,problem_type = 'classification'):
        """initialize recommendation system."""

        self.ml = ml
        self.problem_type = problem_type

        if self.ml = None:
            self.ml = DecisionTreeClassifier()

        if self.problem_type == 'classification':
            self.models = ['LogisticRegression',
                             'DecisionTreeClassifier',
                             'NearestNeighborClassifier',
                             'SVC',
                             'RandomForestClassifier',
                             'GradientBoostingClassifier']
        else if self.problem_type == 'regresssion':
            self.models = ['ElasticNet',
                             'DecisionTreeRegressor`',
                             'NearestNeighborRegressor',
                             'SVR',
                             'RandomForestRegressor',
                             'GradientBoostingRegressor']
        else:
            raise ValueError('problem_type must be ''classification'' '
                             'or ''regression''')

        
    def update_models(self,X,learner=None):
        """update meta-models by incorporating new data.
        if estimator is specified, only that model will be updated. otherwise,
        all models are updated based on new info."""

    def recommend(self,dataset,n_recs=1):
        """return a model and parameter values expected to do best on
        dataset.
        n_recs (default: 1): optionally, return a list of length n_recs
        in order of estimators and parameters expected to do best."""

        # get metafeatures of the dataset
        metafeatures = self.metafeatures(dataset)
        scores = np.array()
        for ml in self.learners:
            score = ml.predict(dataset)
            self.

    def metafeatures(self,dataset):
        """returns a column vector of metafeatures for this dataset."""
