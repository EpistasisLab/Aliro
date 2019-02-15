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
        Recommending classifiers or regressors. Used to determine ML options.

    metric: str (default: accuracy for classifiers, mse for regressors)
        The metric by which to assess performance on the datasets.

    """

    def __init__(self, ml_type='classifier', metric=None):
        """Initialize recommendation system."""
        raise RuntimeError('Do not instantiate the BaseRecommender class directly.')

    def update(self, results_data, results_mf=None):
        """Update ML / Parameter recommendations.

        Parameters
        ----------
        results_data: DataFrame with columns corresponding to:
                'algorithm'
                'parameters'
                self.metric

        results_mf: DataFrame with columns corresponding to metafeatures of each dataset in 
                    results_data.
        """
        raise NotImplementedError

    def recommend(self, dataset_id=None, n_recs=1, dataset_mf=None):
        """Return a model and parameter values expected to do best on dataset.

        Parameters
        ----------
        dataset_id: string
            ID of the dataset for which the recommender is generating recommendations.
        n_recs: int (default: 1), optional
            Return a list of length n_recs in order of estimators and parameters expected to do best.
        dataset_mf: metafeatures of the dataset represented by dataset_id
        """
        raise NotImplementedError
