# generate and store metafeatures in directories. 

import sys
sys.path.insert(0, '../../..')

import pandas as pd
import numpy as np
import os
import simplejson
from glob import glob
from ai.knowledgebase_utils import generate_metafeatures_file
import argparse

if __name__ == '__main__':
    parser = argparse.ArgumentParser(
            description='Generate metafeatures for datasets in a directory.', 
            add_help=False)
    parser.add_argument('-h','--help',action='help',
            help="Show this help message and exit.")
    parser.add_argument('-data_dir',action='store',dest='data_dir',type=str,
            default='../../datasets/pmlb_small/',
            help='Path to datasets')
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
    parser.add_argument('-data_extension','--e', action='store', 
            dest="file_extensions",
            help='allowed data file extensions', required=False, 
            default=','.join(['.csv', '.tsv', '.gz']))
    parser.add_argument('--flat','-verbose',action='store_true',dest='flat',
            default=False,
            help='Whether datasets are in nested folders or in one folder.')
    args = parser.parse_args()

    file_extensions = args.file_extensions.split(',')

    print("Generating metafeatures:")
    print(f"\tdata directory: '{args.data_dir}'")
    print(f"\tcheck subdirectories: {not(args.flat)}")
    print(f"\tdata file extensions: {file_extensions}")
    print(f"\tdata target field: '{args.label}'")

    print(f"\toutput path: '{args.savedir}'")
    print(f"\toutput filename: '{args.savename}'")
    mfGen = generate_metafeatures_file(
                datasetDirectory = args.data_dir, 
                outputPath = args.savedir, 
                outputFilename = args.savename, 
                predictionType = args.pred_type,
                targetField = args.label, 
                checkSubdirectories = not(args.flat),
                fileExtensions = file_extensions
                )

    print(f"Generated metafeatures for {len(mfGen)} datasets")
    assert len(mfGen) > 1
