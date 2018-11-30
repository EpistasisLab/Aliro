'''
Script to validate and register with the PennAI server all the .csv or .tsv files in a directory as datasets
'''

import argparse
import sys
import simplejson
from sklearn.utils import check_X_y
import os
import os.path
import pandas as pd
import numpy as np
import logging
import requests
import time

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
logger.addHandler(logging.StreamHandler())


def registerDatafiles(directory, apiPath):
	'''
	Register all the datafiles in directory with the lab server
	'''

	logger.info("Register datafiles in directory '" + directory + "'")

	for root, dirs, files in os.walk(directory):
		for file in files:
			extension = os.path.splitext(file)[1]

			if (extension in ['.csv', '.tsv']):
				target_column = "class"

				valResult, message = validateDatafile(root, file, target_column)

				if not(valResult):
					logger.warning("Validation failed for " + os.path.join(root, file) + ": " + message)
					break
					
				registerDatafile(root, file, target_column, apiPath)		


def validateDatafile(root, file, target_column):
	'''
	Check that a datafile is valid

	@return tuple
		boolean - validation result
		string 	- message
	'''
	filepath = os.path.join(root, file)

	try:
		input_data = pd.read_csv(filepath, sep=None, engine='python', dtype=np.float64)
	except Exception as e:
		return False, "Unable to parse file: " + str(e)

	if not(target_column in input_data.columns):
		return False, "Target column '" + target_column + "' not in data"

	features = input_data.drop(target_column, axis=1).values
	target = input_data[target_column].values

	try:
		features, target = check_X_y(features, target, dtype=np.float64, order="C", force_all_finite=True)
	except Exception as e:
		return False, "sklearn.check_X_y() validation failed: " + str(e)

	return True, ""


def registerDatafile(root, file, target_column, apiPath):
    '''
    Register a datafile with the main PennAI server
    '''
    filepath = os.path.join(root, file)
    path = apiPath + "/api/v1/datasets"

    logger.debug("registering file:" + root + " " + file)
    logger.debug("api path: " + path)

    payload = {'_metadata' : simplejson.dumps({
    	'name': os.path.splitext(file)[0],
        'username': 'testuser',
        'dependent_col' : target_column,
        'filepath' : root
        })
    }

    files = {'_files': open(filepath, 'rb')}

    res = None
    try:
        res = requests.request('PUT', path, files=files, data=payload)
    except:
        logger.error("Unexpected error in registerDatafile for path 'PUT:" + str(path) + "': " + str(sys.exc_info()[0]))
        raise
    
    if res.status_code != requests.codes.ok:
        msg = "Request PUT status_code not ok, path: '" + str(path) + "'' status code: '" + str(res.status_code) + "'' response text: " + str(res.text)
        logger.error(msg)
        raise RuntimeError(msg)

    logger.info("Datafile '" + filepath + "' registered: " + str(res.status_code) + " : " + str(res.text))



def main():
    '''
    Attempt to load the inital datasets using the user directory and lab host defined in environmental variables
    '''
    meta_features_all = []
    parser = argparse.ArgumentParser(description="Reads or creates 'DATASET_metadata.json' file given a dataset", add_help=False)
    #parser.add_argument('DIRECTORY', type=str, help='Direcory to get get datafiles from')    

    args = parser.parse_args()

    apiPath = 'http://' + os.environ['LAB_HOST'] + ':' + os.environ['LAB_PORT']
    directory = os.environ['STARTUP_DATASET_PATH']

    registerDatafiles(directory, apiPath)   

if __name__ == '__main__':
    main()