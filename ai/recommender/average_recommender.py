"""
Recommender system for Penn AI.
"""
import pandas as pd
from .base import BaseRecommender
import pdb
import logging
logger = logging.getLogger(__name__)
#logger.setLevel(logging.DEBUG)
ch = logging.StreamHandler()
formatter = logging.Formatter('%(module)s: %(levelname)s: %(message)s')
ch.setFormatter(formatter)
logger.addHandler(ch)

class AverageRecommender(BaseRecommender):
    """Penn AI average recommender.

    Recommends machine learning algorithms and parameters based on their average 
    performance across all evaluated datasets.

    Parameters
    ----------
    ml_type: str, 'classifier' or 'regressor'
        Recommending classifiers or regressors. Used to determine ML options.

    metric: str (default: accuracy for classifiers, mse for regressors)
        The metric by which to assess performance on the datasets.

    """

    def __init__(self, ml_type='classifier', metric=None, ml_p=None):
        """Initialize recommendation system."""
        super().__init__(ml_type, metric, ml_p)

        # empty scores pandas series
        self.scores = pd.Series()

        # number of datasets trained on so far
        self.w = 0


    def update(self, results_data, results_mf=None, source='pennai'):
        """Update ML / Parameter recommendations based on overall performance in 
        results_data.

        Updates self.scores

        Parameters
        ----------
        results_data: DataFrame with columns corresponding to:
                'dataset'
                'algorithm'
                'parameters'
                self.metric
        """
        # update trained dataset models and hash table
        super().update(results_data, results_mf, source)

        # make combined data columns of classifiers and parameters
        results_data.loc[:, 'algorithm-parameters'] = (
                results_data['algorithm'].values + '|' +
                results_data['parameter_hash'].apply(str).values)

        # ml_p = results_data['algorithm-parameters'].unique()
        # get average balanced accuracy by classifier-parameter combo
        new_scores = results_data.groupby(
                ('algorithm-parameters'))[self.metric].mean()
        new_weights = results_data.groupby('algorithm-parameters').size()

        # update scores
        self._update_scores(new_scores, new_weights)

    def recommend(self, dataset_id=None, n_recs=1, dataset_mf=None):
        """Return a model and parameter values expected to do best on dataset.

        Parameters
        ----------
        dataset_id: string
            ID of the dataset for which the recommender is generating 
            recommendations.
        n_recs: int (default: 1), optional
            Return a list of length n_recs in order of estimators and parameters 
            expected to do best.
        """

        # dataset hash table
        super().recommend(dataset_id, n_recs, dataset_mf)
        dataset_hash = self.dataset_id_to_hash[dataset_id]

        # return ML+P for best average y
        try:
            rec = self.scores.sort_values(ascending=False).index.values
            # if a dataset is specified, do not make recommendations for
            # algorithm-parameter combos that have already been run
            if dataset_id is not None:
                rec_filt = [r for r in rec if dataset_hash + '|' + r not in
                       self.trained_dataset_models]
                if len(rec_filt) >= n_recs:
                    rec = rec_filt
                else:
                    logger.warning("can't filter recommendations, sending repeats")

            ml_rec = [r.split('|')[0] for r in rec[:n_recs]]
            phash_rec = [r.split('|')[1] for r in rec[:n_recs]]
            rec_score = [self.scores[r] for r in rec[:n_recs]]
        except AttributeError:
            logger.error('rec:', rec)
            logger.error('self.scores:', self.scores)
            logger.error('self.w:', self.w)
            raise AttributeError

        # get parameters from hash table
        p_rec = [self.param_htable[int(p)] for p in phash_rec]

        # update the recommender's memory with the new algorithm-parameter combos 
        # that it recommended
        self.update_trained_dataset_models_from_rec(dataset_id, ml_rec, phash_rec)

        return ml_rec, p_rec, rec_score

    def _update_scores(self, new_scores, new_weights):
        """Update scores based on new_scores."""
        new_ind = new_scores.index.values
        if len(self.scores.index) == 0:
            self.scores = new_scores
            self.w = new_weights
        else:
            for n in new_ind:
                if n in self.scores.index.values:
                    step = new_weights[n] / float(self.w[n] + new_weights[n])
                    self.scores.loc[n] = (self.scores[n] + 
                            step * (new_scores[n] - self.scores[n]))
                else:
                    self.scores.loc[n] = new_scores[n]
            # update weights
            self.w = self.w.add(new_weights, fill_value=0)
