# tests for Penn AI recommender
# from tests.context import test_recommender
import pandas as pd
import numpy as np
from ai.recommender.random_recommender import RandomRecommender
from ai.recommender.average_recommender import AverageRecommender
from ai.recommender.knn_meta_recommender import KNNMetaRecommender
#from ai.ai import AI
import pdb

import json
# set up data for tests.
# print('loading pmlb results data...')
data = pd.read_csv('ai/metalearning/sklearn-benchmark5-data-short.tsv.gz',
                   compression='gzip', sep='\t',
                   names=['dataset',
                          'classifier',
                          'parameters',
                          'accuracy',
                          'macrof1',
                          'bal_accuracy']).fillna('')
pennai_classifiers = ['LogisticRegression', 'RandomForestClassifier', 'SVC',
                          'KNeighborsClassifier', 'DecisionTreeClassifier',
                          'GradientBoostingClassifier']
mask = np.array([c in pennai_classifiers for c in data['classifier'].values])
data = data.loc[mask, :]
data = data.rename(columns={'classifier': 'algorithm'})

def get_metafeatures(d):
    """Fetch dataset metafeatures from file"""
    try:
       with open('ai/tests/metafeatures/api/datasets/'+d+'/metafeatures.json') as data_file:    
               data = json.load(data_file)
    except Exception as e:
        print('exception when grabbing metafeature data for',d)
        raise e
    
    df = pd.DataFrame.from_records(data,columns=data.keys(),index=[0])
    df['dataset'] = d
    df.sort_index(axis=1, inplace=True)

    # print('df:',df)
    return df

def update_dataset_mf(dataset_mf,results_data):
    """Grabs metafeatures of datasets in results_data
    
    :param results_data: experiment results with associated datasets
    
    """
    print('in update_dataset_mf')
    # print('results_data:',results_data.columns)
    # print('results_data:',results_data.head())
    dataset_metafeatures = []
    for d in results_data['dataset'].unique():
        if len(dataset_mf)==0 or d not in dataset_mf.index:
            # fetch metafeatures from server for dataset and append
            df = get_metafeatures(d)        
            df['dataset'] = d
            # print('metafeatures:',df)
            dataset_metafeatures.append(df)
    if dataset_metafeatures:
        df_mf = pd.concat(dataset_metafeatures).set_index('dataset')
        # print('df_mf:',df_mf['dataset'], df_mf) 
        dataset_mf = dataset_mf.append(df_mf)
        # print('dataset_mf:\n',dataset_mf)

    return dataset_mf

def test_ave_rec():
    """Ave recommender updates and recommends without error"""

    # test updating scores
    epochs = 5 
    datlen = int(data.shape[0] / float(epochs))
    pennai = AverageRecommender()
    n_recs = 1
    for n in np.arange(epochs):
        new_data = data.iloc[n * datlen:(n + 1) * datlen]
        pennai.update(new_data)
        ml, p, scores = pennai.recommend(n_recs=n_recs)
        print(str(n), ': ml:', ml,', p:', p, 'scores=', scores)

def test_knn_rec():
    """KNN recommender updates and recommends without error"""

    # test updating scores
    epochs = 5 
    datlen = int(data.shape[0] / float(epochs))
    pennai = KNNMetaRecommender()
    n_recs = 1
    dataset_mf = pd.DataFrame()
    
    for n in np.arange(epochs):
        new_data = data.iloc[n * datlen:(n + 1) * datlen]
        dataset_mf = update_dataset_mf(dataset_mf, new_data)
        pennai.update(new_data, dataset_mf)
        for d in data.dataset.unique(): 
            ml, p, scores = pennai.recommend(d,
                                             n_recs=n_recs,
                                             dataset_mf=get_metafeatures(d))
            print(str(n),d, ': ml:', ml,', p:', p, 'scores=', scores)


# @mock.patch('requests.post',autospec=True)
def test_rand_rec():
    """Rand recommender updates and recommends without error"""

    # test updating scores
    epochs = 5
    datlen = int(data.shape[0] / float(epochs))
    # set up mock ml_p for random recommender
    ml_p = data.loc[:,['algorithm','parameters']].drop_duplicates() 
    pennai = RandomRecommender(ml_p=ml_p)
    n_recs = 1
    for n in np.arange(epochs):
        new_data = data.iloc[n * datlen:(n + 1) * datlen]
        pennai.update(new_data)
        ml, p, scores = pennai.recommend(n_recs=n_recs)
        print(str(n), ': ml:', ml,', p:', p, 'scores=', scores)

def test_n_recs():
    """Recommender returns correct number of recommendations"""

    ml_p = data.loc[:,['algorithm','parameters']].drop_duplicates() 
    for recommender in [AverageRecommender, RandomRecommender, KNNMetaRecommender]:
        print(recommender)
        if recommender is RandomRecommender:
            pennai = recommender(ml_p=ml_p)
        else:
            pennai = recommender()
        dataset_mf = pd.DataFrame()
        dataset_mf = update_dataset_mf(dataset_mf,data)
        pennai.update(data,dataset_mf)
        # test updating scores
        for n_recs in np.arange(10):
            for d in data.dataset.unique(): 
                ml, p, scores = pennai.recommend(d,n_recs=n_recs,
                                                 dataset_mf=get_metafeatures(d))
                print('len ml:',len(ml))
                assert(len(ml)==n_recs)
                assert(len(p)==n_recs)
                assert(len(scores)==n_recs)
