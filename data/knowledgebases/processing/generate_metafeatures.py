# generate and store metafeatures in directories. 

import pandas as pd
import numpy as np
from pmlb import dataset_names, fetch_data
import os
from ai.knowledgebase_loader import generate_metafeatures_file
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
    # parser.add_argument('-file',action='store',dest='pmlb_file',
    #     default='data/knowledgebases/sklearn-benchmark5-data-knowledgebase.tsv.gz', 
    #     help='Results file with names of datasets') 
    parser.add_argument('-data_dir',action='store',dest='data_dir',type=str,
                        default='../penn-ml-benchmarks/datasets/classification/',
                        help='Path to datasets')
    # parser.add_argument('--flat','-verbose',action='store_true',dest='flat',default=False,
    #                     help='Whether datasets are in nested folders or in one folder.')
    # parser.add_argument('-tail',action='store',dest='tail',type=str,default='.tsv.gz',
    #                     help='File type for datasets')
    parser.add_argument('-label',action='store',dest='label',type=str,
            default='target', help='Label name for datasets')
    parser.add_argument('-pred_type',action='store',dest='pred_type',type=str,
            default='classification',help='classification or regression')

    parser.add_argument('-savedir',action='store',dest='savedir',type=str,
                        default='data/knowledgebases/metafeatures/',
                        help='Where to save metafeatures')
    parser.add_argument('-savename',action='store',dest='savename',type=str,
                        default='data/knowledgebases/metafeatures/',
                        help='Name of saved metafeatures file')
    args = parser.parse_args()
    # print(args.pmlb_file)
    print(args.data_dir)
    # print(args.tail)
    generate_metafeatures_file(args.data_dir, args.savedir, 
            outputFilename = args.savename, 
            predictionType = args.pred_type,
            targetField = args.label, 
            checkSubdirectories=True, 
            fileExtensions = ['.gz'],
            **{'compression':'gzip'})

    # compression = 'gzip' if 'gz' in args.tail else None
# # load pmlb data
    # pmlb_data = pd.read_csv(args.pmlb_file,
    #                         compression='gzip', sep='\t').fillna('')
    # print('datset cols:',pmlb_data.columns)
    # for dataset, dfg in pmlb_data.groupby('dataset'):
    #     # print(args.data_dir+'/'+dataset+'/*'+args.tail)
    #     # dataset_path = args.data_dir+dataset+'/'+dataset+args.tail
    #     # dataset_path = args.data_dir+'/'+dataset+args.tail
    #     # dataset_path = glob(args.data_dir+'/'+dataset+'/*'+args.tail)
    #     if args.flat:
    #         dataset_path = glob(args.data_dir+'/*'+dataset +'*'+ args.tail)
    #     else:
    #         dataset_path = glob(args.data_dir+'/'+dataset +'/*'+ args.tail)
    #     print('dataset_path:',dataset_path)
    #     assert(len(dataset_path)==1)
    #     dataset_path = dataset_path[0]
    #     print(dataset_path)
    #     mf = generate_metafeatures_from_filepath(dataset_path, args.pred_type,
    #             args.label,compression = compression)
    #     meta_json = simplejson.dumps(mf, ignore_nan=True) #, ensure_ascii=False)    
    #     savepath = args.savedir+dataset
    #     if not os.path.exists(savepath):
    #             os.makedirs(savepath)
    #     out_file = savepath+'/metafeatures.json'
    #     with open(out_file,'w') as out:
    #         out.write(meta_json)


