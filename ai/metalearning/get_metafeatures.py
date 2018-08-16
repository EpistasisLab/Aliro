"""
Script to get metafeatures for all datasets stored in the ../data folder.
Dumps all the results in a csv called data_metafeatures.csv
"""

import pandas as pd
from .dataset_describe import Dataset
from collections import OrderedDict
import argparse
import json
import sys

def get_metafeatures(input_file, target_field):
    """Calls metafeature generating methods from dataset_describe"""
    # Read the data set into memory
    df = pd.read_csv(input_file, sep=None, engine='python')
   
    dataset = Dataset(df, dependent_col = target_field, prediction_type='classification')
   
    meta_features = OrderedDict() 
    for i in dir(dataset):
        result = getattr(dataset, i)
        if not i.startswith('__') and not i.startswith('_') and hasattr(result, '__call__'):
            meta_features[i] = result()
    return meta_features


def main():
    meta_features_all = []
    parser = argparse.ArgumentParser(description="Generates metadata.json file given a dataseet", add_help=False)
    parser.add_argument('INPUT_FILE', type=str, help='Data file to analyze.')    
    parser.add_argument('-target', action='store', dest='TARGET', type=str, default='class',
                        help='Name of target column')
    args = parser.parse_args()

    meta_features = get_metafeatures(args.INPUT_FILE, args.TARGET)
    meta_json = json.dumps(meta_features) #, ensure_ascii=False)    

    print(meta_json)
    sys.stdout.flush()

if __name__ == '__main__':
    main()
