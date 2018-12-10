"""
Recommender system for Penn AI.
"""
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
from surprise import SVD, Reader, Dataset
from collections import defaultdict

class SVDRecommender(BaseRecommender):
    """Penn AI SVD recommender.
    Recommends machine learning algorithms and parameters using the SVD++ algorithm.
        - stores ML + P and every dataset.
        - learns a matrix factorization on the non-missing data.
        - given a dataset, estimates the rankings of all ML+P and returns the top n_recs. 

    Parameters
    ----------
    ml_type: str, 'classifier' or 'regressor'
        Recommending classifiers or regressors. Used to determine ML options.
    
    metric: str (default: accuracy for classifiers, mse for regressors)
        The metric by which to assess performance on the datasets.
    """
    def __init__(self, ml_type='classifier', metric=None, ml_p=None, datasets=None): 
        """Initialize recommendation system."""
        if ml_type not in ['classifier', 'regressor']:
            raise ValueError('ml_type must be "classifier" or "regressor"')

        self.ml_type = ml_type
        
        if metric is None:
            self.metric = 'bal_accuracy' if self.ml_type == 'classifier' else 'mse'
        else:
            self.metric = metric

        # get ml+p combos
        self.ml_p = ml_p
        # get dataset names
        self.datasets = datasets
        for mlp in self.ml_p:
            for data in self.datasets:
                results_dict['dataset'].append(data)
                results_dict['algorithm'].append(mlp)
                results_dict['score'].append('')
        
        self.results = pd.DataFrame(results_dict).set_index(['dataset','algorithm'])
        
        reader = Reader(rating_scale=(0,1))
        # The columns must correspond to dataset id, algorithm id and score (in that order).
        self.trainset = Dataset.load_from_df(df[['dataset', 'algorithm', 'score']], reader)
        self.algo = SVD()
        
    def update(self, results_data, results_mf=None):
        """Update ML / Parameter recommendations based on overall performance in results_data.

        :param results_data: DataFrame with columns corresponding to:
                'dataset'
                'algorithm'
                'parameters'
                self.metric
        :param results_mf: metafeatures for the datasets in results_data 
        """

        # update trained dataset models
        self.set_trained_dataset_models(results_data)

        # update internal model
        self.update_model(results_data)

    def set_trained_dataset_models(self, results_data):
        results_data.loc[:, 'dataset-algorithm-parameters'] = (
                                       results_data['dataset'].values + '|' +
                                       results_data['algorithm'].values + '|' +
                                       results_data['parameters'].values)

        # get unique dataset / parameter / classifier combos in results_data
        d_ml_p = results_data['dataset-algorithm-parameters'].unique()
        self.trained_dataset_models.update(d_ml_p)

    def update_training_data(self,results_data):
        """Fill in new data from the results"""
        for row in results_data.iterrows():
            self.results.loc[(row['dataset'],
                              row['algorithm']+'|'+row['parameters'])]['score'] = row[self.metric]
        
        self.trainset = Dataset.load_from_df(self.results[['dataset', 'algorithm', 'score']], 
                                             reader)

    def update_model(self,results_data):
        """Stores new results and updates SVD."""
        print('updating model')
        
        self.update_training_data(results_data)

        self.algo.partial_fit(self.trainset)
        
        print('model updated')
                
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
        # TODO: raise error if dataset_mf is None 
        try:
	    predictions = self.alg.predict(dataset_id, self.results.index)
		
            ml_rec, p_rec, rec_score = predictions[0], predictions[1], predictions[2] 
            
            ml_rec, p_rec, rec_score = self.filter_repeats(dataset_id, ml_rec, p_rec, rec_score,
                    					   n_recs)
	    ml_rec, p_rec, rec_score = self.get_top_n(n_recs)
            
	    for (m,p,r) in zip(ml_rec, p_rec, rec_score):
                print('ml_rec:', m, 'p_rec', p, 'rec_score',r)
            
        except Exception as e:
            print( 'error running self.best_model_prediction for',dataset_id)
            # print('ml_rec:', ml_rec)
            # print('p_rec', p_rec)
            # print('rec_score',rec_score)
            raise e 

        # update the recommender's memory with the new algorithm-parameter combos 
        # that it recommended

        self.trained_dataset_models.update(
                                    ['|'.join([dataset_id, ml, p])
                                    for ml, p in zip(ml_rec, p_rec)])

        return ml_rec, p_rec, rec_score

    def filter_repeats(self, dataset_id, ml_rec, p_rec, rec_score, n_recs):
        """Uses trained_dataset_models to filter recs that have already been run"""
        # Filter recommendations for
        # algorithm-parameter combos that have already been run
        rec = ['|'.join([dataset_id, ml, p]) for ml, p in zip(ml_rec, p_rec)]
        try:
            frec,idx = zip(*((r,i) for i,r in enumerate(rec) 
                             if r not in self.trained_dataset_models))
        except ValueError as e:
            print("WARNING: can't filter results, probably all recommmendations are repeats")
            return ml_rec, p_rec, rec_score

        # print('rec:',rec) 
        # print('idx:',idx) 
        if len(frec) >= n_recs:
            ml_rec = [r.split('|')[1] for r in frec]
            p_rec = [r.split('|')[2] for r in frec]
            rec_score = [rec_score[i] for i in idx]
        else:
            print("WARNING: can't filter recommendations, possibly repeating")
        return ml_rec, p_rec, rec_score

    def best_model_prediction(self, dataset_id, df_mf, n_recs=1):
        """Predict scores over many variations of ML+P and pick the best"""
        # get dataset metafeatures
        # df_mf = self.get_metafeatures(dataset_id) 
        mf = df_mf.drop('dataset',axis=1).fillna(0.0).values.flatten()

        # compute the neighbors of past results 
        nbrs = NearestNeighbors(n_neighbors=len(self.dataset_mf), algorithm='ball_tree')
        # print('fitting nbrs to self.dataset_mf with shape',
        #       self.dataset_mf.values.shape)
        rs = RobustScaler()
        X = rs.fit_transform(self.dataset_mf.values)
        nbrs.fit(X)
        # find n_recs nearest neighbors to new dataset
        # print('querying neighbors with mf of shape',mf.shape)
        distances,indices = nbrs.kneighbors(rs.transform(mf.reshape(1,-1)))
        # print('distances:',distances)
        # print('indices:',indices)
        dataset_idx = [self.dataset_mf.index[i] for i in indices[0]]
        # recommend the mlp results closest to the dataset in metafeature space
        ml_recs, p_recs, scores = [],[],[]

        # print('self.best_mlp:',self.best_mlp)
        for i,(d,dist) in enumerate(zip(dataset_idx,distances[0])):   
            if i < 10:
                print('closest dataset:',d,'distance:',dist)
            if dist > 0.0:    # don't recommend based on this same dataset
                ml_recs.append(self.best_mlp.loc[d,'algorithm'])
                p_recs.append(self.best_mlp.loc[d,'parameters'])
                scores.append(dist)

        return ml_recs,p_recs,scores

    def get_top_n(predictions, n=10):
	'''Return the top-N recommendation for each user from a set of predictions.

	Args:
	    predictions(list of Prediction objects): The list of predictions, as
		returned by the test method of an algorithm.
	    n(int): The number of recommendation to output for each user. Default
		is 10.

	Returns:
	A dict where keys are user (raw) ids and values are lists of tuples:
	    [(raw item id, rating estimation), ...] of size n.
	'''

	# First map the predictions to each user.
	top_n = defaultdict(list)
	for uid, iid, true_r, est, _ in predictions:
	    top_n[uid].append((iid, est))

	# Then sort the predictions for each user and retrieve the k highest ones.
	for uid, user_ratings in top_n.items():
	    user_ratings.sort(key=lambda x: x[1], reverse=True)
	    top_n[uid] = user_ratings[:n]

	return top_n
	    
