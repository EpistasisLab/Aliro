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
		self.params = parse_args(self.get_args())

	def get_args(self):
		return [
			{ 'name': 'alpha', 'type': float },
			{ 'name': 'binarize', 'type': float },
			{ 'name': 'fit_prior', 'type': bool },
		]

	def run(self):
		# generate data
		X = np.random.randint(2, size=(6, 100))
		Y = np.array([1, 2, 3, 4, 4, 5])
		# this isn't accepting all the params correctly --> look into this
		clf = BernoulliNB(**self.params)
		print clf.get_params()
		clf.fit(X, Y)

		# get accepted parameters (in get_args function) so we don't have to manually set them, then call this in the get_args function instead of manually defining
		print clf.__init__.__code__.co_varnames

		# set correct value types!
		#BernoulliNB(self.params)

		return clf.predict(X[2:3])


def parse_args(args):
	parser = argparse.ArgumentParser(description="parse command line arguments")

	# do i need to set the type or will it work without the proper type?
	for arg in args:
		parser.add_argument('--' + arg['name'], dest=arg['name'], type=arg['type'], default=None)

	params = vars(parser.parse_args())

	return params


if __name__ == "__main__":
	FGBernoulliNB().run()


