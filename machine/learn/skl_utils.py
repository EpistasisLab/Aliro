import __main__
from sys import version
import warnings
from sklearn import __version__ as skl_version
from sklearn.externals import joblib
from mlxtend.evaluate import feature_importance_permutation
from sklearn.utils import safe_sqr, check_X_y
from sklearn.pipeline import make_pipeline, Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, OrdinalEncoder, LabelEncoder
from sklearn.model_selection import GridSearchCV, cross_validate, StratifiedKFold, KFold
from sklearn.metrics import SCORERS, roc_curve, auc, make_scorer, confusion_matrix
import itertools
import json
import os
import matplotlib.pyplot as plt
from matplotlib import rcParams
import shap 
import numpy as np
import pandas as pd
import matplotlib as mpl
mpl.use('Agg')

# if system environment allows to export figures
figure_export = True
if 'MAKEPLOTS' in os.environ:
    if str(os.environ['MAKEPLOTS']) == '1':
        figure_export = True

# if system environment has a random seed
random_state = None
if 'RANDOM_SEED' in os.environ:
    random_state = int(os.environ['RANDOM_SEED'])
# max numbers of bar in importance_score plot and decision tree plot
max_bar_num = 10

# The maximum depth of the decision tree for plot
DT_MAX_DEPTH = 6
if 'DT_MAX_DEPTH' in os.environ:
    DT_MAX_DEPTH = int(os.environ['DT_MAX_DEPTH'])


def balanced_accuracy(y_true, y_pred):
    """Default scoring function of classification: balanced accuracy.
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
        Returns a float value indicating balanced accuracy
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


def pearsonr(y_true, y_pred):
    """Scoring function: Calculates a Pearson correlation coefficient.

    Parameters
    ----------
    y_true: numpy.ndarray {n_samples}
        True class labels
    y_pred: numpy.ndarray {n_samples}
        Predicted class labels by the estimator
    Returns
    -------
    fitness: float
        Returns a float value indicating Pearson correlation coefficient
    """
    from scipy.stats import pearsonr
    r = pearsonr(y_true, y_pred)[0]
    if np.isnan(r):
        r = 0.0
    return r


# make new SCORERS
SCORERS['balanced_accuracy'] = make_scorer(balanced_accuracy)
SCORERS['pearsonr'] = make_scorer(pearsonr)

def get_column_names_from_ColumnTransformer(column_transformer, feature_names):
    """Get column names after applying Column Transformations

    Parameters
    ----------
    column_transformer: sklearn.compose._column_transformer.ColumnTransformer
        A list of categorical, ordinal and remaining transformations
    feature_names: list of strings
        Original list of column/feature names
    Returns
    -------
    new_feature_names: list of strings
        Feature names generated after column transformations
    """   
    new_feature_names = []
    for transformer_in_columns in column_transformer.transformers_:
        _, transformer, col_indices  = transformer_in_columns
        feature_columns = [feature_names[i] for i in col_indices]
        try: ## Only works for OneHotEncoder transforms
            names = transformer.get_feature_names(feature_columns)
            new_feature_names += list(names)
        except:
            new_feature_names += feature_columns
    return new_feature_names


def generate_results(model, input_data,
                     tmpdir, _id, target_name='class',
                     mode='classification', figure_export=figure_export,
                     random_state=random_state,
                     filename=['test_dataset'],
                     categories=None,
                     ordinals=None,
                     encoding_strategy="OneHotEncoder",
                     param_grid={}
                     ):
    """Generate reaults for applying a model on dataset in PennAI.

    Parameters
    ----------
    model: scikit-learn Estimator
        A machine learning model following scikit-learn API
    input_data: pandas.Dataframe or list of two pandas.Dataframe
        pandas.DataFrame: PennAI will use 10 fold CV to estimate train/test scroes.
        list of two pandas.DataFrame: The 1st pandas.DataFrame is training dataset,
        while the 2nd one is testing dataset
    target_name: string
        Target name in input data
    tmpdir: string
        Temporary directory for saving experiment results
    _id: string
        Experiment id
    mode:  string
        'classification': Run classification analysis
        'regression': Run regression analysis
    figure_export: boolean
        If figure_export is True, the figures will be generated and exported.
    random_state: int
        Random seed
    filename: list
        Filename for input dataset
    categories: list
        List of column names for one-hot encoding
    ordinals: dict
        Dictionary of ordinal features:
            Keys of dictionary: categorical feature name(s)
            Values of dictionary: categorical values
    encoding_strategy: string
        Encoding strategy for categorical features defined in projects.json
    param_grid: dict
        If grid_search is non-empty dictionary, then the experiment will
        do parameter tuning via GridSearchCV. It should report best result to UI
        and save all results to knowlegde base.

    Returns
    -------
    None
    """
    print('loading..')
    if isinstance(input_data, list):
        training_data = input_data[0]
        testing_data = input_data[1]
        input_data = pd.concat([training_data, testing_data])
        train_rows = training_data.shape[0]
        total_rows = input_data.shape[0]
        cv = [
            np.array(
                range(train_rows)), np.array(
                range(
                    train_rows, total_rows))]
    else:
        cv = 10

    feature_names = np.array(
        [x for x in input_data.columns.values if x != target_name])
    num_classes = input_data[target_name].unique().shape[0]
    features = input_data.drop(target_name, axis=1).values
    target = input_data[target_name].values

    features, target = check_X_y(
        features, target, dtype=None, order="C", force_all_finite=True)

    # fix random_state
    model = setup_model_params(model, 'random_state', random_state)
    # set class_weight
    model = setup_model_params(model, 'class_weight', 'balanced')

    # use OneHotEncoder or OrdinalEncoder to convert categorical features
    if categories or ordinals:
        transform_cols = []
        feature_names_list = list(feature_names)
        if categories:
            col_idx = get_col_idx(feature_names_list, categories)
            if encoding_strategy == "OneHotEncoder":
                transform_cols.append(
                    ("categorical_encoder", OneHotEncoder(
                        handle_unknown='ignore'), col_idx))
            elif encoding_strategy == "OrdinalEncoder":
                ordinal_map = OrdinalEncoder().fit(
                    features[:, col_idx]).categories_
                transform_cols.append(
                    ("categorical_encoder", OrdinalEncoder(
                        categories=ordinal_map), col_idx))
        if ordinals:
            ordinal_features = sorted(list(ordinals.keys()))
            col_idx = get_col_idx(feature_names_list, ordinal_features)
            ordinal_map = [ordinals[k] for k in ordinal_features]
            transform_cols.append(("ordinalencoder",
                                   OrdinalEncoder(categories=ordinal_map),
                                   col_idx))
        ct = ColumnTransformer(
            transformers=transform_cols,
            remainder='passthrough',
            sparse_threshold=0
        )

        model = make_pipeline(ct, model)

    scores = {}
    #print('Args used in model:', model.get_params())
    if mode == "classification":
        if(num_classes > 2):
            scoring = ["balanced_accuracy",
                       "precision_macro",
                       "recall_macro",
                       "f1_macro"]
            scores['roc_auc_score'] = 'not supported for multiclass'
            scores['train_roc_auc_score'] = 'not supported for multiclass'
        else:
            scoring = ["balanced_accuracy",
                       "precision",
                       "recall",
                       "f1",
                       "roc_auc"]

        metric = "accuracy"
    else:
        scoring = ["r2",
                   "neg_mean_squared_error",
                   "neg_mean_absolute_error",
                   "explained_variance",
                   "pearsonr"]
        metric = 'r2'

    with warnings.catch_warnings():
        warnings.simplefilter('ignore')
        if param_grid:
            if isinstance(model, Pipeline):
                parameters = {}
                for key, val in param_grid.items():
                    step_name = model.steps[-1][0]
                    pipe_key = "{}__{}".format(step_name, key)
                    parameters[pipe_key] = val
            else:
                parameters = param_grid
            clf = GridSearchCV(estimator=model,
                               param_grid=parameters,
                               scoring=metric,
                               cv=5,
                               refit=True,
                               verbose=0,
                               error_score=-float('inf'),
                               return_train_score=True)
            clf.fit(features, target)
            cv_results = clf.cv_results_
            # rename params name from pipeline object
            fmt_result = []
            for param, ts in zip(
                    cv_results['params'], cv_results['mean_train_score']):
                row_dict = {'mean_train_score': ts}
                for key, val in param.items():
                    row_dict[key.split('__')[-1]] = val
                fmt_result.append(row_dict)
            fmt_result = pd.DataFrame(fmt_result)
            fmt_result_file = '{0}{1}/grid_search_results_{1}.csv'.format(
                tmpdir, _id)
            fmt_result.to_csv(fmt_result_file, index=False)
            model = clf.best_estimator_
        else:
            model.fit(features, target)

        # computing cross-validated metrics
        cv_scores = cross_validate(
            estimator=model,
            X=features,
            y=target,
            scoring=scoring,
            cv=cv,
            return_train_score=True,
            return_estimator=True
        )

    for s in scoring:
        train_scores = cv_scores['train_' + s]
        test_scores = cv_scores['test_' + s]

        # remove _macro
        score_name = s.replace('_macro', '')
        # make balanced_accuracy as default score
        if score_name in ["balanced_accuracy", "neg_mean_squared_error"]:
            scores['train_score'] = abs(train_scores.mean())
            scores['test_score'] = abs(test_scores.mean())
        # for api will fix later

        if score_name == "balanced_accuracy":
            scores['accuracy_score'] = test_scores.mean()
        # for experiment tables
        if score_name == "balanced_accuracy" or score_name == "r2":
            scores['exp_table_score'] = test_scores.mean()
        if score_name in ["neg_mean_squared_error", "neg_mean_absolute_error"]:
            scores['train_{}_score'.format(score_name)] = abs(
                train_scores.mean())
            scores['{}_score'.format(score_name)] = abs(test_scores.mean())
        else:
            scores['train_{}_score'.format(score_name)] = train_scores.mean()
            scores['{}_score'.format(score_name)] = test_scores.mean()

    # dump fitted module as pickle file
    export_model(tmpdir, _id, model, filename, target_name, mode, random_state)

    # get predicted classes
    predicted_classes = model.predict(features)

    # exporting/computing importance score
    coefs, imp_score_type = compute_imp_score(model, metric,
                                              features,
                                              target,
                                              random_state)

    feature_importances = {
        'feature_names': feature_names.tolist(),
        'feature_importances': coefs.tolist(),
        'feature_importance_type': imp_score_type
    }

    save_json_fmt(
        outdir=tmpdir,
        _id=_id,
        fname="feature_importances.json",
        content=feature_importances)
    dtree_train_score = None
    if figure_export:
        top_features_names, indices = plot_imp_score(
            tmpdir, _id, coefs, feature_names, imp_score_type)
        if not categories and not ordinals:
            dtree_train_score = plot_dot_plot(tmpdir, _id, features,
                                              target,
                                              top_features_names,
                                              indices,
                                              random_state,
                                              mode)

    # save metrics
    scores['dtree_train_score'] = dtree_train_score

    if mode == 'classification':
        plot_confusion_matrix(tmpdir,
                              _id,
                              features,
                              target,
                              model.classes_,
                              cv_scores,
                              figure_export)

        if type(model).__name__ == 'Pipeline':
            step_names = [step[0] for step in model.steps]
            column_transformer = model[step_names[0]]
            classifier_model = model[step_names[1]]
            modified_feature_names = get_column_names_from_ColumnTransformer(column_transformer, feature_names)
            modified_features = column_transformer.transform(features.copy())
            plot_shap_summary_curve(tmpdir,
                                    _id,
                                    classifier_model,
                                    modified_features,
                                    modified_feature_names,
                                    classifier_model.classes_)
        else:
            plot_shap_summary_curve(tmpdir,
                                    _id,
                                    model,
                                    features.copy(), # Send a copy of features as it may get modified
                                    feature_names,
                                    model.classes_)
        
        if num_classes == 2:
            plot_roc_curve(
                tmpdir,
                _id,
                features,
                target,
                cv_scores,
                figure_export)
    else:  # regression
        if figure_export:
            plot_cv_pred(tmpdir, _id, features, target, cv_scores)

    metrics_dict = {'_scores': scores}

    save_json_fmt(outdir=tmpdir, _id=_id,
                  fname="value.json", content=metrics_dict)

    prediction_dict = {'prediction_values': predicted_classes.tolist()}
    save_json_fmt(outdir=tmpdir, _id=_id,
                  fname="prediction_values.json", content=prediction_dict)


def get_col_idx(feature_names_list, columns):
    """Get unique indexes of columns based on list of column names.
    Parameters
    ----------
    feature_names_list: list
        List of column names on dataset
    columns: list
        List of selected column names

    Returns
    -------
    col_idx: list
        list of selected column indexes
    """
    return [feature_names_list.index(c) for c in columns]


def setup_model_params(model, parameter_name, value):
    """Assign value to a parameter in a model.
    Parameters
    ----------
    model: scikit-learn Estimator
        Machine learning model following scikit-learn API
    parameter_name: string
        Parameter name in the scikit-learn model
    value: object
        Values for assigning to the parameter

    Returns
    -------
    model: scikit-learn Estimator
        A new scikit-learn model with a updated parameter
    """
    # fix random_state
    if hasattr(model, parameter_name):
        setattr(model, parameter_name, value)
    return model


def compute_imp_score(model, metric, features, target, random_state):
    """Compute permuation importance scores for features.

    Parameters
    ----------
    tmpdir: string
        Temporary directory for saving experiment results
    model:  scikit-learn Estimator
        A fitted scikit-learn model
    metric: str, callable
        The metric for evaluating the feature importance through
        permutation. By default, the strings 'accuracy' is
        recommended for classifiers and the string 'r2' is
        recommended for regressors. Optionally, a custom
        scoring function (e.g., `metric=scoring_func`) that
        accepts two arguments, y_true and y_pred, which have
        similar shape to the `y` array.
    features: np.darray/pd.DataFrame
        Features in training dataset
    target: np.darray/pd.DataFrame
        Target in training dataset
    random_state: int
        Random seed for permuation importances

    Returns
    -------
    coefs: np.darray
        Feature importance scores
    imp_score_type: string
        Importance score type

    """

    coefs, _ = feature_importance_permutation(
        predict_method=model.predict,
        X=features,
        y=target,
        num_rounds=5,
        metric=metric,
        seed=random_state,
    )
    imp_score_type = "Permutation Feature Importance"

    return coefs, imp_score_type


def save_json_fmt(outdir, _id, fname, content):
    """Save results into json format.

    Parameters
    ----------
    outdir: string
        Path of output directory
    _id: string
        Experiment ID in PennAI
    fname: string
        File name
    content: list or directory
        Content for results
    Returns
    -------
    None
    """
    expdir = outdir + _id + '/'
    with open(os.path.join(expdir, fname), 'w') as outfile:
        json.dump(content, outfile)


def plot_confusion_matrix(
        tmpdir,
        _id,
        X,
        y,
        class_names,
        cv_scores,
        figure_export):
    """Make plot for confusion matrix.

    Parameters
    ----------
    tmpdir: string
        Temporary directory for saving experiment results
    _id: string
        Experiment ID in PennAI
    X: np.darray/pd.DataFrame
        Features in training dataset
    y: np.darray/pd.DataFrame
        Target in training dataset
    class_names: list
        List of class names
    cv_scores: dictionary
        Return from sklearn.model_selection.cross_validate
    figure_export: boolean
        If true, then export roc curve plot
    Returns
    -------
    None
    """
    pred_y = np.empty(y.shape)
    cv = StratifiedKFold(n_splits=10)
    for cv_split, est in zip(cv.split(X, y), cv_scores['estimator']):
        train, test = cv_split
        pred_y[test] = est.predict(X[test])
    cnf_matrix = confusion_matrix(
        y, pred_y, labels=class_names)
    cnf_matrix_dict = {
        'cnf_matrix': cnf_matrix.tolist(),
        'class_names': class_names.tolist()
    }
    save_json_fmt(outdir=tmpdir, _id=_id,
                  fname="cnf_matrix.json", content=cnf_matrix_dict)

    # export plot
    if figure_export:
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
                     ha="center", va="center",
                     color="gray" if cm[i, j] > thresh else "black")

        plt.subplots_adjust(bottom=0.15)
        plt.ylabel('True label')
        plt.xlabel('Predicted label')
        plt.savefig(tmpdir + _id + '/confusion_matrix_' + _id + '.png')
        plt.close()


def plot_shap_summary_curve(tmpdir, _id, model, features, feature_names, class_names):
    """
    Plot Summary Curve for Classification models
    Parameters
    ----------
    tmpdir: string
        Temporary directory for saving experiment results
    _id: string
        Experiment ID in PennAI
    model: scikit-learn estimator
        A fitted scikit-learn model
    features: np.darray/pd.DataFrame
        Features in training dataset
    feature_names: np.array
        List of feature names
    class_names: list
        List of class names
    """

    #Ensure that images are saved properly
    rcParams.update({'figure.autolayout': True})
    #SHAP value calculation raises error if dtype is non-numeric
    features = np.array(features).astype('float64')
    #Determine model name for sklearn-based models
    model_name = type(model).__name__

    #Select explainer and set shap values
    if model_name in [ 'DecisionTreeClassifier', 'RandomForestClassifier' ]:
        explainer = shap.TreeExplainer(model)
        shap_values = explainer.shap_values(features)
        num_samples = -1

    elif model_name ==  'GradientBoostingClassifier' and len(class_names) == 2:
        #Gradient Boosting Tree Explainer is only supported for Binary Classification
        explainer = shap.TreeExplainer(model)
        shap_values = explainer.shap_values(features)
        num_samples= -1

    elif 'SVC' in model_name:
        #Handle special case for SVC (probability=False)
        return

    else:
        # KernelExplainer
        #Sample 50 examples for computational speedup
        max_num_samples = 50
        num_samples = min(max_num_samples, len(features))
        sampled_row_indices = np.random.choice(features.shape[0], size=num_samples, replace=False)
        features = features[sampled_row_indices]
        explainer = shap.KernelExplainer(model.predict_proba, features)
        #l1_reg not set to 'auto' to subside warnings
        shap_values = explainer.shap_values(features, l1_reg= 'num_features(10)')


    # Handle the case of multi-class SHAP outputs
    if isinstance(shap_values, list):
        for i,class_name in enumerate(class_names):
            plt.figure()
            shap.summary_plot(shap_values[i], features, feature_names=feature_names, show=False)
            save_path = tmpdir + _id + '/shap_summary_curve' + _id + '_' + str(class_name) + '_.png'
            plt.savefig(save_path)
            plt.close()
    else:
        plt.figure()
        shap.summary_plot(shap_values, features, feature_names=feature_names, show=False)
        save_path = tmpdir + _id + '/shap_summary_curve' + _id + '_0_.png'
        plt.savefig(save_path)
        plt.close()

    # Summary stats
    shap_summary_dict = {
        'shap_explainer': explainer.__class__.__name__,
        'shap_num_samples': num_samples,
        #'shap_values': shap_values
    }

    save_json_fmt(outdir=tmpdir, _id=_id,
                  fname="shap_summary.json", content=shap_summary_dict)

# After switching to dynamic charts, possibly disable outputting graphs
# from this function
def plot_roc_curve(tmpdir, _id, X, y, cv_scores, figure_export):
    """
    Plot ROC Curve.
    Parameters
    ----------
    tmpdir: string
        Temporary directory for saving experiment results
    _id: string
        Experiment ID in PennAI
    X: np.darray/pd.DataFrame
        Features in training dataset
    y: np.darray/pd.DataFrame
        Target in training dataset
    cv_scores: dictionary
        Return from sklearn.model_selection.cross_validate
    figure_export: boolean
        If true, then export roc curve plot
    Returns
    -------
    None
    """
    from scipy import interp
    from scipy.stats import sem, t
    cv = StratifiedKFold(n_splits=10)
    tprs = []
    aucs = []
    mean_fpr = np.linspace(0, 1, 100)

    # print(cv_scores['train_roc_auc'])
    for cv_split, est in zip(cv.split(X, y), cv_scores['estimator']):
        train, test = cv_split
        try:
            probas_ = est.predict_proba(X[test])[:, 1]
        except AttributeError:
            probas_ = est.decision_function(X[test])
        #print(SCORERS['roc_auc'](est, X[train], y[train]))
        # Compute ROC curve and area the curve

        classes_encoded = np.array(
            [list(est.classes_).index(c)
             for c in y[test]], dtype=np.int
        )
        fpr, tpr, thresholds = roc_curve(classes_encoded, probas_)
        tprs.append(interp(mean_fpr, fpr, tpr))
        tprs[-1][0] = 0.0
        roc_auc = auc(fpr, tpr)
        aucs.append(roc_auc)
        if figure_export:
            plt.plot(fpr, tpr, lw=1, alpha=0.3)

    mean_tpr = np.mean(tprs, axis=0)
    mean_tpr[-1] = 1.0
    mean_auc = auc(mean_fpr, mean_tpr)
    std_auc = np.std(aucs)
    std_err = sem(tprs, axis=0)
    h = std_err * t.ppf(1.95 / 2, len(mean_tpr) - 1)
    tprs_upper = np.minimum(mean_tpr + h, 1)
    tprs_lower = np.maximum(mean_tpr - h, 0)

    if figure_export:
        plt.plot([0, 1], [0, 1], linestyle='--', lw=2, color='r',
                 label='Chance', alpha=.8)
        plt.plot(
            mean_fpr,
            mean_tpr,
            color='b',
            label=r'Mean ROC (AUC = %0.2f $\pm$ %0.2f)' %
            (mean_auc,
             std_auc),
            lw=2,
            alpha=.8)
        plt.fill_between(
            mean_fpr,
            tprs_lower,
            tprs_upper,
            color='grey',
            alpha=.2,
            label=r'95% Confidence Interval')
        plt.xlim([-0.05, 1.05])
        plt.ylim([-0.05, 1.05])
        plt.xlabel('False Positive Rate')
        plt.ylabel('True Positive Rate')
        plt.title('ROC curve')
        plt.legend(loc="lower right")
        plt.savefig(tmpdir + _id + '/roc_curve_' + _id + '.png')
        plt.close()
    roc_curve_dict = {
        'fpr': mean_fpr.tolist(),
        'tpr': mean_tpr.tolist(),
        'roc_auc_score': mean_auc
    }
    save_json_fmt(outdir=tmpdir, _id=_id,
                  fname="roc_curve.json", content=roc_curve_dict)


def plot_imp_score(tmpdir, _id, coefs, feature_names, imp_score_type):
    """Plot importance scores for features.
    Parameters
    ----------
    tmpdir: string
        Temporary directory for saving experiment results
    _id: string
        Experiment ID in PennAI
    coefs: array
        Feature importance scores
    feature_names: np.array
        List of feature names
    imp_score_type: string
        Importance score type

    Returns
    -------
    top_features: list
        Top features with high importance score
    indices: ndarray
        Array of indices of top important features

    """
    # plot bar charts for top important features
    num_bar = min(max_bar_num, len(coefs))
    indices = np.argsort(coefs)[-num_bar:]
    h = plt.figure()
    plt.title(imp_score_type)
    plt.barh(range(num_bar), coefs[indices], color="r", align="center")
    top_features = list(feature_names[indices])
    plt.yticks(range(num_bar), feature_names[indices])
    plt.ylim([-1, num_bar])
    h.tight_layout()
    plt.savefig(tmpdir + _id + '/imp_score_' + _id + '.png')
    plt.close()
    return top_features, indices


def plot_dot_plot(tmpdir, _id, features,
                  target,
                  top_features_name,
                  indices,
                  random_state,
                  mode):
    """Make dot plot for based on decision tree.

    Parameters
    ----------
    tmpdir: string
        Temporary directory for saving experiment results
    _id: string
        Experiment ID in PennAI
    features: np.darray/pd.DataFrame
        Features in training dataset
    target: np.darray/pd.DataFrame
        Target in training dataset
    top_features: list
        Top feature_names
    indices: ndarray
        Array of indices of top important features
    random_state: int
        Random seed for permuation importances
    mode:  string
        'classification': Run classification analysis
        'regression': Run regression analysis

    Returns
    -------
    dtree_train_score, float
        Test score from fitting decision tree on top important feat'

    """
    # plot bar charts for top important features
    import pydot
    from sklearn.tree import export_graphviz

    top_features = features[:, indices]
    if mode == 'classification':
        from sklearn.tree import DecisionTreeClassifier
        dtree = DecisionTreeClassifier(random_state=random_state,
                                       max_depth=DT_MAX_DEPTH)
        scoring = SCORERS['balanced_accuracy']
    else:
        from sklearn.tree import DecisionTreeRegressor
        dtree = DecisionTreeRegressor(random_state=random_state,
                                      max_depth=DT_MAX_DEPTH)
        scoring = SCORERS["neg_mean_squared_error"]

    dtree.fit(top_features, target)
    dtree_train_score = scoring(
        dtree, top_features, target)
    dot_file = '{0}{1}/dtree_{1}.dot'.format(tmpdir, _id)
    png_file = '{0}{1}/dtree_{1}.png'.format(tmpdir, _id)
    class_names = None
    if mode == 'classification':
        class_names = [str(i) for i in dtree.classes_]
    export_graphviz(dtree, out_file=dot_file,
                    feature_names=top_features_name,
                    class_names=class_names,
                    filled=True, rounded=True,
                    special_characters=True)
    (graph,) = pydot.graph_from_dot_file(dot_file)
    graph.write_png(png_file)
    return dtree_train_score


def plot_cv_pred(tmpdir, _id, X, y, cv_scores):
    """
    Plot Cross-Validated Predictions and Residuals.
    Parameters
    ----------
    tmpdir: string
        Temporary directory for saving experiment results
    _id: string
        Experiment ID in PennAI
    X: np.darray/pd.DataFrame
        Features in training dataset
    y: np.darray/pd.DataFrame
        Target in training dataset
    cv_scores: dictionary
        Return from sklearn.model_selection.cross_validate
    Returns
    -------
    None
    """
    pred_y = np.empty(y.shape)
    resi_y = np.empty(y.shape)
    cv = KFold(n_splits=10)
    for cv_split, est in zip(cv.split(X, y), cv_scores['estimator']):
        train, test = cv_split
        pred_y[test] = est.predict(X[test])
        resi_y[test] = pred_y[test] - y[test]

    fig, ax = plt.subplots(figsize=(8, 6), dpi=300)
    ax.set_title("10-Fold Cross-Validated Predictions")
    ax.scatter(y, pred_y, edgecolors=(0, 0, 0))
    ax.set_xlabel('Observed Values')
    ax.set_ylabel('Predicted Values')
    x = np.linspace(*ax.get_xlim())
    ax.plot(x, x,
            color="red",
            linestyle='dashed')
    plt.tight_layout()
    plt.savefig(tmpdir + _id + '/reg_cv_pred_' + _id + '.png')
    plt.close()

    fig, ax = plt.subplots(1, 1, figsize=(8, 6), dpi=300)
    ax.set_title("10-Fold Cross-Validated Residuals")
    ax.scatter(pred_y, resi_y, edgecolors=(0, 0, 0))
    ax.set_xlabel('Predicted Values')
    ax.set_ylabel('Residuals')
    ax.axhline(y=0.0,
                  color="red",
                  linestyle='dashed')
    plt.tight_layout()
    plt.savefig(tmpdir + _id + '/reg_cv_resi_' + _id + '.png')
    plt.close()
    fig, ax = plt.subplots(1, 1, figsize=(8, 6), dpi=300)
    # add q-q plot for normalized CV residuals
    from scipy.stats import probplot
    z = (resi_y - np.mean(resi_y)) / np.std(resi_y)
    series1 = probplot(z, dist="norm")
    ax.scatter(series1[0][0], series1[0][1], edgecolors=(0, 0, 0))
    ax.set_title("Q-Q Plot for Normalized Residuals")
    x = np.linspace(*ax.get_xlim())
    ax.plot(x, x,
               color="red",
               linestyle='dashed')
    ax.set_xlabel('Theoretical Quantiles')
    ax.set_ylabel('Ordered Normalized Residuals')
    plt.tight_layout()
    plt.savefig(tmpdir + _id + '/reg_cv_qq_' + _id + '.png')
    plt.close()


def export_model(tmpdir,
                 _id,
                 model,
                 filename,
                 target_name,
                 mode="classification",
                 random_state=42):
    """export model as a pickle file and generate a scripts for using the pickled model.

    Parameters
    ----------
    tmpdir: string
        Temporary directory for saving experiment results
    _id: string
        Experiment ID in PennAI
    model: scikit-learn estimator
        A fitted scikit-learn model
    filename: string
        File name of input dataset
    target_name: string
        Target name in input data
    mode:  string
        'classification': Run classification analysis
        'regression': Run regression analysis
    random_state: int
        Random seed in model

    Returns
    -------
    None
    """
    pickle_file_name = 'model_{}.pkl'.format(_id)
    pickle_file = '{0}{1}/model_{1}.pkl'.format(tmpdir, _id)

    pickle_model = {}
    pickle_model['model'] = model
    pickle_model['data_filename'] = filename
    joblib.dump(pickle_model, pickle_file)
    pipeline_text1, pipeline_text2 = generate_export_codes(
        pickle_file_name, model, filename, target_name, mode, random_state)
    export_scripts = open(
        "{0}{1}/scripts_reproduce_{1}.py".format(tmpdir, _id), "w")
    export_scripts.write(pipeline_text1)
    export_scripts.close()
    export_scripts = open(
        "{0}{1}/scripts_application_{1}.py".format(tmpdir, _id), "w")
    export_scripts.write(pipeline_text2)
    export_scripts.close()


def generate_export_codes(
        pickle_file_name,
        model,
        filename,
        target_name,
        mode="classification",
        random_state=42):
    """Generate all library import calls for use in stand alone python scripts.
    
    Parameters
    ----------
    pickle_file_name: string
        Pickle file name for a fitted scikit-learn estimator
    model: scikit-learn estimator
        A fitted scikit-learn model
    filename: string
        File name of input dataset
    target_name: string
        Target name in input data
    mode:  string
        'classification': Run classification analysis
        'regression': Run regression analysis
    random_state: int
        Random seed in model
    Returns
    -------
    pipeline_text: String
       The Python scripts for applying the current
       optimized pipeline in stand-alone python environment
    """
    if mode == 'classification':
        fold = "StratifiedKFold"
    elif mode == 'regression':
        fold = "KFold"
    exported_codes_1 = """# Python version: {python_version}
# Results were generated with numpy v{numpy_version},
# pandas v{pandas_version} and scikit-learn v{skl_version}.
# random seed = {random_state}
# Training dataset filename = {dataset}
# Pickle filename = {pickle_file_name}
# Model in the pickle file: {model}
import numpy as np
import pandas as pd
from sklearn.externals import joblib
from sklearn.utils import check_X_y
from sklearn.metrics import make_scorer, confusion_matrix
from sklearn.model_selection import cross_validate, {fold}

# NOTE: Edit variables below with appropriate values
# path to your pickle file, below is the downloaded pickle file
pickle_file = '{pickle_file_name}'
# file path to the dataset
dataset = '{dataset}'
# target column name
target_column = '{target_name}'
seed = {random_state}

# load fitted model
pickle_model = joblib.load(pickle_file)
model = pickle_model['model']

# read input data
input_data = pd.read_csv(dataset, sep=None, engine='python')
""".format(
        python_version=version.replace('\n', ''),
        numpy_version=np.__version__,
        pandas_version=pd.__version__,
        skl_version=skl_version,
        dataset=",".join(filename),
        target_name=target_name,
        pickle_file_name=pickle_file_name,
        random_state=random_state,
        model=str(model).replace('\n', '\n#'),
        fold=fold
    )
    exported_codes_2 = exported_codes_1
    if mode == "classification":
        exported_codes_1 += """
# Balanced accuracy below was described in [Urbanowicz2015]:
# the average of sensitivity and specificity is computed for each class
# and then averaged over total number of classes.
# It is NOT the same as sklearn.metrics.balanced_accuracy_score,
# which is defined as the average of recall obtained on each class.
def balanced_accuracy(y_true, y_pred):
    all_classes = list(set(np.append(y_true, y_pred)))
    all_class_accuracies = []
    for this_class in all_classes:
        this_class_sensitivity = 0.
        this_class_specificity = 0.
        if sum(y_true == this_class) != 0:
            this_class_sensitivity = \\
                float(sum((y_pred == this_class) & (y_true == this_class))) /\\
                float(sum((y_true == this_class)))
            this_class_specificity = \\
                float(sum((y_pred != this_class) & (y_true != this_class))) /\\
                float(sum((y_true != this_class)))
        this_class_accuracy = (this_class_sensitivity +
                               this_class_specificity) / 2.
        all_class_accuracies.append(this_class_accuracy)
    return np.mean(all_class_accuracies)

# reproducing training score and testing score from PennAI
features = input_data.drop(target_column, axis=1).values
target = input_data[target_column].values
# Checking dataset
features, target = check_X_y(features,
                             target,
                             dtype=None,
                             order="C",
                             force_all_finite=True)

scorer = make_scorer(balanced_accuracy)

# reproducing balanced accuracy scores
# computing cross-validated metrics
cv = StratifiedKFold(n_splits=10)
cv_scores = cross_validate(
    estimator=model,
    X=features,
    y=target,
    scoring=scorer,
    cv=cv,
    return_train_score=True,
    return_estimator=True
)
train_score = cv_scores['train_score'].mean()
test_score = cv_scores['test_score'].mean()

print("Training score: ", train_score)
print("Testing score: ", test_score)

# reproducing confusion matrix
pred_cv_target = np.empty(target.shape)
for cv_split, est in zip(cv.split(features, target), cv_scores['estimator']):
    train, test = cv_split
    pred_cv_target[test] = est.predict(features[test])
cnf_matrix = confusion_matrix(
    target, pred_cv_target, labels=model.classes_)
print("Confusion Matrix:", cnf_matrix)
"""
    elif mode == "regression":
        exported_codes_1 += """
# reproducing training score and testing score from PennAI
features = input_data.drop(target_column, axis=1).values
target = input_data[target_column].values
# Checking dataset
features, target = check_X_y(features,
                             target,
                             dtype=None,
                             order="C",
                             force_all_finite=True)

# reproducing r2 scores
# computing cross-validated metrics
cv_scores = cross_validate(
    estimator=model,
    X=features,
    y=target,
    scoring='r2',
    cv=10,
    return_train_score=True,
    return_estimator=True
)
train_score = cv_scores['train_score'].mean()
test_score = cv_scores['test_score'].mean()

print("Training score: ", train_score)
print("Testing score: ", test_score)
"""

    exported_codes_2 += """
# Application 1: cross validation of fitted model on a new dataset
testing_features = input_data.drop(target_column, axis=1).values
testing_target = input_data[target_column].values
# Get holdout score for fitted model
print("Holdout score: ", end="")
print(model.score(testing_features, testing_target))


# Application 2: predict outcome by fitted model
# In this application, the input dataset may not include target column
# Please comment this line below if there is no target column in input dataset
input_data.drop(target_column, axis=1, inplace=True)
predict_target = model.predict(input_data.values)
"""

    return exported_codes_1, exported_codes_2
