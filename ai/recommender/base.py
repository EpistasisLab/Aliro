"""
Recommender system for Penn AI.
"""
import pdb 
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

    ml_p: DataFrame (default: None)
        Contains all valid ML parameter combos, with columns 'algorithm' and
        'parameters'

    """

    def __init__(self, ml_type='classifier', metric=None, ml_p=None):
        """Initialize recommendation system."""
        raise RuntimeError('Do not instantiate the BaseRecommender class directly.')

    def update(self, results_data, results_mf=None, source='pennai'):
        """Update ML / Parameter recommendations.

        Parameters
        ----------
        results_data: DataFrame 
            columns corresponding to:
            'algorithm'
            'parameters'
            self.metric

        results_mf: DataFrame, optional 
            columns corresponding to metafeatures of each dataset in results_data.
        """
        raise NotImplementedError

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
        dataset_mf: DataFrame 
            metafeatures of the dataset represented by dataset_id
        """
        raise NotImplementedError

    @property
    def ml_p(self):
        print('getting ml_p')
        return self._ml_p

    @ml_p.setter
    def ml_p(self, value):
        print('setting ml_p')
        if value is not None:
            self._ml_p = value
            print('setting hash table')
            # maintain a parameter hash table for parameter settings
            self.param_htable = {hash(frozenset(x.items())):x 
                    for x in self._ml_p['parameters'].values}
            # machine learning - parameter combinations
            self.mlp_combos = (self._ml_p['algorithm']+'|'+
                               self._ml_p['parameters'].apply(lambda x:
                                   str(hash(frozenset(x.items())))))

    def update_trained_dataset_models_from_df(self, results_data):
        '''stores the trained_dataset_models to aid in filtering repeats.'''
        results_data['parameter_hash'] = results_data['parameters'].apply(
                lambda x: str(hash(frozenset(x.items()))))
        results_data.loc[:, 'dataset-algorithm-parameters'] = (
                                       results_data['dataset'].values + '|' +
                                       results_data['algorithm'].values + '|' +
                                       results_data['parameter_hash'].values)

        for i,phash in enumerate(results_data['parameter_hash'].values):
            if int(phash) not in self.param_htable.keys():
                print(phash,'not in self.param_htable. parameters:',
                      results_data['parameters'].values[i])
                pdb.set_trace()
        # get unique dataset / parameter / classifier combos in results_data
        d_ml_p = results_data['dataset-algorithm-parameters'].unique()
        self.trained_dataset_models.update(d_ml_p)
        
    def update_trained_dataset_models_from_rec(self, dataset_id, ml_rec, p_rec):
        '''update the recommender's memory with the new algorithm-parameter combos 
           that it recommended'''

        self.trained_dataset_models.update(
                                    ['|'.join([dataset_id, ml, p])
                                    for ml, p in zip(ml_rec, p_rec)])
