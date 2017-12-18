# William La Cava
# mock experiment for comparing recommenders.
import pandas as pd
import numpy as np
import argparse
from ai.recommender.average_recommender import AverageRecommender
from ai.recommender.random_recommender import RandomRecommender
# define a comparison function that tests a recommender on the pmlb datasets, 
#using an intial knowledge base.
def run_experiment(recommender,data_idx,n_recs,t,pmlb_data):
    """generates recommendations for datasets, using the first 10 as knowledge base."""
    results = []
    # load first ten results into recommender
    train_subset = [d for i,d in enumerate(data_idx) if i <10]
    for i in train_subset:
        recommender.update(pmlb_data.loc[pmlb_data['dataset']==t])
    rec_subset = [d for i,d in enumerate(data_idx) if i >=10]
    # loop thru rest of datasets
    for dataset in rec_subset:
        holdout_subset_lookup = pmlb_data.loc[pmlb_data['dataset'] == dataset].set_index(
            ['algorithm', 'parameters']).loc[:, metric].to_dict()
        for i in np.arange(n_recs):
            # for each dataset, generate a recommendation
            ml, p, scores = recommender.recommend(n_recs=1, dataset_id=dataset)
            ml = ml[0]
            p = p[0]
            # retreive the performance of the recommended learner
            actual_score = holdout_subset_lookup[(ml, p)]

            # Update the recommender with the score from its latest guess
            update_record = pd.DataFrame(data={'dataset': [dataset],
                                               'algorithm': [ml],
                                               'parameters': [p],
                                               'accuracy': [actual_score]})
            recommender.update(update_record)
            # store the trial, iteration, dataset, ml rec, param rec, and its performance in results	
            results.append([trial,i,dataset,ml,p,actual_score])

    return results

# make a figure comparing several runs of the test over different orderings of datasets

if __name__ == '__main__':
    """run experiment"""

    parser = argparse.ArgumentParser(description='Run a PennAI a recommender experiment.', 
                                     add_help=False)
    parser.add_argument('-h','--help',action='help',
                        help="Show this help message and exit.")
    parser.add_argument('-recs',action='store',dest='rec',default='random,average', 
                        help='Comma-separated list of recommenders to run.') 
    parser.add_argument('-n_recs',action='store',dest='n_recs',type=int,default=1,help='Number of '
                        ' recommendations to make at a time. If zero, will send continous '
                        'recommendations until AI is turned off.')
    parser.add_argument('-v','-verbose',action='store_true',dest='verbose',default=False,
                        help='Print out more messages.')
    parser.add_argument('-n_trials',action='store',dest='n_trials',default=20,
                        help='Number of repeat experiments to run.')  
    args = parser.parse_args()
    
    # dictionary of default recommenders to choose from at the command line. 
    name_to_rec = {'random': RandomRecommender(db_path=args.DB_PATH,
                                                api_key=os.environ['APIKEY']),
            'average': AverageRecommender(),
            'exhaustive': ExhaustiveRecommender(db_path=args.DB_PATH,api_key=os.environ['APIKEY'])
            }
    # load pmlb data
    print('load pmlb data')
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
    # Filter results to parameters of PennAI classifiers
    
    data_idx = np.unique(pmlb_data['dataset'])  # datasets 
    out_file = 'experiment_' + str(rec) + '.csv'    # output file
    with open(out_file) as out: # write header
        out.write('trial,iteration,dataset,recommender,ml-rec,p-rec,accuracy\n')

    for t in np.arange(n_trials):   # for each trial (parallelize this)
        print('trial',t)
        np.random.shuffle(data_idx) # shuffle datasets
        for rec in ','.split(args.rec):        # for each recommender
            print('rec',rec)
            # run experiment
            results = run_experiment(name_to_rec[rec],data_idx,args.n_recs,t,pmlb_data)
            with open(out_file,'a') as out:     # printout results
                for res in results:
                    out.write(','.join([str(r) for r in res])+'\n')


