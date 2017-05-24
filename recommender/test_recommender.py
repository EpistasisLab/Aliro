# tests for Penn AI recommender

import pandas as pd
import numpy as np
from recommender import Recommender
import pdb
def test_ml_p():
    """Recommender returns a valid recommendation for sklearn data"""

    # get sklearn benchmark results
    print('loading pmlb results data...')
    data = pd.read_csv('../metalearning/sklearn-benchmark5-data.tsv.gz',
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

    pennai = Recommender()
    pennai.update(data)
    ml,p = pennai.recommend()
    print('ml:',ml)
    print('p:',p)
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
        ml,p = pennai.recommend(n_recs=n_recs)
        # pdb.set_trace()
        #'p:',p,
        if n_recs>1:
            print(str(n),': ml:',ml,', p:',p,'scores=',
                  [pennai.scores[mle+':'+pe] for mle,pe in zip(ml,p)])
        else:
            print(str(n),': ml:',ml,', p:',p,'scores=',pennai.scores[ml+':'+p])

    # pennai.update(data2)
    # ml,p = pennai.recommend()
    # print('ml2:',ml)
    # print('p2:',p)

def test_db_grab():
    """loading database grabs right info"""
    pennai= Recommender()
    pennai.db_to_results_data()

test_db_grab()
