# William La Cava
# mock experiment for comparing recommenders.
import pdb
import pandas as pd
import numpy as np
import argparse
from ai.recommender.average_recommender import AverageRecommender
from ai.recommender.random_recommender import RandomRecommender
from mock_experiment.mock_meta_recommender import (MockMetaRecommender, MockMLPMetaRecommender,
                                                  MockKNNMetaRecommender)
from collections import OrderedDict
import warnings 
warnings.simplefilter("ignore")
# define a comparison function that tests a recommender on the pmlb datasets, 
#using an intial knowledge base.
def run_experiment(rec,data_idx,n_recs,trial,pmlb_data,ml_p,n_init):
    """generates recommendations for datasets, using the first n_init as knowledge base."""
    results = []
    kwargs = {'metric':'bal_accuracy'}
    if rec in ['random','meta','mlp','knn']:
        kwargs.update({'db_path':'mock_experiment/metafeatures/'})
        if rec != 'knn':
            kwargs.update({'ml_p':ml_p})

    rec_choice = {'random': RandomRecommender,
            'average': AverageRecommender,
            'meta': MockMetaRecommender,
            'mlp': MockMLPMetaRecommender,
            'knn': MockKNNMetaRecommender
            }

    recommender = rec_choice[rec](**kwargs)
    #pdb.set_trace()
    # load first ten results into recommender
    train_subset = [d for i,d in enumerate(data_idx) if i < n_init]
    # print('setting training data for recommender:',train_subset)
    init_data = []
    for i in train_subset:
        init_data.append(pmlb_data.loc[pmlb_data['dataset']==i])
    init_df = pd.concat(init_data)
    print('initial training on',len(init_df),'results')
    for i in train_subset:
        recommender.update(init_df)
    rec_subset = [d for i,d in enumerate(data_idx) if i >= n_init]
    # loop thru rest of datasets
    for it,dataset in enumerate(rec_subset):

        holdout_subset_lookup = pmlb_data.loc[pmlb_data['dataset'] == dataset].set_index(
            ['algorithm', 'parameters']).loc[:, 'bal_accuracy'].to_dict()
        # print('generating recommendation for',dataset)
        # for i in np.arange(n_recs):
            # ml ='adf'
            # p = 'pakd'
            # n = 0
            # while (ml,p) not in holdout_subset_lookup and n<1000:
            # if (ml,p) not in holdout_subset_lookup:
            #     pdb.set_trace()

        # for each dataset, generate a recommendation
        mls, ps, scores = recommender.recommend(n_recs=n_recs, dataset_id=dataset)
        updates = []
        for i in np.arange(n_recs):
            ml = mls[i]
            if 'Meta' in type(recommender).__name__:
                tmp = eval(ps[i])
                for mfs in ['C','gamma','coef0','learning_rate','min_weight_fraction_leaf',
                            'min_impurity_decrease']:
                    if mfs in tmp.keys():
                        tmp[mfs] = float(tmp[mfs])
                    p = str(OrderedDict(sorted(tmp.items())))
            else:
                p = ps[i]

            print('recommending',ml,'with',p,'for',dataset)
            if (ml,p) not in holdout_subset_lookup:
                raise ValueError((ml,p),'not found')
            
            # n = n+1
            # retreive the performance of the recommended learner
            actual_score = holdout_subset_lookup[(ml, p)]
            best_score = pmlb_data.loc[pmlb_data['dataset'] == dataset]['bal_accuracy'].max()
            # Update the recommender with the score from its latest guess
            updates.append(pd.DataFrame(data={'dataset': [dataset],
                                               'algorithm': [ml],
                                               'parameters': [p],
                                               'bal_accuracy': [actual_score]})
                          )
            
            # store the trial, iteration, dataset, recommender, ml rec, param rec, bal_accuracy	
            results.append([trial,it,rec,dataset,ml,p,scores[0],actual_score,best_score,
                            (best_score-actual_score)/best_score])

        # print('updating recommender...')
        update_record = pd.concat(updates)
        recommender.update(update_record)

    if rec == 'meta':   # store feature importance scores
        fi = recommender.ml.feature_importances_
        with open('feature_importances_'+str(trial) + '.txt','w') as out:
            out.write(','.join([str(fi) for fi in recommender.ml.feature_importances_])+'\n')
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
    parser.add_argument('-n_trials',action='store',dest='n_trials',type=int,default=10,
                        help='Number of repeat experiments to run.')  
    parser.add_argument('-n_init',action='store',dest='n_init',type=int,default=10,
                        help='Number of initial datasets to seed knowledge database')
    parser.add_argument('-knowledge',action='store',dest='KNOWL',type=str,
                        default='mock_experiment/sklearn-benchmark5-data-mock_experiment.tsv.gz',
                        help='Number of initial datasets to seed knowledge database')

    args = parser.parse_args()
    
    pmlb_file = args.KNOWL    # load knowledge base
    print('loading knowledge base')
    pmlb_data = pd.read_csv(pmlb_file,
                            compression='gzip', sep='\t').fillna('')#,
    ml_p = pmlb_data.loc[:,['algorithm','parameters']]                      
    
    # dictionary of default recommenders to choose from at the command line. 
    # name_to_rec = {'random': RandomRecommender(pmlb_file=pmlb_file,metric='bal_accuracy'),
    #         'average': AverageRecommender(metric='bal_accuracy'),
    #         'meta': MetaRecommender(metric='bal_accuracy')
    #         }
    data_idx = np.unique(pmlb_data['dataset'])  # datasets 
    # output file
    out_file = ('experiment_' 
                + pmlb_file.split('/')[-1].split('.')[0]
                + '-'.join(args.rec.split(',')) 
                + '_' + str(args.n_recs) 
                + 'recs_' + str(args.n_trials) 
                + 'trials_' + str(args.n_init) + 'init.csv')    
    with open(out_file,'w') as out: # write header
        out.write('trial\titeration\trecommender\tdataset\tml-rec\tp-rec\tscore-rec\tbal_accuracy'
                  '\tmax_bal_accuracy\tdelta_bal_accuracy\n')

    for t in np.arange(args.n_trials):   # for each trial (parallelize this)
        print('trial',t)
        np.random.shuffle(data_idx) # shuffle datasets
        for rec in args.rec.split(','):        # for each recommender
            print('rec',rec)
            # run experiment
            results = run_experiment(rec,data_idx,args.n_recs,t,pmlb_data,ml_p,args.n_init)
    
            with open(out_file,'a') as out:     # printout results
                for res in results:
                    out.write('\t'.join([str(r) for r in res])+'\n')

    print('done. results written to ', out_file)
