import argparse
import sys
import simplejson
from sklearn.utils import check_X_y, check_array
from sklearn.preprocessing import OneHotEncoder, OrdinalEncoder
from sklearn.compose import ColumnTransformer
import os
import os.path
import pandas as pd
import numpy as np
import logging
import requests
import time
import traceback
from io import StringIO


logger = logging.getLogger(__name__)
logger.addHandler(logging.StreamHandler())
logger.setLevel(logging.INFO)

MIN_ROWS = 10
MIN_COLS = 2
MIN_ROW_PER_CLASS = 2


def validate_data_from_server(file_id, target_field, categories = None, ordinals = None, **kwargs):
	# Read the data set into memory
	raw_data = get_file_from_server(file_id)
	df = pd.read_csv(StringIO(raw_data), sep=None, engine='python',**kwargs)
	return validate_data(df, target_field, categories, ordinals)

def validate_data_from_filepath(file_id, target_field, categories = None, ordinals = None, **kwargs):
	# Read the data set into memory
	df = pd.read_csv(file_id, sep=None, engine='python',**kwargs)
	return validate_data(df, target_field, categories, ordinals)


def encode_data(df, target_column, categories, ordinals, encoding_strategy = "OneHotEncoder"):
	'''
	use OneHotEncoder or OrdinalEncoder to convert categorical features
	See skl_utils
	'''

	# check that categorical and ordinal columns can be encoded
	if categories or ordinals:
		transformers = []
		if categories:
			if encoding_strategy == "OneHotEncoder": transformers.append(("categorical_encoder", OneHotEncoder(), categories))
			elif encoding_strategy == "OrdinalEncoder": transformers.append(("categorical_encoder", OrdinalEncoder(), categories))
		if ordinals:
			ordinal_features = sorted(list(ordinals.keys()))
			ordinal_map = [ordinals[k] for k in ordinal_features]
			transformers.append(("ordinalencoder",
									OrdinalEncoder(categories=ordinal_map),
									ordinal_features))

		ct = ColumnTransformer(
								transformers=transformers,
								 remainder='passthrough',
								 sparse_threshold=0
								 )
		return ct.fit_transform(df)
	else:
		return df


def validate_data(df, target_column = None, categories = None, ordinals = None):
	'''
	Check that a datafile is valid


	@return tuple
		boolean - validation result
		string 	- message
	'''
	num_df = df

	# dimension validation
	if df.shape[0] < MIN_ROWS:
		logger.warn("Dataset has dimensions {}, classification datasets must have at least {} rows.".format(df.shape, MIN_ROWS))
		return False, "Dataset has dimensions {}, classification datasets must have at least {} rows.".format(df.shape, MIN_ROWS)

	if df.shape[1] < MIN_COLS:
		logger.warn("Dataset has dimensions {}, classification datasets must have at least {} columns.".format(df.shape, MIN_COLS))
		return False, "Dataset has dimensions {}, classification datasets must have at least {} columns.".format(df.shape, MIN_COLS)


	# target column validation
	if (target_column != None):
		if not(target_column in df.columns):
			logger.warn("Target column '" + target_column + "' not in data")
			return False, "Target column '" + target_column + "' not in data"
		if categories and target_column in categories:
			logger.warn("Target column '" + target_column + "' cannot be a categorical feature")
			return False, "Target column '" + target_column + "' cannot be a categorical feature"
		if ordinals and target_column in ordinals:
			logger.warn("Target column '" + target_column + "' cannot be an ordinal feature")
			return False, "Target column '" + target_column + "' cannot be an ordinal feature"

	# check that cat columns can be encoded
	if categories or ordinals:
		try:
			encode_data(df, target_column, categories, ordinals, "OneHotEncoder")
			encode_data(df, target_column, categories, ordinals, "OrdinalEncoder")
		except Exception as e:
			logger.warn("encode_data() failed, " + str(e))
			return False, "encode_data() failed, " + str(e)
		
		if categories: num_df = num_df.drop(columns=categories)
		if ordinals: num_df = num_df.drop(columns=list(ordinals.keys()))

	# check only check if target is specified
	if target_column:
		# check that non-cat feature columns contain only numeric data
		num_df = num_df.drop(columns=target_column, axis=1)
		try:
			check_array(num_df, dtype=np.float64, order="C", force_all_finite=True)
		except Exception as e:
			logger.warn("sklearn.check_array() validation " + str(e))
			return False, "sklearn.check_array() validation " + str(e)

		# Check rows per class
		counts = df.groupby(target_column).count()
		fails_validation = counts[counts[counts.columns[1]] < MIN_ROW_PER_CLASS]
		if (not fails_validation.empty):
			msg = "Classification datasets must have at least 2 rows per class, class(es) '{}' have only 1 row.".format(list(fails_validation.index.values))
			logger.warn(msg)
			return False, msg

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

	logger.info("File retrieved, file_id: '" + file_id + "', path: '" + path + "', status_code: " + str(res.status_code))
	return res.text


def main():
	meta_features_all = []
	parser = argparse.ArgumentParser(description="Validate a dataset", add_help=False)
	parser.add_argument('INPUT_FILE', type=str, help='Filepath or fileId.')
	parser.add_argument('-target', action='store', dest='TARGET', type=str, default='class',
						help='Name of target column', required=False)
	parser.add_argument('-identifier_type', action='store', dest='IDENTIFIER_TYPE', type=str, choices=['filepath', 'fileid'], default='filepath',
						help='Name of target column')
	parser.add_argument('-categorical_features', action='store', dest='JSON_CATEGORIES', type=str, required=False, default=None,
						help='JSON list of categorical features')
	parser.add_argument('-ordinal_features', action='store', dest='JSON_ORDINALS', type=str, required=False, default=None,
						help='JSON dict of ordianl features and possible values')

	args = parser.parse_args()

	# set up the file logger
	logpath = os.path.join(os.environ['PROJECT_ROOT'], "target/logs")
	if not os.path.exists(logpath):
		os.makedirs(logpath)

	formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
	fhandler = logging.FileHandler(os.path.join(logpath, 'validateDataset.log'))
	fhandler.setFormatter(formatter)
	logger.addHandler(fhandler)

	success = None
	errorMessage = None
	meta_json = None

	categories = None
	ordinals = None


	try:
		if args.JSON_CATEGORIES: categories = simplejson.loads(args.JSON_CATEGORIES)
		if args.JSON_ORDINALS: ordinals = simplejson.loads(args.JSON_ORDINALS)
		#print("categories: ")
		#print(categories)

		if(args.IDENTIFIER_TYPE == 'filepath'):
			success, errorMessage = validate_data_from_filepath(args.INPUT_FILE, args.TARGET, categories, ordinals)
		else:
			success, errorMessage = validate_data_from_server(args.INPUT_FILE, args.TARGET, categories, ordinals)
		meta_json = simplejson.dumps({"success":success, "errorMessage":errorMessage}, ignore_nan=True) #, ensure_ascii=False)
	except Exception as e:
		logger.error(traceback.format_exc())
		meta_json = simplejson.dumps({"success":False, "errorMessage":"Exception: " + repr(e)}, ignore_nan=True) #, ensure_ascii=False)    

	print(meta_json)
	sys.stdout.flush()

if __name__ == '__main__':
	main()
