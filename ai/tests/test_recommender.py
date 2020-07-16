# tests for Penn AI recommender
# from tests.context import test_recommender
import pandas as pd
import numpy as np
from ai.recommender.random_recommender import RandomRecommender
from ai.recommender.average_recommender import AverageRecommender
from ai.recommender.knn_meta_recommender import KNNMetaRecommender
from ai.recommender.surprise_recommenders import (CoClusteringRecommender, 
        KNNWithMeansRecommender, KNNDatasetRecommender, KNNMLRecommender,
        SlopeOneRecommender, SVDRecommender)

import pdb
import logging
import os
from nose.tools import (nottest, raises, assert_equals, assert_in, 
        assert_not_in, assert_is_none)
import json

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


# set up data for tests.
# print('loading pmlb results data...')
# TODO: replace this dataset loading and metafeature loading with calls to 
# knowledgebase loader
KB_RESULTS_PATH = \
    'data/knowledgebases/sklearn-benchmark-data-knowledgebase-r6-small.tsv.gz'
KB_METAFEATURES_PATH = \
        'data/knowledgebases/pmlb_classification_metafeatures.csv.gz'

data = pd.read_csv(KB_RESULTS_PATH, compression='gzip', sep='\t')
metafeatures = pd.read_csv(KB_METAFEATURES_PATH, index_col=0, 
        float_precision='round_trip')

def get_metafeatures(d):
    """Fetch dataset metafeatures from file"""
    # print('getting metafeatures for',d)
    df = metafeatures.loc[[d]]
    return df

def get_metafeatures_by_id(d):
    """Fetch dataset metafeatures from file"""
    # print('getting metafeatures for',d)
    df = metafeatures.loc[metafeatures._id == d]
    return df

pennai_classifiers = ['LogisticRegression', 'RandomForestClassifier', 'SVC',
                          'KNeighborsClassifier', 'DecisionTreeClassifier',
                          'GradientBoostingClassifier']
mask = np.array([c in pennai_classifiers for c in data['algorithm'].values])
data = data.loc[mask, :]
data['parameters'] = data['parameters'].apply(lambda x: eval(x))
data['alg_name'] = data['algorithm']
ml_p = data.loc[:,['algorithm','parameters']]
ml_p['parameters'] = ml_p['parameters'].apply(str)
ml_p = ml_p.drop_duplicates()
ml_p['parameters'] = ml_p['parameters'].apply(lambda x: eval(x))

# data['_id'] = data['dataset'].apply(
#         lambda x: get_metafeatures(x)['_id'])
# data.set_index('_id')
#ml - param combos

test_recommenders = [RandomRecommender, AverageRecommender, KNNMetaRecommender,
        CoClusteringRecommender, KNNWithMeansRecommender, 
        KNNDatasetRecommender, KNNMLRecommender, SlopeOneRecommender, 
        SVDRecommender ]


def update_dataset_mf(dataset_mf,results_data):
    """Grabs metafeatures of datasets in results_data

    :param results_data: experiment results with associated datasets

    """
    logger.info('in update_dataset_mf')
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
    dataset_mf['_metafeature_version'] = 2.0
    # dataset_mf['_id'] = 'test_hash'

    return dataset_mf

def check_rec(rec):
    """Recommender updates and recommends without error"""
    # test updating scores
    logger.info("check_rec({})".format(rec))
    print("check_rec({})".format(rec))

    epochs = 5
    datlen = int(data.shape[0] / float(epochs))
    rec_obj = rec(ml_p=ml_p)
 
    n_recs = 1
    dataset_mf = pd.DataFrame()
    new_data = data.sample(n=100)
    dataset_mf = update_dataset_mf(dataset_mf, new_data)
    rec_obj.update(new_data, dataset_mf)
    # test making recommendations
    for n in np.arange(epochs):
        for d in list(data['_id'].unique())[:10]:
            ml, p, scores = rec_obj.recommend(d,
                                          n_recs=n_recs,
                                          dataset_mf=get_metafeatures_by_id(d))
            logger.debug("{0},{1},{2} :ml:{3}, p:{4}, scores={5}".format(
                rec.__name__,n,d,ml,p,scores))

def save_and_load(rec):
    """Rec can be saved and loaded without error"""
    logger.info("check_n_recs({})".format(rec))
    print("check_n_recs({})".format(rec))

    ml_p = data.loc[:,['algorithm','parameters']]
    ml_p['parameters'] = ml_p['parameters'].apply(str)
    ml_p = ml_p.drop_duplicates()
    ml_p['parameters'] = ml_p['parameters'].apply(lambda x: eval(x))
   
    logger.info('setting rec 1 ==================')
    rec_obj = rec(ml_p=ml_p, random_state=12)
   
    dataset_mf = pd.DataFrame()
    new_data = data.sample(n=100)
    dataset_mf = update_dataset_mf(dataset_mf, new_data)
    rec_obj.update(new_data, dataset_mf)

    #save the recommender
    filename = type(rec_obj).__name__ + '_test.pkl.gz'
    rec_obj.save(filename=filename)

    # now, load saved test file
    logger.info('setting rec 2 ==================')
    rec_obj2 = rec(ml_p=ml_p, filename=filename, knowledgebase=new_data, 
            random_state=12)

    # clean up pickle file generated if it exists
    if os.path.exists(filename):
        os.remove(filename)
    value = { k : rec_obj2.__dict__[k] 
            for k in set(rec_obj2.__dict__) - set(rec_obj.__dict__) }
    
    print('recommender differences (in 2, not in 1):',value)

    value = { k : rec_obj.__dict__[k] 
            for k in set(rec_obj.__dict__) - set(rec_obj2.__dict__) }
    print('recommender differences (in 1, not in 2):',value)

def test_recs_work():
    """Each recommender updates and recommends without error"""
    logger.info("test_recs_work")
    print("test_recs_work")
    for recommender in test_recommenders:
        yield (check_rec, recommender)

def check_n_recs(rec):
    """Recommender returns correct number of recommendations"""
    logger.info("check_n_recs({})".format(rec))
    print("check_n_recs({})".format(rec))

    
   
    logger.info('setting rec')
    rec_obj = rec(ml_p=ml_p)
    logger.info('set rec')
   
    dataset_mf = pd.DataFrame()
    new_data = data.sample(n=100)
    dataset_mf = update_dataset_mf(dataset_mf, new_data)
    rec_obj.update(new_data, dataset_mf)
    # test updating scores
    for n_recs in np.arange(5):
        for d in list(data['_id'].unique())[:10]:
            ml, p, scores = rec_obj.recommend(d,n_recs=n_recs,
                                         dataset_mf=get_metafeatures_by_id(d))
            assert(len(ml)==n_recs)
            assert(len(p)==n_recs)
            assert(len(scores)==n_recs)

def test_n_recs():
    """Recommender returns correct number of recommendations"""
    logger.info("test_n_recs")
    print("test_n_recs")
    for recommender in test_recommenders:
        yield (check_n_recs, recommender)

def test_save_and_load():
    """Load function works"""
    for recommender in test_recommenders:
        yield (save_and_load, recommender)

def test_default_saved_recommender_filename():
    """Test that the expected default filename is generated"""

    test_data = [
        [RandomRecommender, "classifier", None, 
            "RandomRecommender_classifier_bal_accuracy_pmlb_20200505.pkl.gz"], 
        [RandomRecommender, "regressor", None, 
            "RandomRecommender_regressor_mse_pmlb_20200505.pkl.gz"],
        [KNNMetaRecommender, "classifier", None, 
            "KNNMetaRecommender_classifier_bal_accuracy_pmlb_20200505.pkl.gz"], 
        [KNNMetaRecommender, "regressor", None, 
            "KNNMetaRecommender_regressor_mse_pmlb_20200505.pkl.gz"],
        [SVDRecommender, "classifier", None, 
            "SVDRecommender_classifier_bal_accuracy_pmlb_20200505.pkl.gz"], 
        [SVDRecommender, "regressor", None, 
            "SVDRecommender_regressor_mse_pmlb_20200505.pkl.gz"],
    ]

    for (rec_class, ml_type, metric, expected_filename) in test_data:
        yield (check_default_saved_recommender_filename,
            rec_class,
            ml_type, 
            metric, 
            expected_filename)


def check_default_saved_recommender_filename(
    rec_class,
    ml_type, 
    metric, 
    expected_filename):

    rec = rec_class(
        ml_p=ml_p,
        ml_type=ml_type,
        metric = metric) 

    assert_equals(
        rec._default_saved_recommender_filename(),
        expected_filename)



def test_generate_recommender_path():
    test_data = [
        [RandomRecommender, "classifier", None, 
            None, "my/custom/path",
            "my/custom/path/RandomRecommender_classifier_bal_accuracy_pmlb_20200505.pkl.gz"], 
        [RandomRecommender, "regressor", None, 
            None, "my/custom/path",
            "my/custom/path/RandomRecommender_regressor_mse_pmlb_20200505.pkl.gz"],
        [SVDRecommender, "classifier", None, 
            "myCustomFilename.tmp", None,
            "./myCustomFilename.tmp"], 
        [SVDRecommender, "regressor", None, 
            "myCustomFilename.tmp", None,
            "./myCustomFilename.tmp"],
        [SVDRecommender, "regressor", None, 
            "myCustomFilename.tmp", "my/custom/path",
            "my/custom/path/myCustomFilename.tmp"],
    ]

    for (
        rec_class, 
        ml_type, 
        metric,
        saved_recommender_filename,
        saved_recommmender_directory,
        expected_path) in test_data:
        yield (check_generate_recommender_path,
            rec_class,
            ml_type, 
            metric,
            saved_recommender_filename,
            saved_recommmender_directory, 
            expected_path)

def check_generate_recommender_path(
    rec_class,
    ml_type, 
    metric, 
    saved_recommender_filename,
    saved_recommmender_directory,
    expected_path):

    rec = rec_class(
        ml_p=ml_p,
        ml_type=ml_type,
        metric = metric) 

    assert_equals(
        rec._generate_saved_recommender_path(
            saved_recommender_filename,
            saved_recommmender_directory),
        expected_path)


@raises(Exception)
def test_generate_recommender_path_exception():

    rec = SVDRecommender(
        ml_p=ml_p,
        ml_type=ml_type,
        metric = metric) 

    rec._generate_saved_recommender_path(None, None)