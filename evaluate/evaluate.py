import pandas as pd
import numpy as np

def evaluate_recommender(recommender):
    data = pd.read_csv('metalearning/sklearn-benchmark5-data-edited.tsv.gz',
                       compression='gzip', sep='\t',
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
    data = data.loc[mask, :]
    data = data.rename(columns={'classifier': 'algorithm'})
    pennai = recommender()
    pennai.update(data)
    ml, p, scores = pennai.recommend()
    print('ml:', ml[0])
    print('p:', p[0])
    del pennai

    # test updating scores
    epochs = 100
    datlen = int(data.shape[0] / float(epochs))
    pennai = recommender()
    n_recs = 1
    for n in np.arange(epochs):
        new_data = data.iloc[n * datlen:(n + 1) * datlen]
        pennai.update(new_data)
        ml, p, scores = pennai.recommend(n_recs=n_recs)
        print(str(n), ': ml:', ml,', p:', p, 'scores=', scores)
