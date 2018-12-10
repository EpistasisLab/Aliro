# William La Cava
# mock experiment for comparing recommenders.
import pdb
import pandas as pd
import numpy as np
import argparse
from ai.recommender.average_recommender import AverageRecommender
from ai.recommender.random_recommender import RandomRecommender
from ai.recommender.meta_recommender import MetaRecommender
from ai.recommender.knn_meta_recommender import KNNMetaRecommender
from ai.recommender.mlp_meta_recommender import MLPMetaRecommender
from ai.recommender.svd_recommender import SVDRecommender

from collections import OrderedDict
from mock_experiment.mf_utils import local_get_metafeatures, update_dataset_mf
import warnings 
warnings.simplefilter("ignore")
# define a comparison function that tests a recommender on the datasets, 
#using an intial knowledge base.
def run_experiment(rec,data_idx,n_recs,trial,knowledge_base,ml_p,n_init):
    """generates recommendations for datasets, using the first n_init as knowledge base."""
    results = []
    kwargs = {'metric':'bal_accuracy'}
    if rec in ['random','meta','mlp']:
            kwargs.update({'ml_p':ml_p})

    rec_choice = {'random': RandomRecommender,
            'average': AverageRecommender,
            'meta': MetaRecommender,
            'mlp': MLPMetaRecommender,
            'knn': KNNMetaRecommender
            }

    recommender = rec_choice[rec](**kwargs)
    #pdb.set_trace()
    # load first ten results into recommender
    train_subset = [d for i,d in enumerate(data_idx) if i < n_init]
    # print('setting training data for recommender:',train_subset)
    init_data = []
    init_data_mf = []
    for i in train_subset:
        init_data.append(knowledge_base.loc[knowledge_base['dataset']==i])
        init_data_mf.append(local_get_metafeatures(i))
    init_df = pd.concat(init_data)
    dataset_mf = pd.concat(init_data_mf).set_index('dataset')
    print('initial training on',len(init_df),'results')
    recommender.update(init_df, dataset_mf)
    
    rec_subset = [d for i,d in enumerate(data_idx) if i >= n_init]
    # loop thru rest of datasets
    for it,dataset in enumerate(rec_subset):

        holdout_accuracy_lookup = knowledge_base.loc[knowledge_base['dataset'] == dataset].set_index(
            ['algorithm', 'parameters']).loc[:, 'bal_accuracy'].to_dict()
        holdout_rank_lookup = knowledge_base.loc[knowledge_base['dataset'] == dataset].set_index(
            ['algorithm', 'parameters']).loc[:, 'ranking'].to_dict()
        # print('generating recommendation for',dataset)
        # for i in np.arange(n_recs):
            # ml ='adf'
            # p = 'pakd'
            # n = 0
            # while (ml,p) not in holdout_accuracy_lookup and n<1000:
            # if (ml,p) not in holdout_accuracy_lookup:
            #     pdb.set_trace()

        # for each dataset, generate a recommendation
        mls, ps, scores = recommender.recommend(dataset_id=dataset,
                                                n_recs=n_recs,
                                                dataset_mf=local_get_metafeatures(dataset)
                                                )
        updates = []
        for i in np.arange(len(mls)):
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
            if (ml,p) not in holdout_accuracy_lookup:
                raise ValueError((ml,p),'not found')
            
            # n = n+1
            # retreive the performance of the recommended learner
            actual_score = holdout_accuracy_lookup[(ml, p)]
            actual_ranking = holdout_rank_lookup[(ml,p)]
            best_score = knowledge_base.loc[knowledge_base['dataset'] == dataset]['bal_accuracy'].max()
            best_idx = knowledge_base.loc[knowledge_base['dataset'] == dataset]['bal_accuracy'].idxmax()
            best_algorithm = knowledge_base.loc[best_idx,'algorithm']
            # Update the recommender with the score from its latest guess
            updates.append(pd.DataFrame(data={'dataset': [dataset],
                                               'algorithm': [ml],
                                               'parameters': [p],
                                               'bal_accuracy': [actual_score]})
                          )
            
            # store the trial, iteration, dataset, recommender, ml rec, param rec,bal_accuracy	
            results.append({'trial':trial,
                            'iteration':it,
                            'n_recs':n_recs,
                            'n_init':n_init,
                            'recommender':rec,
                            'dataset':dataset,
                            'ml-rec':ml,
                            'p-rec':p,
                            'score-rec':scores[0],
                            'bal_accuracy':actual_score,
                            'max_bal_accuracy':best_score,
                            'best_algorithm':best_algorithm,
                            'ranking':actual_ranking,
                            'delta_bal_accuracy':(best_score-actual_score)/best_score})

        # print('updating recommender...')
        update_record = pd.concat(updates)
        dataset_mf = update_dataset_mf(dataset_mf, update_record)
        
        recommender.update(update_record,dataset_mf)

    # if rec == 'meta':   # store feature importance scores
    #     fi = recommender.ml.feature_importances_
    #     with open('feature_importances_'+str(trial) + '.txt','w') as out:
    #         out.write(','.join([str(fi) for fi in recommender.ml.feature_importances_])+'\n')
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
    parser.add_argument('-n_init_range',action='store',dest='n_init_range',type=str,
                        default='',
                        help='Number of initial datasets to seed knowledge database')
    parser.add_argument('-n_recs_range',action='store',dest='n_recs_range',type=str,default='',
                        help='Number of initial datasets to seed knowledge database')
    parser.add_argument('-data',action='store',dest='KNOWL',type=str,
                        default='mock_experiment/sklearn-benchmark5-data-mock_experiment.tsv.gz',
                        help='Number of initial datasets to seed knowledge database')

    args = parser.parse_args()
    
    # load knowledge base(s)
    if ',' in args.KNOWL:
        data_files = args.KNOWL.split(',')
    else:
        data_files = [args.KNOWL]

    for data_file in data_files:
        print(70*'=','\n','loading',data_file,'\n'+70*'=','\n')
        knowledge_base = pd.read_csv(data_file,
                                compression='gzip', sep='\t').fillna('')#,
        ml_p = knowledge_base.loc[:,['algorithm','parameters']]                      
        
        data_idx = np.unique(knowledge_base['dataset'])  # datasets 
        
        if args.n_recs_range != '':
            n_recs_range = [int(r) for r in args.n_recs_range.split(',')]
        else:
            n_recs_range = [args.n_recs]
        if args.n_init_range != '':
            n_init_range = [int(r) for r in args.n_init_range.split(',')]
        else:
            n_init_range = [args.n_init]

        # output file
        out_file = ('mock_experiment/results/experiment_' 
                    + data_file.split('/')[-1].split('.')[0]
                    + '_recs-'+'-'.join(args.rec.split(',')) 
                    + '_ninit-'+'-'.join([str(n) for n in n_init_range])
                    + '_nrecs-'+'-'.join([str(n) for n in n_recs_range]) 
                    + '_ntrials-{}'.format(args.n_trials) 
                    + '.csv')    

        first = True
        for t in np.arange(args.n_trials):   # for each trial (parallelize this)
            print('trial=',t)
            for n_init in n_init_range:
                print('n_init=',n_init)
                for n_recs in n_recs_range:
                    print('n_recs=',n_recs)
                    np.random.shuffle(data_idx) # shuffle datasets
                    for rec in args.rec.split(','):        # for each recommender
                        print('rec=',rec)
                        # run experiment
                        results = run_experiment(rec,data_idx,n_recs,t,knowledge_base,
                                                 ml_p,n_init)
                        df_results = pd.DataFrame.from_records(results,columns=results[0].keys()) 
                        # write results
                        if first:
                            df_results.to_csv(out_file,index=False)
                            first=False
                        else:
                            with open(out_file,'a') as out:     # printout results
                                df_results.to_csv(out, header=False, index=False)

        print('done. results written to ', out_file)
