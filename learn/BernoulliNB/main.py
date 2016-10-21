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

#basedir = '/share/devel/Gp/learn/bnb/'
#tmpdir = basedir + 'tmp/'
http = urllib3.PoolManager()

class FGBernoulliNB:

	def __init__(self):
		self.args = parse_args(self.get_params())
		self.file = grab_file()
		self.result = self.run()

	def get_params(self):
		return {
			'alpha': 
				{ 'type': float, 'default': 1.0 },
			'binarize': 
				{ 'type': float, 'default': 0.0 },
			'fit_prior': 
				{ 'type': bool, 'default': True }
		}

	def run(self):
		# generate data
		dataset = np.genfromtxt('fold_2_testFeatVec.csv', delimiter=',')
		print dataset

		X, y = dataset.data, dataset.target
		# determine constant test_size value, or if it will vary
		X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.30, random_state=5)

		model = BernoulliNB(**self.args)
		model.fit(X_train, y_train)
		print model.score(X_test, y_test)

		return model.predict(X_test)

def grab_file():
	print ''
	#parser = argparse.ArgumentParser()
	#parser.add_argument('--_id', dest='_id', default=None)


	#_id = vars(parser.parse_args())['--_id']

def parse_args(params):
	parser = argparse.ArgumentParser()

	# parse args for each parameter
	for key, val in params.items():
		if(val['type'] == bool):
			parser.add_argument('--' + key, dest=key, type=bool_type, default=val['default'])
		else:	
			parser.add_argument('--' + key, dest=key, type=val['type'], default=val['default'])

	args = vars(parser.parse_args())

	return args

def bool_type(val):
	if(val.lower() == 'true'):
		return True
	elif(val.lower() == 'false'):
		return False
	else:	
		raise argparse.ArgumentTypeError(val + ' is not a valid boolean value')

if __name__ == "__main__":
	print FGBernoulliNB().result


