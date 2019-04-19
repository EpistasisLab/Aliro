# generate and store metafeatures in directories. 

import pandas as pd
import numpy as np
from pmlb import dataset_names, fetch_data
import os
from ai.metalearning.get_metafeatures import generate_metafeatures_from_filepath
import simplejson
import sys
from glob import glob
import argparse

if __name__ == '__main__':
    """run experiment"""

    parser = argparse.ArgumentParser(description='Generate metafeatures for datasets in file.', 
                                     add_help=False)
    parser.add_argument('-h','--help',action='help',
                        help="Show this help message and exit.")
    parser.add_argument('-file',action='store',dest='pmlb_file',
                        default='mock_experiment/sklearn-benchmark5-data-mock_experiment.tsv.gz', 
                        help='Results file with names of datasets') 
    parser.add_argument('-data_dir',action='store',dest='data_dir',type=str,
                        default='../penn-ml-benchmarks/datasets/classification/',
                        help='Path to datasets')
    parser.add_argument('--flat','-verbose',action='store_true',dest='flat',default=False,
                        help='Whether datasets are in nested folders or in one folder.')
    parser.add_argument('-tail',action='store',dest='tail',type=str,default='.tsv.gz',
                        help='File type for datasets')
    parser.add_argument('-label',action='store',dest='label',type=str,default='target',
                        help='Label name for datasets')

    args = parser.parse_args()
    print(args.pmlb_file)
    print(args.data_dir)
    print(args.tail)
    compression = 'gzip' if 'gz' in args.tail else None
# load pmlb data
    pmlb_data = pd.read_csv(args.pmlb_file,
                            compression='gzip', sep='\t').fillna('')
    print('datset cols:',pmlb_data.columns)
    for dataset, dfg in pmlb_data.groupby('dataset'):
        # print(args.data_dir+'/'+dataset+'/*'+args.tail)
        # dataset_path = args.data_dir+dataset+'/'+dataset+args.tail
        # dataset_path = args.data_dir+'/'+dataset+args.tail
        # dataset_path = glob(args.data_dir+'/'+dataset+'/*'+args.tail)
        if args.flat:
            dataset_path = glob(args.data_dir+'/*'+dataset +'*'+ args.tail)
        else:
            dataset_path = glob(args.data_dir+'/'+dataset +'/*'+ args.tail)
        print('dataset_path:',dataset_path)
        assert(len(dataset_path)==1)
        dataset_path = dataset_path[0]
        print(dataset_path)
        mf = generate_metafeatures_from_filepath(dataset_path,
                args.label,compression = compression)
        meta_json = simplejson.dumps(mf, ignore_nan=True) #, ensure_ascii=False)    
        if not os.path.exists('mock_experiment/metafeatures/api/datasets/'+dataset):
                os.makedirs('mock_experiment/metafeatures/api/datasets/'+dataset)
        out_file = 'mock_experiment/metafeatures/api/datasets/'+dataset+'/metafeatures.json'
        with open(out_file,'w') as out:
            out.write(meta_json)


