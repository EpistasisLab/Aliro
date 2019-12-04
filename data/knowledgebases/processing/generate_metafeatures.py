# generate and store metafeatures in directories. 

import sys
sys.path.insert(0, '../../..')

import pandas as pd
import numpy as np
import os
import simplejson
from glob import glob
from ai.knowledgebase_loader import generate_metafeatures_file
import argparse

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Generate metafeatures for datasets in a directory.', 
                        add_help=False)
    parser.add_argument('-h','--help',action='help',
                        help="Show this help message and exit.")
    parser.add_argument('-data_dir',action='store',dest='data_dir',type=str,
                        default='../../datasets/pmlb_small/',
                        help='Path to datasets')
    parser.add_argument('-data_extension','--e', action='append', dest="file_extensions",
                        help='allowed data file extensions', required=False, 
                        default=[])
    parser.add_argument('--flat','-verbose',action='store_true',dest='flat',default=False,
                        help='Whether datasets are in nested folders or in one folder.')
    parser.add_argument('-label',action='store',dest='label',type=str,default='target',
                        help='Label name for datasets')
    parser.add_argument('-outfilename',action='store',dest='outfilename',type=str,
                        default='metafeatures.csv.gz',
                        help='Output path')
    args = parser.parse_args()


    OUTPUT_PATH = "../"
    DEFAULT_FILE_EXTENSIONS = ['.csv', '.tsv', '.gz']

    file_extensions = args.file_extensions if len(args.file_extensions) > 0 else DEFAULT_FILE_EXTENSIONS

    print("Generating metafeatures:")
    print(f"\tdata directory: '{args.data_dir}'")
    print(f"\tcheck subdirectories: {not(args.flat)}")
    print(f"\tdata file extensions: {file_extensions}")
    print(f"\tdata target field: '{args.label}'")

    print(f"\toutput path: '{OUTPUT_PATH}'")
    print(f"\toutput filename: '{args.outfilename}'")


    mfGen = generate_metafeatures_file(
            outputFilename=args.outfilename,
            outputPath=OUTPUT_PATH, 
            datasetDirectory=args.data_dir,
            fileExtensions = file_extensions,
            targetField = args.label, 
            checkSubdirectories = not(args.flat))

    print(f"Generated metafeatures for {len(mfGen)} datasets")
    assert len(mfGen) > 1
