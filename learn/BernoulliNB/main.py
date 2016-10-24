import numpy as np
from sklearn.naive_bayes import BernoulliNB
from sklearn.cross_validation import train_test_split
from sklearn import datasets # just for testing
import pandas as pd #for file parsing?
import argparse
import os
import json
import urllib3
import pycurl
import time

# basedir = '/share/devel/Gp/learn/BernoulliNB/'
basedir = '/'
tmpdir = basedir + 'tmp/'
http = urllib3.PoolManager()

def parse_args():
	parser = argparse.ArgumentParser('Perform BernoulliNB')

	parser.add_argument('--alpha', action='store', dest='alpha', default=1.0, type=float, 
		help='Additive (Laplace/Lidstone) smoothing parameter (0 for no smoothing).')

	parser.add_argument('--binarize', action='store', dest='binarize', default=0.0, type=float,
		help='Threshold for binarizing (mapping to booleans) of sample features. If None, input is presumed to already consist of binary vectors.')

	parser.add_argument('--fit_prior', action='store', dest='fit_prior', default=True, type=bool_type,
		help='Whether to learn class prior probabilities or not. If false, a uniform prior will be used.')

	parser.add_argument('--_id', action='store', dest='_id', default=None, type=str,
		help="Experiment id in database")

	args = vars(parser.parse_args())

	return args

def bool_type(val):
	if(val.lower() == 'true'):
		return True
	elif(val.lower() == 'false'):
		return False
	else:	
		raise argparse.ArgumentTypeError(val + ' is not a valid boolean value')	

def grab_file(_id):
	if not os.path.exists(tmpdir + _id):
		os.makedirs(tmpdir + _id)

	# response = http.request('GET', 'http://lab:5080/api/v1/experiments/' + _id)
	response = http.request('GET', 'http://localhost:5080/api/v1/experiments/' + _id)
	jsondata = json.loads(response.data.decode('utf-8'))
	files = jsondata['_files']
	numfiles = 0;
	file_name = ''

	for x in files:
		time.sleep(5)
		file_id = x['_id']
		file_name = x['filename']
		c = pycurl.Curl()
		# c.setopt(c.URL, 'http://lab:5080/api/v1/files/' + file_id)
		c.setopt(c.URL, 'http://localhost:5080/api/v1/files/' + file_id)
		with open(tmpdir + file_name, 'wb') as f:
			c.setopt(c.WRITEFUNCTION, f.write)
			c.perform()
			c.close()
			numfiles += 1
	if numfiles == 1:
		print 'yo'
		#result = lr(params['penalty'],_id,file_name)
	else:
		result = 0;

	print files	

def run_algorithm():
	# generate data
	dataset = datasets.load_iris()
	#dataset = np.genfromtxt('fold_2_testFeatVec.csv', delimiter=',')
	print dataset

	X, y = dataset.data, dataset.target
	# determine constant test_size value, or if it will vary
	X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.30, random_state=5)

	model = BernoulliNB(**self.args)
	model.fit(X_train, y_train)
	print model.score(X_test, y_test)

	return model.predict(X_test)

if __name__ == "__main__":
	args = parse_args()
	grab_file(args['_id'])


