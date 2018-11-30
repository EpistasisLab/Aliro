"""
Script to get metafeatures for a dataset passed at the command line.
Dumps the results into json. 
"""
import warnings

with warnings.catch_warnings():
    warnings.filterwarnings("ignore",category=DeprecationWarning)
    import pandas as pd
    try:
        from dataset_describe import Dataset
    except:
        from ai.metalearning.dataset_describe import Dataset

    from collections import OrderedDict
    import argparse
    import sys
    import simplejson

def generate_metafeatures_from_datafile(input_file, target_field, **kwargs):
    """Calls metafeature generating methods from dataset_describe"""
    # Read the data set into memory
    df = pd.read_csv(input_file, sep=None, engine='python',**kwargs)
   
    dataset = Dataset(df, dependent_col = target_field, prediction_type='classification')
   
    meta_features = OrderedDict() 
    for i in dir(dataset):
        result = getattr(dataset, i)
        if not i.startswith('__') and not i.startswith('_') and hasattr(result, '__call__'):
            meta_features[i] = result()
    return meta_features


def main():
    meta_features_all = []
    parser = argparse.ArgumentParser(description="Reads or creates 'DATASET_metadata.json' file given a dataset", add_help=False)
    parser.add_argument('INPUT_FILE', type=str, help='Data file to analyze.')    
    parser.add_argument('-target', action='store', dest='TARGET', type=str, default='class',
                        help='Name of target column')
    args = parser.parse_args()

    meta_features = generate_metafeatures_from_datafile(args.INPUT_FILE, args.TARGET)
    meta_json = simplejson.dumps(meta_features, ignore_nan=True) #, ensure_ascii=False)    

    print(meta_json)
    sys.stdout.flush()

if __name__ == '__main__':
    main()
