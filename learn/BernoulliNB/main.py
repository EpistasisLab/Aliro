import numpy as np
from sklearn.naive_bayes import BernoulliNB
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
		# should be called args
		self.params = parse_args(self.get_params())

	def get_params(self):
		return {
			'alpha': { 
				'type': float, 
				'default': 1.0 
			},
			'binarize': { 
				'type': float, 
				'default': 0.0 
			},
			'fit_prior': { 
				'type': bool, 
				'default': True 
			}
		}

	#explicity accept the parameters?
	def run(self):
		# generate data
		X = np.random.randint(2, size=(6, 100))
		Y = np.array([1, 2, 3, 4, 4, 5])

		for p in self.params.values():
			print p
			print type(p)

		clf = BernoulliNB()
		#print clf.get_params
		clf.fit(X, Y)

		return clf.predict(X[2:3])

def parse_args(params):
	parser = argparse.ArgumentParser(description="parse command line arguments")

	# parse args for each parameter
	for key, val in params.items():
		if(val['type'] == bool):
			parser.add_argument('--' + key, dest=key, type=setBool, default=val['default'])
		else:	
			parser.add_argument('--' + key, dest=key, type=val['type'], default=val['default']) # shouldn't need set default?

	args = vars(parser.parse_args())

	return args

def setBool(val):
	# set validation for float bool values?
	if(val.lower() == 'true'):
		return True
	elif(val.lower() == 'false'):
		return False
	else:	
		raise argparse.ArgumentTypeError(val + ' is not a valid boolean value')

if __name__ == "__main__":
	FGBernoulliNB().run()


