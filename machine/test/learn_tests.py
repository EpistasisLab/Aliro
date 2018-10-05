import os
import sys
# mock os.environ in unittest
os.environ['LAB_HOST'] = 'lab'
os.environ['LAB_PORT'] = '5080'
os.environ['PROJECT_ROOT'] = '.'
from sklearn.datasets import load_digits, load_boston
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor
from tempfile import mkdtemp
from shutil import rmtree
from machine.learn.skl_utils import balanced_accuracy, generate_results, generate_export_codes, SCORERS, setup_model_params
from machine.learn.io_utils import Experiment, get_projects, get_input_data, get_type
from machine.learn.driver import main
import json
from sklearn.externals import joblib
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
import pandas as pd
import numpy as np
import requests
import unittest
from unittest import mock
from nose.tools import assert_raises
from io import StringIO
import re

import warnings


NOT_WHITESPACE = re.compile(r'[^\s]')

def decode_stacked(document, pos=0, decoder=json.JSONDecoder()):
    while True:
        match = NOT_WHITESPACE.search(document, pos)
        if not match:
            return
        pos = match.start()

        try:
            obj, pos = decoder.raw_decode(document, pos)
        except json.JSONDecodeError:
            # do something sensible if there's some error
            raise
        yield obj

# test input file for multiclass classification
test_clf_input = "machine/test/iris_full.tsv"
test_clf_input_df = pd.read_csv(test_clf_input, sep='\t')
# test input file for binary classification
test_clf_input2 = "machine/test/iris_binary.tsv"
test_clf_input_df2 = pd.read_csv(test_clf_input, sep='\t')
# test inputfile for regression
test_reg_input = "machine/test/1027_ESL.tsv"
test_reg_input_df = pd.read_csv(test_reg_input, sep='\t')

test_clf = DecisionTreeClassifier()
test_reg = DecisionTreeRegressor()
# projects information
projects_json = "dockers/dbmongo/files/projects.json"
json_file = open(projects_json, encoding="utf8")
projects_json_data = [obj for obj in decode_stacked(json_file.read())]
# get all algorithms' name from projects_json_data
algorithm_names = []
for obj in projects_json_data:
    algorithm_names.append(obj["name"])

# This method will be used by the mock to replace requests.get
def mocked_requests_get(*args, **kwargs):
    class MockResponse:
        def __init__(self, json_data, status_code):
            self.json_data = json_data
            self.status_code = status_code
            self.text = json_data

        def json(self):
            return self.json_data

    if args[0] == 'http://lab:5080/api/v1/experiments/test_id':
        return MockResponse(json.dumps({"_dataset_id": "test_dataset_id"}), 200)
    elif args[0] == 'http://lab:5080/api/v1/experiments/test_id2':
        return MockResponse(json.dumps({"_dataset_id": "test_dataset_id2"}), 200)
    elif args[0] == 'http://lab:5080/api/v1/datasets/test_dataset_id':
        return MockResponse(json.dumps({"files": [{'_id': 'test_file_id', 'filename': 'test_clf_input'}]}), 200)
    elif args[0] == 'http://lab:5080/api/v1/datasets/test_dataset_id2':
        return MockResponse(json.dumps({"files": [{'_id': 'test_file_id', 'filename': 'test_clf_input'}, {'_id': 'test_file_id2', 'filename': 'test_reg_input'}]}), 200)
    elif args[0] == 'http://lab:5080/api/v1/files/test_file_id':
        return MockResponse(open(test_clf_input2).read(), 200)
    elif args[0] == 'http://lab:5080/api/v1/files/test_file_id2':
        return MockResponse(open(test_reg_input).read(), 200)
    elif args[0] == 'http://lab:5080/api/v1/projects':
        return MockResponse(json.dumps(projects_json_data), 200)
    else:
        return MockResponse(None, 404)


class APITESTCLASS(unittest.TestCase):
    # We patch 'requests.get' with our own method. The mock object is passed in to our test case method.
    @mock.patch('requests.get', side_effect=mocked_requests_get)
    def test_get_input_data(self, mock_get):
        """Test get_input_data function return one input dataset"""
        tmpdir = mkdtemp() + '/'
        _id = 'test_id'
        LAB_PORT = '5080'
        LAB_HOST = 'lab'
        # Assert requests.get calls
        input_data = get_input_data(_id, tmpdir=tmpdir)
        exp_input_data = pd.read_csv(test_clf_input2, sep='\t')
        rmtree(tmpdir)
        assert exp_input_data.equals(input_data)


    @mock.patch('requests.get', side_effect=mocked_requests_get)
    def test_get_input_data_2(self, mock_get):
        """Test get_input_data function return a list of input dataset for cross-validataion"""
        tmpdir = mkdtemp() + '/'
        _id = 'test_id2'
        LAB_PORT = '5080'
        LAB_HOST = 'lab'
        # Assert requests.get calls
        input_data = get_input_data(_id, tmpdir=tmpdir)
        exp_input_data1 = pd.read_csv(test_clf_input2, sep='\t')
        exp_input_data2 = pd.read_csv(test_reg_input, sep='\t')
        rmtree(tmpdir)
        assert exp_input_data1.equals(input_data[0])
        assert exp_input_data2.equals(input_data[1])


    @mock.patch('requests.get', side_effect=mocked_requests_get)
    def test_get_projects(self, mock_get):
        """Test get_params return correct projects' info."""
        projects = get_projects()

        assert projects == projects_json_data


    @mock.patch('requests.get', side_effect=mocked_requests_get)
    def test_Experiment_init(self, mock_get):
        """Test Experiment class has correct attribute."""

        args = {
            "method": "SVC",
            "_id": "test_id",
            "kernel": "rbf",
            "tol": 0.0001,
            "C": 1
            }
        exp = Experiment(args=args, basedir='.')

        assert exp.args == args
        assert exp.method_name == "SVC"
        assert exp.basedir == '.'
        assert exp.tmpdir == './machine/learn/{}/tmp/'.format('SVC')


    @mock.patch('requests.get', side_effect=mocked_requests_get)
    def test_main_1(self, mock_get):
        """Test main function in each machine learning in projects.json can produce expected outputs."""

        for obj in projects_json_data:
            algorithm_name = obj["name"]
            schema = obj["schema"]
            args = {}
            _id = "test_id"
            args['_id'] = _id
            args["method"] = algorithm_name
            for param_name in schema.keys():
                default_value = schema[param_name]["default"]
                param_type = schema[param_name]["type"]
                conv_func = get_type(param_type)
                conv_default_value = conv_func(default_value)
                args[param_name] = conv_default_value

            outdir = "./machine/learn/{}/tmp/test_id".format(algorithm_name)

            print(algorithm_name, args)
            main(args)
            print(outdir)

            value_json = '{}/value.json'.format(outdir)
            assert os.path.isfile(value_json)
            with open(value_json, 'r') as f:
                value = json.load(f)
            assert value['_scores']['train_score']
            assert os.path.isfile('{}/prediction_values.json'.format(outdir))
            assert os.path.isfile('{}/feature_importances.json'.format(outdir))
            assert os.path.isfile('{}/confusion_matrix_{}.png'.format(outdir, _id))
            assert os.path.isfile('{}/roc_curve{}.png'.format(outdir, _id)) # only has roc for binary outcome
            assert os.path.isfile('{}/imp_score{}.png'.format(outdir, _id))
            assert os.path.isfile('{}/scripts_{}.py'.format(outdir, _id))
            # test pickle file
            pickle_file = '{}/model_{}.pkl'.format(outdir, _id)
            assert os.path.isfile(pickle_file)


def test_balanced_accuracy():
    """Assert that the balanced_accuracy in TPOT returns correct accuracy."""
    y_true = np.array([1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4])
    y_pred1 = np.array([1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4])
    y_pred2 = np.array([3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4])
    accuracy_score1 = balanced_accuracy(y_true, y_pred1)
    accuracy_score2 = balanced_accuracy(y_true, y_pred2)
    assert np.allclose(accuracy_score1, 1.0)
    assert np.allclose(accuracy_score2, 0.833333333333333)


def test_generate_results_1():
    """Test generate results can produce expected outputs in classification mode."""
    tmpdir = mkdtemp() + '/'
    _id = 'test_id'
    outdir = tmpdir + _id
    os.mkdir(outdir)
    generate_results(model=test_clf, input_data=test_clf_input_df,
                    tmpdir=tmpdir, _id=_id, target_name='class', figure_export=True)

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
    """Test generate results can produce expected outputs in classification mode without figure_export=False"""
    tmpdir = mkdtemp() + '/'
    _id = 'test_id'
    outdir = tmpdir + _id
    os.mkdir(outdir)
    generate_results(model=test_clf, input_data=test_clf_input_df,
                    tmpdir=tmpdir, _id=_id, target_name='class', figure_export=False, random_state=42)

    input_data = pd.read_csv(
        test_clf_input, sep='\t')
    target_name='class'
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
    """Test generate results can produce expected outputs in regression mode"""
    tmpdir = mkdtemp() + '/'
    _id = 'test_id'
    outdir = tmpdir + _id
    os.mkdir(outdir)
    generate_results(model=test_reg, input_data=test_reg_input_df,
                    tmpdir=tmpdir, _id=_id, target_name='class',
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
    """Test generate results can produce expected outputs in regression mode without figure_export=False"""
    tmpdir = mkdtemp() + '/'
    _id = 'test_id'
    outdir = tmpdir + _id
    os.mkdir(outdir)
    generate_results(model=test_reg, input_data=test_reg_input_df,
                    tmpdir=tmpdir, _id=_id, target_name='class',
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


def test_generate_results_5():
    """Test generate results can raise a error when input dataset is in invalid format."""
    tmpdir = mkdtemp() + '/'
    _id = 'test_id'
    outdir = tmpdir + _id
    os.mkdir(outdir)
    # data with NaN
    test_reg_input_df_nan = test_reg_input_df
    test_reg_input_df_nan.iloc[1,1] = np.nan
    assert_raises(ValueError, generate_results, test_reg, test_reg_input_df_nan,
                    tmpdir, _id, 'class',
                    'regression', False)
    # data with infinity value
    test_reg_input_df_inf = test_reg_input_df
    test_reg_input_df_inf.iloc[1,1] = np.inf
    assert_raises(ValueError, generate_results, test_reg, test_reg_input_df_inf,
                    tmpdir, _id, 'class',
                    'regression', False)


def test_setup_model_params():
    """Test setup_model_params update parameter in a scikit-learn model."""
    new_model = setup_model_params(test_clf, 'random_state', 32)
    new_model = setup_model_params(new_model, 'class_weight', 'balanced')
    params = new_model.get_params()

    assert params['random_state'] == 32
    assert params['class_weight'] == 'balanced'


def test_generate_export_codes():
    """Test generate_export_codes can generate scripts as execpted."""
    input_data = pd.read_csv(
        test_clf_input, sep='\t')
    target_name='class'
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
