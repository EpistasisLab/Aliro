import numpy as np
from sklearn.naive_bayes import BernoulliNB
from sklearn.cross_validation import train_test_split
from utilities import Experiment

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

	# should i use tolist() here?
	return { 'score': score, 'predict': predict.tolist() }

if __name__ == "__main__":
	exp = Experiment('BernoulliNB')
	args, input_file = exp.get_input()
	result = run_algorithm(args, input_file)
	exp.save_output(result)