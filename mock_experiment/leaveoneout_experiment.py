# William La Cava
# mock experiment for comparing recommenders.
import pdb
import os
import pandas as pd
import numpy as np
import argparse
from ai.recommender.average_recommender import AverageRecommender
from ai.recommender.random_recommender import RandomRecommender
# from ai.recommender.meta_recommender import MetaRecommender
from ai.recommender.knn_meta_recommender import KNNMetaRecommender
# from ai.recommender.mlp_meta_recommender import MLPMetaRecommender
from ai.recommender.svd_recommender import SVDRecommender
from ai.recommender.surprise_recommenders import *

from joblib import Parallel, delayed
from collections import OrderedDict
from mock_experiment.mf_utils import local_get_metafeatures, update_dataset_mf
import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
ch = logging.StreamHandler()
formatter = logging.Formatter('%(module)s: %(levelname)s: %(message)s')
ch.setFormatter(formatter)
logger.addHandler(ch)
# define a comparison function that tests a recommender on the datasets, 
#using an intial knowledge base.
def run_experiment(rec,dataset,n_recs,trial,knowledge_base,ml_p, iters):
    """generates recommendations for datasets, using all other dataset results."""
    # set seed
    np.random.seed(trial)
    results = []
    kwargs = {'metric':'bal_accuracy','ml_p':ml_p}
    # if rec == 'svd': 
    #     kwargs.update({'datasets':knowledge_base.dataset.unique()})
    rec_choice = {'random': RandomRecommender,
            'average': AverageRecommender,
            'knnmeta': KNNMetaRecommender,
            'svd': SVDRecommender,
            'cocluster': CoClusteringRecommender,
            'knnmeans': KNNWithMeansRecommender,
            'knnml': KNNMLRecommender,
            'knndata': KNNDatasetRecommender,
            'slopeone': SlopeOneRecommender
            }

    #pdb.set_trace()
    dataset_successes = 0

    ####################################################### main experiment loop
    # for di,dataset in enumerate(data_idx):
    recommender = rec_choice[rec](**kwargs)
    ############################ load all other dataset results into recommender
    init_df = knowledge_base.loc[knowledge_base['dataset']!=dataset]
    init_data_mf = []
    # get the metafeatures for the initial datasets
    for i,_ in init_df.groupby('dataset'):
        init_data_mf.append(local_get_metafeatures(i))

    dataset_mf = pd.concat(init_data_mf).set_index('dataset')
    print('initial training on',len(init_df),'results')
    recommender.update(init_df, dataset_mf)


    ####################################################### recs loop
    for it in np.arange(iters):
        holdout_accuracy_lookup = knowledge_base.loc[
                knowledge_base['dataset'] == dataset].set_index(
            ['algorithm', 'parameter_hash']).loc[:, 'bal_accuracy'].to_dict()
        holdout_rank_lookup = knowledge_base.loc[
                knowledge_base['dataset'] == dataset].set_index(
            ['algorithm', 'parameter_hash']).loc[:, 'ranking'].to_dict()

        print('generating ',n_recs,'recommendations for',dataset)

        try:
            # for each dataset, generate a recommendation
            mls, ps, scores = recommender.recommend(dataset_id=dataset,
                                        n_recs=n_recs,
                                        dataset_mf=local_get_metafeatures(dataset)
                                        )
            print('got',len(mls),'recs')
        except Exception as e:
            print('Caught exception in recommend():',e)
            mls, ps, scores = [],[],[]

        updates = []
        for i in np.arange(len(mls)):
            ml = mls[i]
            p = ps[i]
            phash = hash(frozenset(p.items()))

            print('recommending',ml,'with',p,'for',dataset)
            if (ml,phash) not in holdout_accuracy_lookup:
                raise ValueError((ml,phash),'not found')
            
            # n = n+1
            # retreive the performance of the recommended learner
            actual_score = holdout_accuracy_lookup[(ml, phash)]
            actual_ranking = holdout_rank_lookup[(ml,phash)]
            # find all top ranking algorithms
            dataset_results = knowledge_base.loc[
                    knowledge_base['dataset'] == dataset]
            best_score = dataset_results['bal_accuracy'].max()
            best_algs = dataset_results.loc[
                    dataset_results['ranking']==1]['algorithm'].unique()
            best_algorithm = '|'.join(list(best_algs)) 
            # Update the recommender with the score from its latest guess
            updates.append(pd.DataFrame(data={'dataset': [dataset],
                                               'algorithm': [ml],
                                               'parameters': [p],
                                               'bal_accuracy': [actual_score]})
                          )
            
            score_delta = (best_score-actual_score)/best_score
            print('score_delta: ', score_delta)
            success_01 = score_delta <= 0.01
            success_02 = score_delta <= 0.02
            success_03 = score_delta <= 0.03
            success_04 = score_delta <= 0.04
            success_05 = score_delta <= 0.05
            if success_01:
                print(20*':) ','optimal',20*':) ')

            # store the trial, iteration, dataset, recommender, ml rec, param rec,
            # bal_accuracy	
            results.append({'iteration':it,
                            'n_recs':n_recs,
                            'iters':iters,
                            'recommender':rec,
                            'dataset':dataset,
                            'ml-rec':ml,
                            'p-rec':p,
                            'score-rec':scores[0],
                            'bal_accuracy':actual_score,
                            'max_bal_accuracy':best_score,
                            'best_algorithm':best_algorithm,
                            'ranking':actual_ranking,
                            'delta_bal_accuracy':(best_score-
                                actual_score)/best_score,
                            'success_01':success_01,
                            'success_02':success_02,
                            'success_03':success_03,
                            'success_04':success_04,
                            'success_05':success_05,
                            })
            if success_01:
                print("we're done here, everyone can go home now ")
                for final_its in np.arange(it+1,iters):
                    print('appending it',final_its)
                    results.append({'iteration':final_its,
                                'n_recs':n_recs,
                                'iters':iters,
                                'recommender':rec,
                                'dataset':dataset,
                                'ml-rec':ml,
                                'p-rec':p,
                                'score-rec':scores[0],
                                'bal_accuracy':actual_score,
                                'max_bal_accuracy':best_score,
                                'best_algorithm':best_algorithm,
                                'ranking':actual_ranking,
                                'delta_bal_accuracy':(best_score-
                                    actual_score)/best_score,
                                'success_01':success_01,
                                'success_02':success_02,
                                'success_03':success_03,
                                'success_04':success_04,
                                'success_05':success_05,
                                })
                break
        if success_01:
            break
        print('updating recommender...')
        if len(updates)>0:
            update_record = pd.concat(updates)
            dataset_mf = update_dataset_mf(dataset_mf, update_record)
            recommender.update(update_record,dataset_mf)
        else:
            print('WARNING: got no updates for',dataset)

    return results

if __name__ == '__main__':
    """run experiment"""

    parser = argparse.ArgumentParser(description='Run a PennAI a '
            'recommender experiment.', add_help=False)
    parser.add_argument('-h','--help',action='help',
                        help="Show this help message and exit.")
    # parser.add_argument('-rec',action='store',dest='rec',default='random', 
    #                     help='Recommender to run.') 
    parser.add_argument('-rec',action='store',dest='rec',default='random',
            choices = ['random','average','knnmeta','svd','cocluster','knnmeans',
                       'knnml','knndata','slopeone'],
            help='Recommender algorithm options.')
    parser.add_argument('-n_recs',action='store',dest='n_recs',type=int,default=1,
            help='Number of '
            ' recommendations to make at a time. If zero, will send continous '
            'recommendations until AI is turned off.')
    parser.add_argument('-v','-verbose',action='store_true',dest='verbose',default=False,
                        help='Print out more messages.')
    parser.add_argument('-n_init',action='store',dest='n_init',type=int,default=10,
                        help='Number of initial datasets to seed knowledge database')
    parser.add_argument('-iters',action='store',dest='iters',type=int,default=10,
                        help='Number of initial datasets to seed knowledge database')
    parser.add_argument('-t',action='store',dest='trial',type=int,default=0,
                        help='Trial number')
    parser.add_argument('-data',action='store',dest='KNOWL',type=str,
                        default='mock_experiment/sklearn-benchmark5-data-mock_experiment.tsv.gz',
                        help='Number of initial datasets to seed knowledge database')
    parser.add_argument('-dataset',action='store',dest='DATASET',type=str,
                        default='appendicitis',
                        help='name of dataset to run leave-one-out analysis on')
    parser.add_argument('-resdir',action='store',dest='RESDIR',type=str,
                        default='results',
                        help='results directory')

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
        ml_p = knowledge_base.loc[:,['algorithm','parameters']].drop_duplicates()
        ml_p['parameters'] = ml_p['parameters'].apply(
                lambda x: eval(x))
        knowledge_base['parameters'] = knowledge_base['parameters'].apply(
                lambda x: eval(x))
        knowledge_base['parameter_hash'] = knowledge_base['parameters'].apply(
                lambda x: hash(frozenset(x.items())))

        print('len ml_p:',len(ml_p)) 
        data_idx = np.unique(knowledge_base['dataset'])  # datasets 
        

        # output file
        out_file = ('mock_experiment/' + args.RESDIR + '/leaveoneout_' 
                    + data_file.split('/')[-1].split('.')[0]
                    + '_rec-{}'.format(args.rec) 
                    + '_nrecs-{}'.format(args.n_recs)
                    + '_iters-{}'.format(args.iters) 
                    + '_{}'.format(args.DATASET) 
                    + '.csv')    

        # run experiment
        # np.random.shuffle(data_idx) # shuffle datasets
        print('rec:',args.rec,'n_recs:',args.n_recs,'n_init:',args.n_init,
              'iters:',args.iters)
        results = run_experiment(args.rec,
                                 args.DATASET,
                                 args.n_recs,
                                 args.trial,
                                 knowledge_base,
                                 ml_p,
                                 args.iters)

        df_results = pd.DataFrame.from_records(results,columns=results[0].keys()) 
        # write results
        if os.path.exists(out_file):
            with open(out_file, 'a') as out:
                df_results.to_csv(out,index=False,header=False)
        else:
            df_results.to_csv(out_file,index=False)

        print('results written to ', out_file)
