import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import os
import json
import itertools
from sklearn import metrics
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.utils import safe_sqr
from eli5.sklearn import PermutationImportance
from sklearn.preprocessing import LabelEncoder



# if system environment allows to export figures
figure_export = True
if 'MAKEPLOTS' in os.environ:
    if str(os.environ['MAKEPLOTS']) == '1':
        figure_export = True

# if system environment has a random seed
random_state = None
if 'RANDOM_SEED' in os.environ:
    random_state = int(os.environ['RANDOM_SEED'])

#max numbers of bar in importance_score plots
max_bar_num = 10

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


def generate_results(model, input_file, tmpdir, _id, target_name='class', mode='classification', figure_export=figure_export):
    """generate reaults for apply a model on a datasetself.
    model: a machine learning model with scikit-learn API
    input_file: input file in csv format
    target_name: string target name in input file
    tmpdir: template folder PATH
    _id: experiment id
    mode: 'classification' or 'regression'
    figure_export: Ture or False for exporting figures

    """
    print('loading..')
    if isinstance(input_file, str):
        input_data = pd.read_csv(
            input_file, sep='\t')


        if target_name not in input_data.columns.values:
            raise ValueError(
                'The provided data file does not seem to have a target column.')

        feature_names = np.array([x for x in input_data.columns.values if x != target_name])

        features = input_data.drop(target_name, axis=1).values
        if mode == 'classification':
            classes = LabelEncoder().fit_transform(input_data[target_name].values)
        elif mode == 'regression':
            classes = input_data[target_name].values

        training_features, testing_features, training_classes, testing_classes = \
            train_test_split(features, classes, random_state=random_state, stratify=input_data[target_name])
    else:
        for inputf in input_file:
            if inputf.count('train'):
                training_data = pd.read_csv(inputf, sep='\t')
            elif inputf.count('test'):
                testing_data = pd.read_csv(inputf, sep='\t')

        feature_names = np.array([x for x in training_data.columns.values if x != target_name])

        training_features = training_data.drop(target_name, axis=1).values
        testing_features = testing_data.drop(target_name, axis=1).values

        training_labels = training_data[target_name].values
        testing_labels = testing_data[target_name].values

        le = LabelEncoder()
        le.fit(training_labels)

        training_classes = le.transform(training_labels)
        testing_classes = le.transform(testing_labels)


    print('args used in model:', model.get_params())

    # fix random_state
    if hasattr(model, 'random_state'):
        setattr(model, 'random_state', random_state)

    pipeline_text = generate_export_codes(model)
    export_scripts = open("{0}{1}/scripts_{1}.py".format(tmpdir, _id), "w")
    export_scripts.write(pipeline_text)
    export_scripts.close()
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

    # exporting/computing importance score
    coefs = compute_imp_score(model, training_features, training_classes, random_state)

    feature_importances = {
        'feature_names': feature_names.tolist(),
        'feature_importances': coefs.tolist()
    }

    save_json_fmt(outdir=tmpdir, _id=_id,
                  fname="feature_importances.json", content=feature_importances)

    if figure_export:
        plot_imp_score(tmpdir, _id, coefs, feature_names)

    if mode == 'classification':
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

        #export plot
        if figure_export:
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
            if figure_export:
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
    elif mode == 'regression':
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

    predicted_classes_list = predicted_classes.tolist()
    save_json_fmt(outdir=tmpdir, _id=_id,
                  fname="prediction_values.json", content=predicted_classes_list)

def compute_imp_score(model, training_features, training_classes, random_state):
    # exporting/computing importance score
    if hasattr(model, 'coef_'):
        coefs = model.coef_
    else:
        coefs = getattr(model, 'feature_importances_', None)
    if coefs is None:
        perm = PermutationImportance(
                                    estimator=model,
                                    n_iter=5,
                                    random_state=random_state,
                                    refit=False
                                    )
        perm.fit(training_features, training_classes)
        coefs = perm.feature_importances_

    if coefs.ndim > 1:
        coefs = safe_sqr(coefs).sum(axis=0)

    return coefs


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
    """
    Save ROC Curve.
    """

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

def plot_imp_score(tmpdir, _id, coefs, feature_names):
    # plot bar charts for top 10 importanct features
    num_bar = min(max_bar_num, len(coefs))
    indices = np.argsort(coefs)[-num_bar:]
    h=plt.figure()
    plt.title("Feature importances")
    plt.barh(range(num_bar), coefs[indices], color="r", align="center")
    plt.yticks(range(num_bar), feature_names[indices])
    plt.ylim([-1, num_bar])
    h.tight_layout()
    plt.savefig(tmpdir + _id + '/imp_score' + _id + '.png')

def generate_export_codes(model):
    """Generate all library import calls for use in stand alone python scripts.
    Parameters
    ----------
    model: scikit-learn estimator
    Returns
    -------
    pipeline_text: String
       The Python code that imports all required library used in the current
       optimized pipeline
    """
    pipeline_text = 'import numpy as np\nimport pandas as pd\n'

    # Always start with these imports
    pipeline_imports = {
        'sklearn.model_selection': ['train_test_split'],
    }
    model_import_path = str(model.__class__).split('\'')[1].split('.')
    op_name = model_import_path[-1]
    pipeline_imports[".".join(model_import_path[:-1])] = [op_name]
    params = model.get_params()

    # Build import string
    for key in sorted(pipeline_imports.keys()):
        module_list = ', '.join(sorted(pipeline_imports[key]))
        pipeline_text += 'from {} import {}\n'.format(key, module_list)

    pipeline_text += """
# NOTE: Make sure that the target (y) is labeled 'target' in the data file
input_data = pd.read_csv('PATH/TO/DATA/FILE', sep='COLUMN_SEPARATOR', dtype=np.float64)
features = input_data.drop('target', axis=1).values
training_features, testing_features, training_target, testing_target = \\
            train_test_split(features, tpot_data['target'].values, random_state=42)
"""
    op_arguments = ['{}={}'.format(key, params[key]) for key in sorted(params.keys())]

    pipeline_text += "\nmodel={}({})".format(op_name, ", ".join(op_arguments))

    pipeline_text += """
model.fit(training_features, training_target)
results = model.predict(testing_features)
"""

    return pipeline_text
