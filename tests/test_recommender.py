# tests for Penn AI recommender
# from tests.context import test_recommender
import pandas as pd
import numpy as np
from ai.recommender.base import Recommender
from ai.ai import AI
import pdb
def test_ml_p():
    """Recommender returns a valid recommendation for sklearn data"""

    # get sklearn benchmark results
    print('loading pmlb results data...')
    data = pd.read_csv('metalearning/sklearn-benchmark5-data-edited.tsv.gz',
                       compression='gzip',sep='\t',
                       names=['dataset',
                              'classifier',
                              'parameters',
                              'accuracy',
                              'macrof1',
                              'bal_accuracy']).fillna('')
    # filter results to pennai classifiers
    pennai_classifiers = ['LogisticRegression', 'RandomForestClassifier', 'SVC',
                          'KNeighborsClassifier', 'DecisionTreeClassifier',
                          'GradientBoostingClassifier']
    mask = np.array([c in pennai_classifiers for c in data['classifier'].values])
    data = data.loc[mask,:]
    data = data.rename(columns={'classifier':'algorithm'})
    pennai = Recommender()
    pennai.update(data)
    ml,p,scores = pennai.recommend()
    print('ml:',ml[0])
    print('p:',p[0])
    del pennai

    # test updating scores
    epochs=100
    datlen = int(data.shape[0]/epochs)
    pennai = Recommender()
    n_recs=1
    for n in np.arange(epochs):
        new_data = data.iloc[n*datlen:(n+1)*datlen]
        # pdb.set_trace()
        pennai.update(new_data)
        ml,p,scores = pennai.recommend(n_recs=n_recs)
        # pdb.set_trace()
        #'p:',p,
        print(str(n),': ml:',ml,', p:',p,'scores=',
              scores)

    # pennai.update(data2)
    # ml,p = pennai.recommend()
    # print('ml2:',ml)
    # print('p2:',p)

def test_db_grab():
    """loading database grabs right info"""
    pennai= AI()
    pennai.db_to_results_data()

print('running test_ml_p')
test_ml_p()
