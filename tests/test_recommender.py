# tests for Penn AI recommender
# from tests.context import test_recommender
import pandas as pd
import numpy as np
from ai.recommender.random_recommender import RandomRecommender
from ai.recommender.average_recommender import AverageRecommender
#from ai.ai import AI
import pdb

# set up data for tests.
print('loading pmlb results data...')
data = pd.read_csv('metalearning/sklearn-benchmark5-data-short.tsv.gz',
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

def test_ave_rec():
    """Ave recommender updates and recommends without error"""

    # print('loading pmlb results data...')
    # pennai = AverageRecommender()
    # pennai.update(data)
    # ml, p, scores = pennai.recommend()
    # print('ml:', ml[0])
    # print('p:', p[0])
    # del pennai

    # test updating scores
    epochs = 100
    datlen = int(data.shape[0] / float(epochs))
    pennai = AverageRecommender()
    n_recs = 1
    for n in np.arange(epochs):
        new_data = data.iloc[n * datlen:(n + 1) * datlen]
        pennai.update(new_data)
        ml, p, scores = pennai.recommend(n_recs=n_recs)
        print(str(n), ': ml:', ml,', p:', p, 'scores=', scores)

def test_rand_rec():
    """Rand recommender updates and recommends without error"""

    # test updating scores
    epochs = 100
    datlen = int(data.shape[0] / float(epochs))
    pennai = RandomRecommender()
    n_recs = 1
    for n in np.arange(epochs):
        new_data = data.iloc[n * datlen:(n + 1) * datlen]
        pennai.update(new_data)
        ml, p, scores = pennai.recommend(n_recs=n_recs)
        print(str(n), ': ml:', ml,', p:', p, 'scores=', scores)

def test_n_recs():
    """Recommender returns correct number of recommendations"""
    for recommender in [AverageRecommender, RandomRecommender]:
        pennai = recommender()
        pennai.update(data)
        # test updating scores
        for n_recs in np.arange(10):
            ml, p, scores = pennai.recommend(n_recs=n_recs)
            assert(len(ml)==n_recs)
            assert(len(p)==n_recs)
            assert(len(scores)==n_recs)

def test_db_grab():
    """loading database grabs right info"""
    pennai= AI()
    pennai.db_to_results_data()

test_ave_rec()
test_rand_rec()
test_n_recs()
