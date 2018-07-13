"""
Script to get metafeatures for all datasets stored in the ../data folder.
Dumps all the results in a csv called data_metafeatures.csv
"""

from glob import glob
import pandas as pd

from dataset_describe import Dataset
from collections import OrderedDict


def get_metafeatures(df):
    dataset = Dataset(df, dependent_col = 'class', prediction_type='classification')
   
    meta_features = OrderedDict()
    for i in dir(dataset):
        result = getattr(dataset, i)
        if not i.startswith('__') and not i.startswith('_') and hasattr(result, '__call__'):
            meta_features[i] = result()
    return meta_features


def main():
    meta_features_all = []
    for i,dataset in enumerate(glob('../data/*')):
        # Read the data set into memory
        print('Processing {0}'.format(dataset))
        if "cifar" in dataset:
	    print("skipping:", dataset)
	    continue
	input_data = pd.read_csv(dataset, compression='gzip', sep='\t')
        meta_features = get_metafeatures(input_data)
        meta_features['dataset'] = dataset
        meta_features_all.append(meta_features)
        
        # For testing purposes.
        #if i == 15:
        #    pd.DataFrame(meta_features_all).to_csv('data_metafeatures.csv')
        #    break
    pd.DataFrame(meta_features_all).to_csv('data_metafeatures.csv')

if __name__ == '__main__':
    main()