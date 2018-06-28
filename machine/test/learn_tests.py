import os
from sklearn.datasets import load_digits, load_boston
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor
from tempfile import mkdtemp
from shutil import rmtree
from learn.skl_utils import generate_results, generate_export_codes, SCORERS
import json
from sklearn.externals import joblib
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
import pandas as pd

# test input file for classification
test_clf_input = "tests/iris.tsv"

# test inputfile for regression
test_reg_input = "tests/1027_ESL.tsv"

test_clf = DecisionTreeClassifier(random_state=42)
test_reg = DecisionTreeRegressor(random_state=42)

def test_generate_results_1():
    """Test generate results can produce right outputs in classification mode."""
    tmpdir = mkdtemp() + '/'
    _id = 'test_id'
    outdir = tmpdir + _id
    os.mkdir(outdir)
    generate_results(model=test_clf, input_file=test_clf_input,
                    tmpdir=tmpdir, _id=_id, target_name='label:nom', figure_export=True)

    value_json = '{}/value.json'.format(outdir)
    assert os.path.isfile(value_json)
    with open(value_json, 'r') as f:
        value = json.load(f)
    assert value['_scores']['train_score'] > 0.9
    assert os.path.isfile('{}/prediction_values.json'.format(outdir))
    assert os.path.isfile('{}/feature_importances.json'.format(outdir))
    assert os.path.isfile('{}/confusion_matrix_{}.png'.format(outdir, _id))
    assert not os.path.isfile('{}/roc_curve{}.png'.format(outdir, _id)) # only has roc for binary outcome
    assert os.path.isfile('{}/imp_score{}.png'.format(outdir, _id))
    assert os.path.isfile('{}/scripts_{}.py'.format(outdir, _id))
    # test pickle file
    pickle_file = '{}/model_{}.pkl'.format(outdir, _id)
    assert os.path.isfile(pickle_file)
    rmtree(tmpdir)


def test_generate_results_2():
    """Test generate results can produce right outputs in classification mode without figure_export=False"""
    tmpdir = mkdtemp() + '/'
    _id = 'test_id'
    outdir = tmpdir + _id
    os.mkdir(outdir)
    generate_results(model=test_clf, input_file=test_clf_input,
                    tmpdir=tmpdir, _id=_id, target_name='label:nom', figure_export=False, random_state=42)

    input_data = pd.read_csv(
        test_clf_input, sep='\t')
    target_name='label:nom'
    features = input_data.drop(target_name, axis=1).values
    classes = LabelEncoder().fit_transform(input_data[target_name].values)
    training_features, testing_features, training_classes, testing_classes = \
        train_test_split(features, classes, random_state=42, stratify=input_data[target_name])

    value_json = '{}/value.json'.format(outdir)
    assert os.path.isfile(value_json)
    with open(value_json, 'r') as f:
        value = json.load(f)
    train_score = value['_scores']['train_score']
    assert train_score > 0.9
    assert os.path.isfile('{}/prediction_values.json'.format(outdir))
    assert os.path.isfile('{}/feature_importances.json'.format(outdir))
    assert not os.path.isfile('{}/confusion_matrix_{}.png'.format(outdir, _id))
    assert not os.path.isfile('{}/roc_curve{}.png'.format(outdir, _id)) # only has roc for binary outcome
    assert not os.path.isfile('{}/imp_score{}.png'.format(outdir, _id))
    assert os.path.isfile('{}/scripts_{}.py'.format(outdir, _id))
    # test pickle file
    pickle_file = '{}/model_{}.pkl'.format(outdir, _id)
    assert os.path.isfile(pickle_file)
    # test reloaded model is the same
    load_clf = joblib.load(pickle_file)
    load_clf_score = SCORERS['balanced_accuracy'](
        load_clf, training_features, training_classes)
    assert train_score == load_clf_score

    rmtree(tmpdir)


def test_generate_results_3():
    """Test generate results can produce right outputs in regression mode"""
    tmpdir = mkdtemp() + '/'
    _id = 'test_id'
    outdir = tmpdir + _id
    os.mkdir(outdir)
    generate_results(model=test_reg, input_file=test_reg_input,
                    tmpdir=tmpdir, _id=_id, target_name='target',
                    mode='regression', figure_export=True)

    value_json = '{}/value.json'.format(outdir)
    assert os.path.isfile(value_json)
    with open(value_json, 'r') as f:
        value = json.load(f)
    assert value['_scores']['r2_score'] > 0
    assert os.path.isfile('{}/prediction_values.json'.format(outdir))
    assert os.path.isfile('{}/feature_importances.json'.format(outdir))
    assert not os.path.isfile('{}/confusion_matrix_{}.png'.format(outdir, _id))
    assert not os.path.isfile('{}/roc_curve{}.png'.format(outdir, _id)) # only has roc for binary outcome
    assert os.path.isfile('{}/imp_score{}.png'.format(outdir, _id))
    assert os.path.isfile('{}/scripts_{}.py'.format(outdir, _id))
    # test pickle file
    pickle_file = '{}/model_{}.pkl'.format(outdir, _id)
    assert os.path.isfile(pickle_file)
    rmtree(tmpdir)


def test_generate_results_4():
    """Test generate results can produce right outputs in regression mode without figure_export=False"""
    tmpdir = mkdtemp() + '/'
    _id = 'test_id'
    outdir = tmpdir + _id
    os.mkdir(outdir)
    generate_results(model=test_reg, input_file=test_reg_input,
                    tmpdir=tmpdir, _id=_id, target_name='target',
                    mode='regression', figure_export=False)

    value_json = '{}/value.json'.format(outdir)
    assert os.path.isfile(value_json)
    with open(value_json, 'r') as f:
        value = json.load(f)
    assert value['_scores']['r2_score'] > 0
    assert os.path.isfile('{}/prediction_values.json'.format(outdir))
    assert os.path.isfile('{}/feature_importances.json'.format(outdir))
    assert not os.path.isfile('{}/confusion_matrix_{}.png'.format(outdir, _id))
    assert not os.path.isfile('{}/roc_curve{}.png'.format(outdir, _id)) # only has roc for binary outcome
    assert not os.path.isfile('{}/imp_score{}.png'.format(outdir, _id))
    assert os.path.isfile('{}/scripts_{}.py'.format(outdir, _id))
    # test pickle file
    pickle_file = '{}/model_{}.pkl'.format(outdir, _id)
    assert os.path.isfile(pickle_file)
    rmtree(tmpdir)


def test_generate_export_codes():
    """Test generate_export_codes can generate scripts as execpted."""
    input_data = pd.read_csv(
        test_clf_input, sep='\t')
    target_name='label:nom'
    features = input_data.drop(target_name, axis=1).values
    classes = LabelEncoder().fit_transform(input_data[target_name].values)

    test_clf = DecisionTreeClassifier(random_state=42)
    test_clf.fit(features, classes)
    test_clf_scoe = test_clf.score(features, classes)

    tmpdir = mkdtemp() + '/'
    pickle_file = tmpdir + '/test.plk'
    # test dump and load fitted model
    joblib.dump(test_clf, pickle_file)
    load_clf = joblib.load(pickle_file)
    load_clf_score = load_clf.score(features, classes)
    assert test_clf_scoe == load_clf_score

    pipeline_text = generate_export_codes(pickle_file)

    expected_text = """import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split

# NOTE: Please change 'PATH/TO/DATA/FILE' and 'COLUMN_SEPARATOR' for testing data or data without target outcome
input_data = pd.read_csv('PATH/TO/DATA/FILE', sep='COLUMN_SEPARATOR', dtype=np.float64)

# load fitted model
model = joblib.load({})
# Applcation 1: cross validation of fitted model
testing_features = input_data.drop('TARGET', axis=1).values
testing_target = input_data['TARGET'].values
# Get holdout score for fitted model
print(model.score(testing_features, testing_target))

# Applcation 2: predict outcome by fitted model
predict_target = model.predict(input_data.values)
""".format(pickle_file)
    assert pipeline_text==expected_text
    rmtree(tmpdir)
