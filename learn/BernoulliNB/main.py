import numpy as np
from sklearn.naive_bayes import BernoulliNB
from sklearn.cross_validation import train_test_split
from sklearn import datasets # just for testing
import pandas as pd #for file parsing?
import argparse
import os
import json
import urllib3
import time

# basedir = '/share/devel/Gp/learn/BernoulliNB/'
basedir = 'C:/Users/Sharon Tartarone/Box Sync/gp-project/Gp/learn/BernoulliNB/'
tmpdir = basedir + 'tmp/'
http = urllib3.PoolManager()

# put this into a utilities.prepare_input() function, which will return the arguments and the data
# then in the main, we just call util.prepare_input and then run algorithm! 
# set up a utilities file for this?
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

# add this to the utilities file, and others for other type functions (float between 0 and 1)
def bool_type(val):
	if(val.lower() == 'true'):
		return True
	elif(val.lower() == 'false'):
		return False
	else:	
		raise argparse.ArgumentTypeError(val + ' is not a valid boolean value')	

# add this to the utilities file that prepares input?
def get_input(_id):
	expdir = tmpdir + _id + '/'

	if not os.path.exists(expdir):
		os.makedirs(expdir)

	# response = http.request('GET', 'http://lab:5080/api/v1/experiments/' + _id)
	response = http.request('GET', 'http://localhost:5080/api/v1/experiments/' + _id)
	jsondata = json.loads(response.data.decode('utf-8'))
	files = jsondata['_files']
	input_file = ''

	# do we need the loop if upon submission, there will only be one file?
	numfiles = 0;
	for file in files:
		#time.sleep(5) # do we need this?
		# response = http.request('GET', 'http://lab:5080/api/v1/files/' + file['_id'])
		response = http.request('GET', 'http://localhost:5080/api/v1/files/' + file['_id'])
		input_file = expdir + file['filename']
		with open(input_file, 'w') as f:
			f.write(response.data)
			numfiles += 1

	if numfiles == 1:
		return input_file
	else:
		return 0

# should everything up to the run of the algorithm be automated in a utilities function?
def run_algorithm(args, input_file):
	input_data = np.recfromcsv(input_file, delimiter='\t', dtype=np.float64, case_sensitive=True)

	target_name = 'relationship'
	random_state = 42

	features = np.delete(input_data.view(np.float64).reshape(input_data.size, -1),
						 input_data.dtype.names.index(target_name), axis=1)

	training_features, testing_features, training_classes, testing_classes = \
		train_test_split(features, input_data[target_name], random_state=random_state)

	model = BernoulliNB(alpha=args['alpha'], binarize=args['binarize'], fit_prior=args['fit_prior'])
	print model.get_params()
	model.fit(training_features, training_classes)

	# add other things that we want returned, like time elapsed, etc (look at notes for this). should predict actually be saved?
	score =  model.score(testing_features, testing_classes)
	predict = model.predict(testing_features)

	# should i use to list here?
	return { 'score': score, 'predict': predict.tolist() }

if __name__ == "__main__":
	args = parse_args()
	input_file = get_input(args['_id'])
	result = run_algorithm(args, input_file)

	# put this in another variable to access globally, which will work since this is only one experiment!!!
	expdir = tmpdir + args['_id'] + '/'

	with open(os.path.join(expdir, 'value.json'), 'w') as outfile:
		json.dump({ '_scores': { 'score': result['score'], 'predict': result['predict'] } }, outfile)