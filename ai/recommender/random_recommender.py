import pandas as pd
from .base import BaseRecommender
import numpy as np
import pdb

class RandomRecommender(BaseRecommender):
    """Penn AI random recommender.

    Recommends random machine learning algorithms and parameters from the possible algorithms
    fetched from the server.

    Parameters
    ----------
    ml_type: str, 'classifier' or 'regressor'
        Recommending classifiers or regressors. Used to determine ML options.

    metric: str (default: accuracy for classifiers, mse for regressors)
        The metric by which to assess performance on the datasets.
    
    ml_p: Dataframe
        Contains all the machine learning / algorithm combinations available for recommendation.
    """


    def __init__(self, ml_type='classifier', metric=None, ml_p=None):
        """Initialize recommendation system."""
        if ml_type not in ['classifier', 'regressor']:
            raise ValueError('ml_type must be "classifier" or "regressor"')

        self.ml_type = ml_type

        if metric is None:
            self.metric = 'accuracy' if self.ml_type == 'classifier' else 'mse'
        else:
            self.metric = metric

        # machine learning and parameter (ml_p) options 
        self.ml_p = ml_p
        if ml_p is not None:
            self.ml_p = self.ml_p.drop_duplicates()
        # maintain a set of dataset-algorithm-parameter combinations that have already been 
        # evaluated
        self.trained_dataset_models = set()

    def update(self, results_data, results_mf=None):
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
        #self.ml = results_data['algorithm'].unique()
        #for ml in self.ml:
        #    self.ml_p_dict[ml] = results_data.loc[results_data['algorithm']==ml,'parameters'].unique()

        # make combined data columns of datasets, classifiers, and parameters

        #results_data.loc[:, 'algorithm-parameters'] = (
        #                               results_data['algorithm'].values + '|' +
        #                               results_data['parameters'].values)

        results_data.loc[:, 'dataset-algorithm-parameters'] = (
                                       results_data['dataset'].values + '|' +
                                       results_data['algorithm'].values + '|' +
                                       results_data['parameters'].values)
        #pdb.set_trace()
        # get unique dataset / parameter / classifier combos in results_data
        #self.ml_p = results_data['algorithm-parameters'].unique()
        d_ml_p = results_data['dataset-algorithm-parameters'].unique()
        self.trained_dataset_models.update(d_ml_p)


    def recommend(self, dataset_id=None, n_recs=1, dataset_mf=None):
        """Return a model and parameter values expected to do best on dataset.

        Parameters
        ----------
        dataset_id: string
            ID of the dataset for which the recommender is generating recommendations.
        n_recs: int (default: 1), optional
            Return a list of len n_recs in order of estimators and parameters expected to do best.
        """

        # return ML+P for best average y
        #print(self.ml_p)
        try:
            ml_rec,p_rec,rec_score=[],[],[]

            for i in np.arange(n_recs):
                n=0
                rec_not_new = True
                # while (rec_not_new and n<10):
                    #print(self.ml_p)
                ml_tmp = np.random.choice(self.ml_p['algorithm'].unique())
                p_tmp = np.random.choice(self.ml_p.loc[self.ml_p['algorithm']==ml_tmp,
                                                          'parameters'])
                # if dataset_id is not None:
                #     rec_not_new = (dataset_id + '|' + ml_tmp + '|' + p_tmp in
                #                    self.trained_dataset_models)
                # else:
                #     rec_not_new = False
                # if n==999:
                #     print('warning: tried 10 times (and failed) to find a novel recommendation')
                ml_rec.append(ml_tmp)
                p_rec.append(p_tmp)
                rec_score.append(0) 
            # if a dataset is specified, do not make recommendations for
            # algorithm-parameter combos that have already been run
            
            #if dataset_id is not None:
            #    rec = [r for r in rec if dataset_id + '|' + r not in
            #           self.trained_dataset_models]

            #ml_rec = [r.split('|')[0] for r in rec]
            #p_rec = [r.split('|')[1] for r in rec]
            #rec_score = [0 for r in rec]
        except AttributeError:
            print('rec:', rec)
            print('self.scores:', self.scores)
            print('self.w:', self.w)
            raise AttributeError

        if dataset_id is not None:
            self.trained_dataset_models.update(
                                        ['|'.join([dataset_id, ml, p])
                                        for ml, p in zip(ml_rec, p_rec)])

        return ml_rec, p_rec, rec_score
