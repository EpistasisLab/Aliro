"""
Recommender system for Penn AI.
"""

class BaseRecommender:
    """Base recommender for PennAI

    The BaseRecommender is not intended to be used directly; it is a skeleton class
    defining the interface for future recommenders within the PennAI project.

    Parameters
    ----------
    ml_type: str, 'classifier' or 'regressor'
        recommending classifiers or regressors. used to determine ML options.

    metric: str
        the metric by which to assess performance in the data.
        default: accuracy for classifiers, mse for regressors.

    """

    def __init__(self, ml_type='classifier', metric=None):
        """initialize recommendation system."""
        raise RuntimeError('Do not instantiate the BaseRecommender class directly.')

    def update(self, results_data):
        """Update ML / Parameter recommendations.

        Parameters
        ----------
        results_data: DataFrame with columns corresponding to:
                'algorithm'
                'parameters'
                self.metric
        """
        raise NotImplementedError

    def recommend(self, dataset_id=None, n_recs=1):
        """return a model and parameter values expected to do best on
        dataset.

        Parameters
        ----------
        n_recs (default: 1): optionally, return a list of length n_recs
        in order of estimators and parameters expected to do best.
        """
        raise NotImplementedError
