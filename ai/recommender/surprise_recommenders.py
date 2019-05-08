# Recommender system for Penn AI.
import pandas as pd
# import json 
# import urllib.request, urllib.parse
from .base import BaseRecommender
#from ..metalearning import get_metafeatures
from sklearn.preprocessing import RobustScaler 
from sklearn.pipeline import Pipeline
import numpy as np
from collections import defaultdict, OrderedDict
import pdb
from surprise import (Reader, Dataset, CoClustering, SlopeOne, KNNWithMeans,
                      KNNBasic) 
# import pyximport
# pyximport.install()
# from .svdedit import mySVD
from collections import defaultdict
import itertools as it
import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)
ch = logging.StreamHandler()
formatter = logging.Formatter('%(module)s: %(levelname)s: %(message)s')
ch.setFormatter(formatter)
logger.addHandler(ch)


class SurpriseRecommender(BaseRecommender):
    """Penn AI Surprise recommender.
    Recommends machine learning algorithms and parameters using the Surprise algorithm.
        - stores ML + P and every dataset.
        - learns a matrix factorization on the non-missing data.
        - given a dataset, estimates the rankings of all ML+P and returns the top 
        n_recs. 

    Parameters
    ----------
    ml_type: str, 'classifier' or 'regressor'
        Recommending classifiers or regressors. Used to determine ML options.
    
    metric: str (default: accuracy for classifiers, mse for regressors)
        The metric by which to assess performance on the datasets.
    """
    def __init__(self, ml_type='classifier', metric=None, ml_p=None, algo=None): 
        """Initialize recommendation system."""
        if self.__class__.__name__ == 'SurpriseRecommender':
            raise RuntimeError('Do not instantiate the SurpriseRecommender class '
            'directly; use one of the method-specific classes instead.')
        super().__init__(ml_type, metric, ml_p)
        
        # store results
        self.results_df = pd.DataFrame()
        # reader for translating btw PennAI results and Suprise training set
        self.reader = Reader()
        # algo is the online Surprise-based rec system
        # if algo is None:
        #     self.algo = KNNBasic() 
        # else:
        #     self.algo = algo
        
        self.first_fit = True
        self.max_epochs = 100
    
    @property
    def algo_name(self):
        return type(self.algo).__name__

    def update(self, results_data, results_mf=None, source='pennai'):
        """Update ML / Parameter recommendations based on overall performance in 
        results_data.

        :param results_data: DataFrame with columns corresponding to:
                'dataset'
                'algorithm'
                'parameters'
                self.metric
        :param results_mf: metafeatures for the datasets in results_data 
        """

        # update trained dataset models and hash table
        super().update(results_data, results_mf, source)

        # update internal model
        self.update_model(results_data)

    def update_training_data(self,results_data):
        """Fill in new data from the results and set trainset for svd"""

        results_data.loc[:, 'algorithm-parameters'] =  (
                results_data['algorithm'].values + '|' +
                results_data['parameter_hash'].values)
        results_data.rename(columns={self.metric:'score'},inplace=True)
        self.results_df = self.results_df.append(
                results_data[['algorithm-parameters','dataset','score']]
                                                ).drop_duplicates()

        data = Dataset.load_from_df(self.results_df[['dataset', 
                                                     'algorithm-parameters', 
                                                     'score']], 
                                    self.reader, rating_scale=(0,1))
        # build training set from the data
        self.trainset = data.build_full_trainset()
        logger.debug('self.trainset # of ML-P combos: ' + 
                str(self.trainset.n_items))
        logger.debug('self.trainset # of datasets: ' + str(self.trainset.n_users))

    def update_model(self,results_data):
        """Stores new results and updates algo."""
        logger.debug('updating '+self.algo_name+' model')
        # shuffle the results data the first time
        if self.first_fit:
            results_data = results_data.sample(frac=1)

        self.update_training_data(results_data)
        logger.debug('fitting self.algo...')
        # set the number of training iterations proportionally to the amount of
        # results_data
        self.algo.fit(self.trainset)
        logger.debug('done.')
        if self.first_fit:
            self.init_results_data = results_data
            self.first_fit=False
        logger.debug('model '+self.algo_name+' updated') 

    def recommend(self, dataset_id, n_recs=1, dataset_mf = None):
        """Return a model and parameter values expected to do best on dataset.

        Parameters
        ----------
        dataset_id: string
            ID of the dataset for which the recommender is generating recommendations.
        n_recs: int (default: 1), optional
            Return a list of length n_recs in order of estimators and parameters expected to do 
            best.
        """
        try:
            predictions = []
            filtered =0
            for alg_params in self.mlp_combos:
                if (dataset_id+'|'+alg_params not in 
                    self.trained_dataset_models):  
                    predictions.append(self.algo.predict(dataset_id, alg_params,
                                                         clip=False))
                else:
                    filtered +=1
                    # logger.debug('skipping ' + str(dataset_id) +'|'+
                    #         alg_params.split('|')[0] + 
                    #       str(self.param_htable[int(alg_params.split('|')[1])]) +
                    #       ' which has already been recommended')
            logger.debug('filtered '+ str(filtered) + ' recommendations')
            logger.debug('getting top n predictions') 
            ml_rec, phash_rec, score_rec = self.get_top_n(predictions, n_recs)
            logger.debug('returning ml recs') 
            # for (m,p,r) in zip(ml_rec, p_rec, score_rec):
            #     print('ml_rec:', m, 'p_rec', p, 'score_rec',r)
            
        except Exception as e:
            logger.error( 'error running self.best_model_prediction for',dataset_id)
            raise e 
        # update the recommender's memory with the new algorithm-parameter combos 
        # that it recommended
        self.update_trained_dataset_models_from_rec(dataset_id, ml_rec, phash_rec)

        p_rec = [self.param_htable[int(ph)] for ph in phash_rec]
        return ml_rec, p_rec, score_rec

    def get_top_n(self,predictions, n=10):
        '''Return the top-N recommendation for each user from a set of predictions.
        
        Args:
            predictions(list of Prediction objects): The list of predictions, as
                returned by the test method of an algorithm.
            n(int): The number of recommendation to output for each user. Default
                is 10.

        Returns:
            ml recs, parameter recs, and their scores in three lists
        '''

        # grabs the ml ids and their estimated scores for this dataset 
        top_n = [] 
        ml_dist = {}
        for uid, iid, true_r, est, _ in predictions:
            top_n.append((iid, est))
            ml = iid.split('|')[0]
            if ml in ml_dist.keys():
                ml_dist[ml] += 1
            else:
                ml_dist[ml] = 1
        n_ml = len(ml_dist.keys())

        ######
        # Shuffle top_n just to remove tied algorithm bias when sorting
        # Make uniform random choices from the Algorithms, then uniform random
        # choices from their parameters to shuffle top_n
        # the probability for each ML method is 1/total_methods/(# instances of that
        # method)
        inv_ml_dist = {k:1/n_ml/v for k,v in ml_dist.items()}
        top_n_dist = np.array([inv_ml_dist[tn[0].split('|')[0]] for tn in top_n])
        top_n_idx = np.arange(len(top_n))
        top_n_idx_s = np.random.choice(top_n_idx, len(top_n), replace=False, 
                                       p=top_n_dist)
        top_n = [top_n[i] for i in top_n_idx_s]
        #####
        
        # sort top_n
        top_n = sorted(top_n, key=lambda x: x[1], reverse=True)[:n]

        logger.debug('filtered top_n:'+str(top_n)) 
        ml_rec = [n[0].split('|')[0] for n in top_n]
        p_rec = [n[0].split('|')[1] for n in top_n]
        score_rec = [n[1] for n in top_n]
        return ml_rec, p_rec, score_rec 

class CoClusteringRecommender(SurpriseRecommender):
    # algo = CoClustering()

    def __init__(self, ml_type='classifier', metric=None, ml_p=None, algo=None): 
        super().__init__(ml_type, metric, ml_p, algo)
        # set n clusters for ML equal to # of ML methods
        self.algo = CoClustering(n_cltr_i = self.ml_p.algorithm.nunique(),
                                 n_cltr_u = 10)

class KNNWithMeansRecommender(SurpriseRecommender):
    algo = KNNWithMeans()

class KNNDatasetRecommender(SurpriseRecommender):
    algo = KNNBasic(sim_options={'user_based':True})

class KNNMLRecommender(SurpriseRecommender):
    algo = KNNBasic(sim_options={'item_based':False})

class SlopeOneRecommender(SurpriseRecommender):
    algo = SlopeOne()
