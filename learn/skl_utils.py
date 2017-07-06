import numpy as np
import matplotlib.pyplot as plt
import os
import json
import itertools
from sklearn import metrics
from sklearn.model_selection import train_test_split

def generate_results_regressor(model, input_file, tmpdir, _id):
	input_data = np.recfromcsv(input_file, delimiter='\t', dtype=np.float64, case_sensitive=True)

	# hard coded values for now (to be added as cmd line args later)
	train_size = 0.75 		# default = 0.75
	random_state = None 	# default = None
	target_name = 'class'	# for testing, using 'class'

	if target_name not in input_data.dtype.names:
		raise ValueError('The provided data file does not seem to have a target column.')

	features = np.delete(input_data.view(np.float64).reshape(input_data.size, -1),
						 input_data.dtype.names.index(target_name), axis=1)

	training_features, testing_features, training_classes, testing_classes = \
		train_test_split(features, input_data[target_name], train_size=train_size, random_state=random_state)

	print('args used in model:', model.get_params())

	# fit model
	model.fit(training_features, training_classes)

	# get predicted classes
	predicted_classes = model.predict(testing_features)

	# get metrics and plots
	train_score = model.score(training_features, training_classes)
	test_score =  model.score(testing_features, testing_classes)
	r2_score = metrics.r2_score(testing_classes, predicted_classes)
	mean_squared_error = metrics.mean_squared_error(testing_classes, predicted_classes)

	# scatter plot of predicted vs true target values

	# save metrics
	save_metrics(tmpdir, _id, {
		'train_score': train_score, 
		'test_score': test_score,
		'r2_score': r2_score,
		'mean_squared_error': mean_squared_error
	})

	# save predicted values, what format should this be in? pickle? add id here too
	predicted_classes_list = predicted_classes.tolist()
	save_text_file(tmpdir, _id, 'prediction_values', predicted_classes_list)

def generate_results(model, input_file, tmpdir, _id):
	print('loading..')
	input_data = np.recfromcsv(input_file, delimiter='\t', dtype=np.float64, case_sensitive=True)

	# hard coded values for now (to be added as cmd line args later)
	train_size = 0.75 		# default = 0.75
	random_state = None 	# default = None
	target_name = 'class'	# for testing, using 'class'

	if target_name not in input_data.dtype.names:
		raise ValueError('The provided data file does not seem to have a target column.')

	features = np.delete(input_data.view(np.float64).reshape(input_data.size, -1),
						 input_data.dtype.names.index(target_name), axis=1)

	training_features, testing_features, training_classes, testing_classes = \
		train_test_split(features, input_data[target_name], train_size=train_size, random_state=random_state)

	print('args used in model:', model.get_params())

	# fit model
	model.fit(training_features, training_classes)

	# get predicted classes
	predicted_classes = model.predict(testing_features)

	# determine if target is binary or multiclass
	class_names = model.classes_
	if(len(class_names) > 2):
		average = 'macro'
	else:
		average = 'binary'

	# get metrics and plots
	train_score = model.score(training_features, training_classes)
	test_score =  model.score(testing_features, testing_classes)
	accuracy_score = metrics.accuracy_score(testing_classes, predicted_classes)
	precision_score = metrics.precision_score(testing_classes, predicted_classes, average=average)
	recall_score = metrics.recall_score(testing_classes, predicted_classes, average=average)
	f1_score = metrics.f1_score(testing_classes, predicted_classes, average=average)
	cnf_matrix = metrics.confusion_matrix(testing_classes, predicted_classes, labels=class_names)
	plot_confusion_matrix(tmpdir, _id, cnf_matrix, class_names)

	roc_auc_score = 'not supported for multiclass'
	if(average == 'binary'):
		# choose correct scoring function based on model
		try:
			proba_estimates = model.predict_proba(testing_features)[:, 1];
		except AttributeError:
			proba_estimates = model.decision_function(testing_features);

		roc_curve = metrics.roc_curve(testing_classes, proba_estimates)
		roc_auc_score = metrics.roc_auc_score(testing_classes, proba_estimates)
		plot_roc_curve(tmpdir, _id, roc_curve, roc_auc_score)

	# save metrics
	save_metrics(tmpdir, _id, {
		'train_score': train_score,
		'test_score': test_score,
		'accuracy_score': accuracy_score,
		'precision_score': precision_score,
		'recall_score': recall_score,
		'f1_score': f1_score,
		'roc_auc_score': roc_auc_score
	})

	# save predicted values, what format should this be in? pickle? add id here too
	predicted_classes_list = predicted_classes.tolist()
	save_text_file(tmpdir, _id, 'prediction_values', predicted_classes_list)

def save_metrics(tmpdir, _id, output):
	expdir = tmpdir + _id + '/'
	with open(os.path.join(expdir, 'value.json'), 'w') as outfile:
		json.dump({ '_scores': output }, outfile)

def save_text_file(tmpdir, _id, fname, content):
	expdir = tmpdir + _id + '/'
	with open(os.path.join(expdir, fname + '.txt'), 'w') as outfile:
		json.dump(content, outfile)

def plot_confusion_matrix(tmpdir, _id, cnf_matrix, class_names):
	cm = cnf_matrix
	classes = class_names

	np.set_printoptions(precision=2)
	plt.figure()
	plt.imshow(cm, interpolation='nearest', cmap=plt.cm.Blues)
	plt.title('Confusion Matrix')
	tick_marks = np.arange(len(classes))
	plt.xticks(tick_marks, classes, rotation=45)
	plt.yticks(tick_marks, classes)

	thresh = cm.max() / 2.
	for i, j in itertools.product(range(cm.shape[0]), range(cm.shape[1])):
		plt.text(j, i, cm[i, j],
				horizontalalignment="center",
				color="white" if cm[i, j] > thresh else "black")

	plt.subplots_adjust(bottom=0.15)
	plt.ylabel('True label')
	plt.xlabel('Predicted label')
	plt.savefig(tmpdir + _id + '/confusion_matrix_' + _id + '.png')

def plot_roc_curve(tmpdir, _id, roc_curve, roc_auc_score):
	fpr, tpr, _ = roc_curve

	plt.figure()
	lw = 2
	plt.plot(fpr, tpr, color='darkorange',
	         lw=lw, label='ROC curve (area = %0.2f)' % roc_auc_score)
	plt.plot([0, 1], [0, 1], color='navy', lw=lw, linestyle='--')
	plt.xlim([0.0, 1.0])
	plt.ylim([0.0, 1.05])
	plt.xlabel('False Positive Rate')
	plt.ylabel('True Positive Rate')
	plt.title('ROC Curve')
	plt.legend(loc="lower right")
	
	plt.savefig(tmpdir + _id + '/roc_curve' + _id + '.png')
