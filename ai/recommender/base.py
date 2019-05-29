"""
Recommender system for Penn AI.
"""
import logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
ch = logging.StreamHandler()
formatter = logging.Formatter('%(module)s: %(levelname)s: %(message)s')
ch.setFormatter(formatter)
logger.addHandler(ch)
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
        if ml_type not in ['classifier', 'regressor']:
            raise ValueError('ml_type must be "classifier" or "regressor"')

        self.ml_type = ml_type
        
        if metric is None:
            self.metric = 'bal_accuracy' if self.ml_type == 'classifier' else 'mse'
        else:
            self.metric = metric

        # maintain a set of dataset-algorithm-parameter combinations that have 
        # already been evaluated
        self.trained_dataset_models = set()
        # hash table for parameter options
        self.param_htable = {}
        
        # get ml+p combos (note: this triggers a property in base recommender)
        self.ml_p = ml_p

        # store dataset_id to hash dictionary
        self.dataset_id_to_hash = {}

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
        # update parameter hash table
        self.param_htable.update({hash(frozenset(x.items())):x 
                for x in results_data['parameters'].values})
        
        # store parameter_hash variable in results_data 
        results_data['parameter_hash'] = results_data['parameters'].apply(
                lambda x: str(hash(frozenset(x.items()))))
        
        # store hash dataset ids
        self.dataset_id_to_hash.update({d:results_mf.loc[d]['dataset_hash'] 
                for d in results_mf.index})
        results_data['dataset_hash'] = results_data['dataset'].apply(lambda x:
                self.dataset_id_to_hash[x])

        # update results list 
        if source == 'pennai':
            self.update_trained_dataset_models_from_df(results_data)

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
        self.dataset_id_to_hash.update(
                {dataset_id:dataset_mf['dataset_hash'].values[0]})

    @property
    def ml_p(self):
        logger.debug('getting ml_p')
        return self._ml_p

    @ml_p.setter
    def ml_p(self, value):
        logger.debug('setting ml_p')
        if value is not None:
            self._ml_p = value
            logger.debug('setting hash table')
            # maintain a parameter hash table for parameter settings
            self.param_htable = {hash(frozenset(x.items())):x 
                    for x in self._ml_p['parameters'].values}
            # machine learning - parameter combinations
            self.mlp_combos = (self._ml_p['algorithm']+'|'+
                               self._ml_p['parameters'].apply(lambda x:
                                   str(hash(frozenset(x.items())))))
            # filter out duplicates
            self.mlp_combos = self.mlp_combos.drop_duplicates()
        else:
            logger.error('value of ml_p is None')
        logger.debug('param_htable:{} objects'.format(len(self.param_htable)))

    def update_trained_dataset_models_from_df(self, results_data):
        '''stores the trained_dataset_models to aid in filtering repeats.'''
        results_data.loc[:, 'dataset-algorithm-parameters'] = (
                                       results_data['dataset_hash'].values + '|' +
                                       results_data['algorithm'].values + '|' +
                                       results_data['parameter_hash'].values)

        for i,phash in enumerate(results_data['parameter_hash'].values):
            if int(phash) not in self.param_htable.keys():
                logger.error(phash+' not in self.param_htable. parameter values: '+
                      str(results_data['parameters'].values[i]))
        # get unique dataset / parameter / classifier combos in results_data
        d_ml_p = results_data['dataset-algorithm-parameters'].unique()
        self.trained_dataset_models.update(d_ml_p)
        
    def update_trained_dataset_models_from_rec(self, dataset_id, ml_rec, phash_rec):
        '''update the recommender's memory with the new algorithm-parameter combos 
           that it recommended'''
        if dataset_id is not None:
            datahash = self.dataset_id_to_hash[dataset_id]
            self.trained_dataset_models.update(
                                    ['|'.join([datahash, ml, p])
                                    for ml, p in zip(ml_rec, phash_rec)])
