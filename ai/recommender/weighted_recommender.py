"""
Recommender system for Penn AI.
"""
import pandas as pd
from .base import BaseRecommender

class AverageRecommender(BaseRecommender):
    """Penn AI average recommender.
    Recommends machine learning algorithms and parameters based on their average performance
    across all evaluated datasets.
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
        if ml_type not in ['classifier', 'regressor']:
            raise ValueError('ml_type must be "classifier" or "regressor"')

        self.ml_type = ml_type

        if metric is None:
            self.metric = 'accuracy' if self.ml_type == 'classifier' else 'mse'
        else:
            self.metric = metric

        # empty scores pandas series
        self.scores = pd.Series()

        # number of datasets trained on so far
        self.w = 0

        # maintain a set of dataset-algorithm-parameter combinations that have already been evaluated
        self.trained_dataset_models = set()

    def update(self, results_data):
        """Update ML / Parameter recommendations based on overall performance in results_data.
        Updates self.scores
        Parameters
        ----------
        results_data: DataFrame with columns corresponding to:
                'algorithm'
                'parameters'
                self.metric
        """
        # make combined data columns of datasets, classifiers, and parameters
        results_data.loc[:, 'algorithm-parameters'] = (
                                       results_data['algorithm'].values + '|' +
                                       results_data['parameters'].values)

        results_data.loc[:, 'dataset-algorithm-parameters'] = (
                                       results_data['dataset'].values + '|' +
                                       results_data['algorithm'].values + '|' +
                                       results_data['parameters'].values)

        # get unique dataset / parameter / classifier combos in results_data
        ml_p = results_data['algorithm-parameters'].unique()
        d_ml_p = results_data['dataset-algorithm-parameters'].unique()
        self.trained_dataset_models.update(d_ml_p)

        # get average balanced accuracy by classifier-parameter combo
        new_scores = results_data.groupby(('algorithm-parameters'))[self.metric].mean()
        new_weights = results_data.groupby('algorithm-parameters').size()

        # update scores
        self._update_scores(new_scores, new_weights)

    def recommend(self, dataset_id=None, n_recs=1):
        """return a model and parameter values expected to do best on the dataset.
        Parameters
        ----------
        n_recs (default: 1): optionally, return a list of length n_recs
        in order of estimators and parameters expected to do best.
        """

        # return ML+P for best average y
        try:
            rec = self.scores.sort_values(ascending=False).index.values

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

    def _update_scores(self, new_scores, new_weights):
        """update scores based on new_scores"""
        new_ind = new_scores.index.values
        if len(self.scores.index) == 0:
            self.scores = new_scores
            self.w = new_weights
        else:
            for n in new_ind:
                if n in self.scores.index.values:
                    step = new_weights[n] / float(self.w[n] + new_weights[n])
                    self.scores.loc[n] = (self.scores[n] + step * (new_scores[n] - self.scores[n]))
                else:
                    self.scores.loc[n] = new_scores[n]
            # update weights
            self.w = self.w.add(new_weights, fill_value=0)
