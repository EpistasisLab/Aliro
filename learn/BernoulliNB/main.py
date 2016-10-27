import numpy as np
from sklearn.naive_bayes import BernoulliNB
from sklearn.cross_validation import train_test_split
from utils import Experiment

def run_algorithm(args, input_file):
	input_data = np.recfromcsv(input_file, delimiter='\t', dtype=np.float64, case_sensitive=True)

	# hard coded values for now (to be added as cmd line args later)
	train_size = 0.75 		# default = 0.75
	random_state = None 	# default = None
	target_name = 'class'	# for testing, using 'class'

	#if args.TARGET_NAME not in input_data.dtype.names:
		#raise ValueError('The provided data file does not seem to have a target column. '
		#'Please make sure to specify the target column using the -target parameter.')

	features = np.delete(input_data.view(np.float64).reshape(input_data.size, -1),
						 input_data.dtype.names.index(target_name), axis=1)

	training_features, testing_features, training_classes, testing_classes = \
		train_test_split(features, input_data[target_name], train_size=train_size, random_state=random_state)

	model = BernoulliNB(alpha=args['alpha'], binarize=args['binarize'], fit_prior=args['fit_prior'])

	model.fit(training_features, training_classes)

	# compute other things that we want returned, like time elapsed
	score =  model.score(testing_features, testing_classes)
	predict = model.predict(testing_features)

	# temp print statements
	print('target_name:', target_name)
	print('args used in model:', model.get_params())
	print('score:', score)
	print('predict:', predict)

	# should i use tolist() here?
	return { 'score': score, 'predict': predict.tolist() }

if __name__ == "__main__":
	exp = Experiment('BernoulliNB')
	args, input_file = exp.get_input()
	result = run_algorithm(args, input_file)
	exp.save_output(result)