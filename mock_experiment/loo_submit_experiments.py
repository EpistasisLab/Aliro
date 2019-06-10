# William La Cava
# submit mock experiment for comparing recommenders.

import pandas as pd
import numpy as np
import argparse
import os
from sklearn.externals.joblib import Parallel, delayed

if __name__ == '__main__':
    """run experiment"""

    parser = argparse.ArgumentParser(description='Submit a set of PennAI '
                                    'experiments.', add_help=False)
    parser.add_argument('-h','--help',action='help',
                        help="Show this help message and exit.")
    parser.add_argument('-recs',action='store',dest='rec',
                        default='random,average,knn,svd', 
                        help='Comma-separated list of recommenders to run.') 
    parser.add_argument('-n_recs_range',action='store',dest='n_recs_range',type=str,
                        default='',
                        help='Comma-separated list of Number of initial datasets to seed knowledge database')
    parser.add_argument('-v','-verbose',action='store_true',dest='verbose',
                        default=False,
                        help='Print out more messages.')
    parser.add_argument('-iters_range',action='store',dest='iters_range',type=str,
                        default='',
                        help='Comma-separated list of A range of number of total iterations')
    parser.add_argument('-data',action='store',dest='KNOWL',type=str,
            default='mock_experiment/sklearn-benchmark5-data-mock_experiment.tsv.gz',
                        help='Data to use as knowledge database')
    parser.add_argument('-resdir',action='store',dest='RESDIR',type=str,
                        default='results',
                help='Comma-separated list of datasets to use as knowledge database')
    parser.add_argument('-m',action='store',dest='M',default=4096,type=int,
                        help='LSF memory request and limit (MB)')
    parser.add_argument('-q',action='store',dest='QUEUE',default='mooreai_normal',
            type=str, help='LSF queue')
    parser.add_argument('--local',action='store_true',dest='local',default=False,
                        help='Run locally instead of on LPC')
    args = parser.parse_args()


    if args.n_recs_range != '':
        n_recs_range = [int(r) for r in args.n_recs_range.split(',')]
    else:
        n_recs_range = [1]


    if args.iters_range != '':
        iters_range = [int(r) for r in args.iters_range.split(',')]
    else:
        iters_range = [100]
   
    # get datasets
    data_df = pd.read_csv(args.KNOWL, compression='gzip', sep='\t')
    datasets = data_df.dataset.unique()

    # write batch commands
    batch_cmds = []
    job_info = []
    for d in datasets:
        for n_recs in n_recs_range:
            for iters in iters_range:
                for rec in args.rec.split(','):        # for each recommender
                    # write experiment command 
                    batch_cmds.append(
                            'python mock_experiment/leaveoneout_experiment.py '
                            '-rec {REC} -n_recs {NREC} '
                            '-iters {ITERS} -data {DATA} -dataset {DATASET} '
                            '-resdir {RESDIR}'.format(
                                REC = rec,
                                NREC = n_recs,
                                ITERS = iters,
                                DATA = args.KNOWL,
                                DATASET = d,
                                RESDIR = args.RESDIR)
                            )
                    job_info.append({'rec':rec,
                                     'nrec':n_recs,
                                     'iters':iters,
                                     'data':args.KNOWL.split('/')[-1].split('.')[0],
                                     'dataset':d
                                     })
    # write bsub commands
    if args.local:
        Parallel(n_jobs=5)(delayed(os.system)(run_cmd) for run_cmd in batch_cmds)
    else:
        for i,run_cmd in enumerate(batch_cmds):
            job_name = '_'.join([k + '-' + str(v) for k,v in job_info[i].items()]) 
            out_file = 'mock_experiment/' + args.RESDIR + '/' + job_name + '_%J.out'
            
            bsub_cmd = ('bsub -o {OUT_FILE} -n {N_CORES} -J {JOB_NAME} -q {QUEUE} '
                       '-R "span[hosts=1] rusage[mem={M}]" -M {M} ').format(
                           OUT_FILE=out_file,
                           JOB_NAME=job_name,
                           QUEUE=args.QUEUE,
                           N_CORES=1,
                           M=args.M)
            
            bsub_cmd +=  '"' + run_cmd + '"'
            print(bsub_cmd)
            os.system(bsub_cmd)     # submit jobs 
