# tests for Penn AI recommender
# from tests.context import test_recommender
import pandas as pd
import numpy as np
from ai.recommender.random_recommender import RandomRecommender
from ai.recommender.average_recommender import AverageRecommender
from ai.recommender.knn_meta_recommender import KNNMetaRecommender
from ai.recommender.svd_recommender import SVDRecommender
#from ai.ai import AI
import pdb

import json
# set up data for tests.
# print('loading pmlb results data...')
# TODO: replace this dataset loading and metafeature loading with calls to 
# knowledgebase loader
data = pd.read_csv(
        'data/knowledgebases/sklearn-benchmark5-data-knowledgebase.tsv.gz',
        compression='gzip', sep='\t')
pennai_classifiers = ['LogisticRegression', 'RandomForestClassifier', 'SVC',
                          'KNeighborsClassifier', 'DecisionTreeClassifier',
                          'GradientBoostingClassifier']
mask = np.array([c in pennai_classifiers for c in data['algorithm'].values])
data = data.loc[mask, :]
data['parameters'] = data['parameters'].apply(lambda x: eval(x))
data.set_index('dataset')
#ml - param combos

def get_metafeatures(d):
    """Fetch dataset metafeatures from file"""
    try:
       with open('data/knowledgebases/metafeatures/'+
               d+'/metafeatures.json') as data_file:    
               data = json.load(data_file)
    except Exception as e:
        print('exception when grabbing metafeature data for',d)
        raise e

    df = pd.DataFrame.from_records(data,columns=data.keys(),index=[0])
    # df['dataset'] = d
    # df.sort_index(axis=1, inplace=True)
    # df['metafeature_version'] = 1.0
    # df['dataset_hash'] = 'test_hash'

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
    dataset_mf['metafeature_version'] = 1.0
    dataset_mf['dataset_hash'] = 'test_hash'

    return dataset_mf

def check_rec(rec):
    """Recommender updates and recommends without error"""
    # test updating scores
    epochs = 5
    datlen = int(data.shape[0] / float(epochs))
    ml_p = data.loc[:,['algorithm','parameters']]
    ml_p['parameters'] = ml_p['parameters'].apply(str)
    ml_p = ml_p.drop_duplicates()
    ml_p['parameters'] = ml_p['parameters'].apply(lambda x: eval(x))
    # print('ml_p:',ml_p)
    rec_obj = rec(ml_p=ml_p)
    print('param_htable:',len(rec_obj.param_htable),'objects')
 
    n_recs = 1
    dataset_mf = pd.DataFrame()
    new_data = data.sample(n=100)
    dataset_mf = update_dataset_mf(dataset_mf, new_data)
    rec_obj.update(new_data, dataset_mf)
    # test making recommendations
    for n in np.arange(epochs):
        for d in data.dataset.unique():
            ml, p, scores = rec_obj.recommend(d,
                                          n_recs=n_recs,
                                          dataset_mf=get_metafeatures(d))
            print(rec.__name__,str(n),d, ': ml:', ml,', p:', p, 'scores=', scores)

def test_recs_work():
    """Each recommender updates and recommends without error"""
    for recommender in [AverageRecommender, RandomRecommender, KNNMetaRecommender,
                        SVDRecommender]:
        yield (check_rec, recommender)

def check_n_recs(rec):
    """Recommender returns correct number of recommendations"""
    print(rec)
    ml_p = data.loc[:,['algorithm','parameters']]
    ml_p['parameters'] = ml_p['parameters'].apply(str)
    ml_p = ml_p.drop_duplicates()
    ml_p['parameters'] = ml_p['parameters'].apply(lambda x: eval(x))
   
    print('setting rec')
    rec_obj = rec(ml_p=ml_p)
    print('set rec')
   
    new_data = data.sample(n=100)
    dataset_mf = update_dataset_mf(dataset_mf, new_data)
    rec_obj.update(new_data, dataset_mf)
    # test updating scores
    for n_recs in np.arange(10):
        for d in data.dataset.unique():
            ml, p, scores = rec_obj.recommend(d,n_recs=n_recs,
                                             dataset_mf=get_metafeatures(d))
            assert(len(ml)==n_recs)
            assert(len(p)==n_recs)
            assert(len(scores)==n_recs)

def test_n_recs():
    """Recommender returns correct number of recommendations"""
    for recommender in [AverageRecommender, RandomRecommender, KNNMetaRecommender,
                        SVDRecommender]:
        yield (check_rec, recommender)
