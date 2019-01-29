import argparse
import sys
import simplejson
from sklearn.utils import check_X_y, check_array
import os
import os.path
import pandas as pd
import numpy as np
import logging
import requests
import time


logger = logging.getLogger(__name__)
logger.addHandler(logging.StreamHandler())
logger.setLevel(logging.INFO)


def validate_data_from_server(file_id, target_field, **kwargs):
    # Read the data set into memory
    raw_data = get_file_from_server(file_id)
    df = pd.read_csv(StringIO(raw_data), sep=None, engine='python',**kwargs)
    return validate_data(df, target_field)

def validate_data_from_file(file_id, target_field, **kwargs):
    # Read the data set into memory
    df = pd.read_csv(file_id, sep=None, engine='python',**kwargs)
    return validate_data(df, target_field)


def validate_data(df, target_column = None):
	'''
	Check that a datafile is valid


	@return tuple
		boolean - validation result
		string 	- message
	'''
	if (target_column != None):
		
		if not(target_column in df.columns):
			return False, "Target column '" + target_column + "' not in data"

		features = df.drop(target_column, axis=1).values
		target = df[target_column].values

		try:
			features, target = check_X_y(features, target, dtype=np.float64, order="C", force_all_finite=True)
		except Exception as e:
			return False, "sklearn.check_X_y() validation failed: " + str(e)

		return True, None

	else:
		try:
			check_array(df, dtype=np.float64, order="C", force_all_finite=True)
		except Exception as e:
			return False, "sklearn.check_array() validation failed: " + str(e)

		return True, None

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

    logger.info("File retrieved: " + str(res.status_code))
    return res.text


def main():
    meta_features_all = []
    parser = argparse.ArgumentParser(description="Validate a dataset", add_help=False)
    parser.add_argument('INPUT_FILE', type=str, help='Filepath or fileId.')
    parser.add_argument('-target', action='store', dest='TARGET', type=str, default='class',
                        help='Name of target column', required=False)
    parser.add_argument('-identifier_type', action='store', dest='IDENTIFIER_TYPE', type=str, choices=['filepath', 'fileid'], default='filepath',
                        help='Name of target column')
    args = parser.parse_args()

    meta_features = None

    if(args.IDENTIFIER_TYPE == 'filepath'):
        meta_features = validate_data_from_filepath(args.INPUT_FILE, args.TARGET)
    else:
        meta_features = validate_data_from_server(args.INPUT_FILE, args.TARGET)

    meta_json = simplejson.dumps(meta_features, ignore_nan=True) #, ensure_ascii=False)    

    print(meta_json)
    sys.stdout.flush()

if __name__ == '__main__':
    main()
