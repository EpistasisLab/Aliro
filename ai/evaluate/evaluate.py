import pandas as pd
import numpy as np

def evaluate_recommender(recommender, score_diff=0.01, metric='accuracy'):
    """Evaluates a recommender on the PMLB dataset.

    Parameters
    ----------
    recommender: class that inherits BaseRecommender
        The recommender to evaluate
    score_diff: float, default 0.01
        The minimum allowable difference between the best score on a dataset and the score
        that a recommended algorithm + parameter setting achieves.

        If the recommended algorithm + parameter score is within score_diff of the best
        score, then the dataset is considered solved.
    metric: string, default 'accuracy'
        The scoring metric to be used: 'accuracy', 'macrof1', or 'bal_accuracy'

    Returns
    -------
    average_rank: float
        Returns the average number of recommendations it took for the recommender to recommend
        an algorithm + parameter that solved each dataset for each of the datasets in PMLB.
    """
    pmlb_data = pd.read_csv('metalearning/sklearn-benchmark5-data-short.tsv.gz',
                       compression='gzip', sep='\t',
                       names=['dataset',
                              'algorithm',
                              'parameters',
                              'accuracy',
                              'macrof1',
                              'bal_accuracy']).fillna('')

    # Filter results to PennAI classifiers
    pennai_classifiers = ['LogisticRegression', 'RandomForestClassifier', 'SVC',
                          'KNeighborsClassifier', 'DecisionTreeClassifier',
                          'GradientBoostingClassifier']
    mask = np.array([c in pennai_classifiers for c in pmlb_data['algorithm'].values])
    pmlb_data = pmlb_data.loc[mask, :]
    tries_count_list = []

    for dataset in pmlb_data['dataset'].unique():
        training_subset = pmlb_data.loc[pmlb_data['dataset'] != dataset]
        holdout_subset_lookup = pmlb_data.loc[pmlb_data['dataset'] == dataset].set_index(
            ['algorithm', 'parameters']).loc[:, metric].to_dict()
        maximum_dataset_score = max(holdout_subset_lookup.values())

        pennai = recommender(metric=metric)
        pennai.update(training_subset)
        not_solved = True
        tries_count = 0

        while not_solved:
            ml, p, scores = pennai.recommend(n_recs=1, dataset_id=dataset)
            ml = ml[0]
            p = p[0]
            tries_count += 1

            # Skip this recommendation if we don't have it in the PMLB dataset
            if (ml, p) not in holdout_subset_lookup:
                continue

            actual_score = holdout_subset_lookup[(ml, p)]

            # Update the recommender with the score from its latest guess
            update_record = pd.DataFrame(data={'dataset': [dataset],
                                               'algorithm': [ml],
                                               'parameters': [p],
                                               metric: [actual_score]})
            pennai.update(update_record)

            if abs(actual_score - maximum_dataset_score) <= score_diff:
                not_solved = False
                tries_count_list.append(tries_count)
        
    return np.mean(tries_count_list)
