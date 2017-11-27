import numpy as np
import matplotlib.pyplot as plt
import os
import json
import itertools
from sklearn import metrics
from sklearn.model_selection import train_test_split, cross_val_score
binaryPlots = os.environ['MAKEPLOTS']


# if system environment has a random seed
random_state = 42
if 'RANDOM_STATE' in os.environ:
    random_state = int(os.environ['RANDOM_STATE'])

def balanced_accuracy(y_true, y_pred):
    """Default scoring function: balanced accuracy.
    Balanced accuracy computes each class' accuracy on a per-class basis using a
    one-vs-rest encoding, then computes an unweighted average of the class accuracies.
    Parameters
    ----------
    y_true: numpy.ndarray {n_samples}
            True class labels
    y_pred: numpy.ndarray {n_samples}
            Predicted class labels by the estimator
    Returns
    -------
    fitness: float
            Returns a float value indicating the individual's balanced accuracy
            0.5 is as good as chance, and 1.0 is perfect predictive accuracy
    """
    all_classes = list(set(np.append(y_true, y_pred)))
    all_class_accuracies = []
    for this_class in all_classes:
        this_class_sensitivity = 0.
        this_class_specificity = 0.
        if sum(y_true == this_class) != 0:
            this_class_sensitivity = \
                float(sum((y_pred == this_class) & (y_true == this_class))) /\
                float(sum((y_true == this_class)))

            this_class_specificity = \
                float(sum((y_pred != this_class) & (y_true != this_class))) /\
                float(sum((y_true != this_class)))

        this_class_accuracy = (this_class_sensitivity +
                               this_class_specificity) / 2.
        all_class_accuracies.append(this_class_accuracy)

    return np.mean(all_class_accuracies)


# make new SCORERS
SCORERS = metrics.SCORERS
SCORERS['balanced_accuracy'] = metrics.make_scorer(balanced_accuracy)


def generate_results_regressor(model, input_file, tmpdir, _id):
    input_data = np.recfromcsv(
        input_file, delimiter='\t', dtype=np.float64, case_sensitive=True)

    # hard coded values for now (to be added as cmd line args later)
    train_size = 0.75       # default = 0.75
    target_name = 'class'   # for testing, using 'class'

    if target_name not in input_data.dtype.names:
        raise ValueError(
            'The provided data file does not seem to have a target column.')

    features = np.delete(input_data.view(np.float64).reshape(input_data.size, -1),
                         input_data.dtype.names.index(target_name), axis=1)

    training_features, testing_features, training_classes, testing_classes = \
        train_test_split(features, input_data[target_name], train_size=train_size,
                         random_state=random_state, stratify=input_data[target_name])

    print('args used in model:', model.get_params())

    # fix random_state
    if hasattr(model, 'random_state'):
        setattr(model, 'random_state', random_state)
    # fit model
    model.fit(training_features, training_classes)

    # get predicted classes
    predicted_classes = model.predict(testing_features)

    # computing cross-validated metrics
    cv_scores = cross_val_score(
        model, training_features, training_classes, cv=5)

    # get metrics and plots
    train_score = model.score(training_features, training_classes)
    test_score = model.score(testing_features, testing_classes)
    r2_score = metrics.r2_score(testing_classes, predicted_classes)
    mean_squared_error = metrics.mean_squared_error(
        testing_classes, predicted_classes)

    # scatter plot of predicted vs true target values

    # save metrics
    metrics_dict = {'_scores': {
        'train_score': train_score,
        'test_score': test_score,
        'r2_score': r2_score,
        'mean_squared_error': mean_squared_error,
        'cv_scores_mean': cv_scores.mean(),
        'cv_scores_std': cv_scores.std(),
        'cv_scores': cv_scores.tolist()
    }
    }
    save_json_fmt(outdir=tmpdir, _id=_id,
                  fname="value.json", content=metrics_dict)

    # save predicted values, what format should this be in? pickle? add id here too
    predicted_classes_list = predicted_classes.tolist()
    save_json_fmt(outdir=tmpdir, _id=_id,
                  fname="prediction_values.json", content=predicted_classes_list)


def generate_results(model, input_file, tmpdir, _id):
    print('loading..')
    input_data = np.recfromcsv(
        input_file, delimiter='\t', dtype=np.float64, case_sensitive=True)
    # hard coded values for now (to be added as cmd line args later)
    train_size = 0.75		# default = 0.75
    target_name = 'class'  # for testing, using 'class'

    print(input_data)
    if target_name not in input_data.dtype.names:
        raise ValueError(
            'The provided data file does not seem to have a target column.')

    features = np.delete(input_data.view(np.float64).reshape(input_data.size, -1),
                         input_data.dtype.names.index(target_name), axis=1)

    training_features, testing_features, training_classes, testing_classes = \
        train_test_split(features, input_data[target_name], train_size=train_size,
                         random_state=random_state, stratify=input_data[target_name])

    print('args used in model:', model.get_params())

    # fix random_state
    if hasattr(model, 'random_state'):
        setattr(model, 'random_state', random_state)
    # fit model
    model.fit(training_features, training_classes)

    # get predicted classes
    predicted_classes = model.predict(testing_features)

    # computing cross-validated metrics
    cv_scores = cross_val_score(
                                estimator=model,
                                X=training_features,
                                y=training_classes,
                                scoring=SCORERS["balanced_accuracy"],
                                cv=5
                                )

    # determine if target is binary or multiclass
    class_names = model.classes_
    if(len(class_names) > 2):
        average = 'macro'
    else:
        average = 'binary'

    testing_classes_encoded = np.array(
                                    [list(model.classes_).index(c)
                                     for c in testing_classes], dtype=np.int
                                     )
    predicted_classes_encoded = np.array(
                                    [list(model.classes_).index(c)
                                     for c in predicted_classes], dtype=np.int
                                     )

    # get metrics and plots
    train_score = SCORERS['balanced_accuracy'](
        model, training_features, training_classes)
    test_score = SCORERS['balanced_accuracy'](
        model, testing_features, testing_classes)
    accuracy_score = balanced_accuracy(testing_classes_encoded, predicted_classes_encoded)
    precision_score = metrics.precision_score(
        testing_classes_encoded, predicted_classes_encoded, average=average)
    recall_score = metrics.recall_score(
        testing_classes_encoded, predicted_classes_encoded, average=average)
    f1_score = metrics.f1_score(
        testing_classes_encoded, predicted_classes_encoded, average=average)
    cnf_matrix = metrics.confusion_matrix(
        testing_classes, predicted_classes, labels=class_names)
    cnf_matrix_dict = {
        'cnf_matrix': cnf_matrix.tolist(),
        'class_names': class_names.tolist()
    }
    save_json_fmt(outdir=tmpdir, _id=_id,
                  fname="cnf_matrix.json", content=cnf_matrix_dict)

    if(binaryPlots):
        plot_confusion_matrix(tmpdir, _id, cnf_matrix, class_names)

    roc_auc_score = 'not supported for multiclass'
    if(average == 'binary'):
        # choose correct scoring function based on model
        try:
            proba_estimates = model.predict_proba(testing_features)[:, 1];
        except AttributeError:
            proba_estimates = model.decision_function(testing_features)

        roc_curve = metrics.roc_curve(testing_classes, proba_estimates)
        roc_auc_score = metrics.roc_auc_score(testing_classes, proba_estimates)

        fpr, tpr, _ = roc_curve
        roc_curve_dict = {
            'fpr': fpr.tolist(),
            'tpr': tpr.tolist(),
            'roc_auc_score': roc_auc_score
        }
        save_json_fmt(outdir=tmpdir, _id=_id,
                      fname="roc_curve.json", content=roc_curve_dict)
        if(binaryPlots):
           plot_roc_curve(tmpdir, _id, roc_curve, roc_auc_score)

    # save metrics
    metrics_dict = {'_scores': {
        'train_score': train_score,
        'test_score': test_score,
        'accuracy_score': accuracy_score,
        'precision_score': precision_score,
        'recall_score': recall_score,
        'f1_score': f1_score,
        'roc_auc_score': roc_auc_score,
        'cv_scores_mean': cv_scores.mean(),
        'cv_scores_std': cv_scores.std(),
        'cv_scores': cv_scores.tolist()
    }
    }
    save_json_fmt(outdir=tmpdir, _id=_id,
                  fname="value.json", content=metrics_dict)

    predicted_classes_list = predicted_classes.tolist()
    save_json_fmt(outdir=tmpdir, _id=_id,
                  fname="prediction_values.json", content=predicted_classes_list)


def save_json_fmt(outdir, _id, fname, content):
    """
    Save results into json format.
    Parameters
    ----------
    outdir: string
            path of output directory
    _id: string
            Job ID in FGlab
    fname: string
            file name
    content: list or directory
            content for results
    Returns
    -------
    None
    """
    expdir = outdir + _id + '/'
    with open(os.path.join(expdir, fname), 'w') as outfile:
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
                 color="gray" if cm[i, j] > thresh else "black")

    plt.subplots_adjust(bottom=0.15)
    plt.ylabel('True label')
    plt.xlabel('Predicted label')
    plt.savefig(tmpdir + _id + '/confusion_matrix_' + _id + '.png')

# After switching to dynamic charts, possibly disable outputting graphs from this function


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
