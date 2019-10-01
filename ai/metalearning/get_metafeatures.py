"""
Script to get metafeatures for a dataset passed at the command line.
Dumps the results into json. 
"""
import warnings
import logging
import os
import requests
import traceback
from io import StringIO

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


logger = logging.getLogger(__name__)
logger.addHandler(logging.StreamHandler())
logger.setLevel(logging.INFO)



def generate_metafeatures_from_filepath(input_file, target_field, **kwargs):
    """Calls metafeature generating methods from dataset_describe"""
    
    # Read the data set into memory
    df = pd.read_csv(input_file, sep=None, engine='python',**kwargs)
    dataset = Dataset(df, dependent_col = target_field, prediction_type='classification')

    return generate_metafeatures(dataset, target_field)

def generate_metafeatures_from_server(file_id, target_field, **kwargs):
    # Read the data set into memory
    raw_data = get_file_from_server(file_id)
    df = pd.read_csv(StringIO(raw_data), sep=None, engine='python',**kwargs)
    dataset = Dataset(df, dependent_col = target_field, prediction_type='classification')

    return generate_metafeatures(dataset, target_field)


def generate_metafeatures(dataset, target_field):
    """Generate metafeatures for a pandas dataset"""
    meta_features = OrderedDict() 
    for i in dir(dataset):
        result = getattr(dataset, i)
        if not i.startswith('__') and not i.startswith('_') and hasattr(result, '__call__'):
            meta_features[i] = result()
    return meta_features


def get_file_from_server(file_id):
    '''
    Retrieve a file from the main PennAI server
    '''
    apiPath = 'http://' + os.environ['LAB_HOST'] + ':' + os.environ['LAB_PORT']
    path = apiPath + "/api/v1/files/" + file_id

    logger.debug("retrieving file:" + file_id)
    logger.debug("api path: " + path)

    res = None
    try:
        res = requests.request('GET', path, timeout=15)
    except:
        logger.error("Unexpected error in get_file_from_server for path 'GET: " + str(path) + "': " + str(sys.exc_info()[0]))
        raise
    
    if res.status_code != requests.codes.ok:
        msg = "Request GET status_code not ok, path: '" + str(path) + "'' status code: '" + str(res.status_code) + "'' response text: " + str(res.text)
        logger.error(msg)
        raise RuntimeError(msg)

    logger.info("File retrieved, file_id: '" + file_id + "', path: '" + path + "', status_code: " + str(res.status_code))
    return res.text

def main():
    meta_features_all = []
    parser = argparse.ArgumentParser(description="Generates metafeatures for a given datafile", add_help=False)
    parser.add_argument('INPUT_FILE', type=str, help='Filepath or fileId.')
    parser.add_argument('-target', action='store', dest='TARGET', type=str, default='class',
                        help='Name of target column', required=True)
    parser.add_argument('-identifier_type', action='store', dest='IDENTIFIER_TYPE', type=str, choices=['filepath', 'fileid'], default='filepath',
                        help='Name of target column')
    args = parser.parse_args()

    # set up the file logger
    logpath = os.path.join(os.environ['PROJECT_ROOT'], "target/logs")
    if not os.path.exists(logpath):
        os.makedirs(logpath)

    formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
    fhandler = logging.FileHandler(os.path.join(logpath, 'get_metafeatures.log'))
    fhandler.setFormatter(formatter)
    logger.addHandler(fhandler)


    success = None
    errorMessage = None
    meta_json = None

    try:
        if(args.IDENTIFIER_TYPE == 'filepath'):
            meta_features = generate_metafeatures_from_filepath(args.INPUT_FILE, args.TARGET)
        else:
            meta_features = generate_metafeatures_from_server(args.INPUT_FILE, args.TARGET)

        meta_json = simplejson.dumps(meta_features, ignore_nan=True) #, ensure_ascii=False)  
    except Exception as e:
        logger.error(traceback.format_exc())
        meta_json = simplejson.dumps({"success":False, "errorMessage":"Exception: " + repr(e)}, ignore_nan=True) #, ensure_ascii=False)    

    print(meta_json)
    sys.stdout.flush()

if __name__ == '__main__':
    main()
