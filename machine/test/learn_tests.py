import os
import sys
# mock os.environ in unittest
os.environ['LAB_HOST'] = 'lab'
os.environ['LAB_PORT'] = '5080'
os.environ['PROJECT_ROOT'] = '.'
os.environ['RANDOM_SEED'] = '42'
from sklearn.datasets import load_digits, load_boston
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from tempfile import mkdtemp
from shutil import rmtree
Path = "machine/learn"
if Path not in sys.path:
    sys.path.insert(0, Path)
from skl_utils import balanced_accuracy, generate_results, generate_export_codes, SCORERS, setup_model_params
from io_utils import Experiment, get_projects, get_input_data, get_type
from driver import main
import json
from sklearn.externals import joblib
from sklearn.model_selection import train_test_split
import pandas as pd
import numpy as np
from sklearn import __version__ as skl_version
import requests
import unittest
from unittest import mock
from nose.tools import assert_raises, assert_equal
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
test_clf_input_df2 = pd.read_csv(test_clf_input2, sep='\t')
# test input file with categorical feature
test_clf_input3 = "machine/test/test_categories.tsv"
test_clf_input_df3 = pd.read_csv(test_clf_input3, sep='\t')
# test inputfile for regression
test_reg_input = "machine/test/1027_ESL.tsv"
test_reg_input_df = pd.read_csv(test_reg_input, sep='\t')

test_clf = DecisionTreeClassifier()
test_rfc = RandomForestClassifier()
test_gbc = GradientBoostingClassifier()
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
    elif args[0] == 'http://lab:5080/api/v1/experiments/test_id3': # different target names
        return MockResponse(json.dumps({"_dataset_id": "test_dataset_id3"}), 200)
    elif args[0] == 'http://lab:5080/api/v1/experiments/test_id4': # no target name
        return MockResponse(json.dumps({"_dataset_id": "test_dataset_id4"}), 200)
    elif args[0] == 'http://lab:5080/api/v1/experiments/test_id5': # invalid target name
        return MockResponse(json.dumps({"_dataset_id": "test_dataset_id5"}), 200)
    elif args[0] == 'http://lab:5080/api/v1/experiments/test_id6': # with categorical features
        return MockResponse(json.dumps({"_dataset_id": "test_dataset_id6"}), 200)
    elif args[0] == 'http://lab:5080/api/v1/experiments/test_id7': # with categorical features
        return MockResponse(json.dumps({"_dataset_id": "test_dataset_id7"}), 200)
    elif args[0] == 'http://lab:5080/api/v1/datasets/test_dataset_id':
        return MockResponse(json.dumps({"files": [{"_id":"test_file_id", "dependent_col": "class", "filename": "test_clf_input"}]}), 200)
    elif args[0] == 'http://lab:5080/api/v1/datasets/test_dataset_id2':
        return MockResponse(json.dumps({"files": [{"_id":"test_file_id", "dependent_col": "class", "filename": "test_clf_input"},
                                                {"_id":"test_file_id2", "dependent_col": "class", "filename": "test_reg_input"}]}), 200)
    elif args[0] == 'http://lab:5080/api/v1/datasets/test_dataset_id3':
        return MockResponse(json.dumps({"files": [{"_id":"test_file_id", "dependent_col": "class", "filename": "test_clf_input"},
                                                {"_id":"test_file_id2", "dependent_col": "target", "filename": "test_reg_input"}]}), 200)
    elif args[0] == 'http://lab:5080/api/v1/datasets/test_dataset_id4':
        return MockResponse(json.dumps({"files": [{"_id":"test_file_id", "filename": "test_clf_input"}]}), 200)
    elif args[0] == 'http://lab:5080/api/v1/datasets/test_dataset_id5':
        return MockResponse(json.dumps({"files": [{"_id":"test_file_id", "dependent_col": "NA_class","filename": "test_clf_input"}]}), 200)
    elif args[0] == 'http://lab:5080/api/v1/datasets/test_dataset_id6':
        return MockResponse(json.dumps({"files": [
                            {"_id":"test_file_id3",
                            "dependent_col": "class",
                            "categorical_features":  ["test_categorical_feature_1",
                                            "test_categorical_feature_2"],
                            "ordinal_features":  {"test_ordinal_feature": [1, 3, 5, 7, 9]},
                            "filename": "test_clf_input3"}]}), 200)
    elif args[0] == 'http://lab:5080/api/v1/datasets/test_dataset_id7':
        return MockResponse(json.dumps({"files":
                                    [{"_id":"test_file_id4",
                                    "dependent_col": "class",
                                    "filename": "test_clf_input"}]}), 200)
    elif args[0] == 'http://lab:5080/api/v1/files/test_file_id':
        return MockResponse(open(test_clf_input2).read(), 200)
    elif args[0] == 'http://lab:5080/api/v1/files/test_file_id2':
        return MockResponse(open(test_reg_input).read(), 200)
    elif args[0] == 'http://lab:5080/api/v1/files/test_file_id3':
        return MockResponse(open(test_clf_input3).read(), 200)
    elif args[0] == 'http://lab:5080/api/v1/files/test_file_id4':
        return MockResponse(open(test_clf_input).read(), 200)
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
        input_data, data_info = get_input_data(_id, tmpdir=tmpdir)
        exp_input_data = pd.read_csv(test_clf_input2, sep='\t')
        exp_filename = 'test_clf_input'
        rmtree(tmpdir)
        assert exp_input_data.equals(input_data)
        assert data_info['filename'][0] == exp_filename
        assert data_info['target_name'] == 'class'
        assert data_info['categories'] is None
        assert data_info['ordinals'] is None


    @mock.patch('requests.get', side_effect=mocked_requests_get)
    def test_get_input_data_2(self, mock_get):
        """Test get_input_data function return a list of input dataset for cross-validataion"""
        tmpdir = mkdtemp() + '/'
        _id = 'test_id2'
        LAB_PORT = '5080'
        LAB_HOST = 'lab'
        # Assert requests.get calls
        input_data, data_info = get_input_data(_id, tmpdir=tmpdir)
        exp_input_data1 = pd.read_csv(test_clf_input2, sep='\t')
        exp_input_data2 = pd.read_csv(test_reg_input, sep='\t')
        rmtree(tmpdir)
        assert exp_input_data1.equals(input_data[0])
        assert exp_input_data2.equals(input_data[1])
        assert data_info['filename'][0] == 'test_clf_input'
        assert data_info['filename'][1] == 'test_reg_input'
        assert data_info['target_name'] == 'class'
        assert data_info['categories'] is None
        assert data_info['ordinals'] is None


    @mock.patch('requests.get', side_effect=mocked_requests_get)
    def test_get_input_data_3(self, mock_get):
        """Test get_input_data function raises RuntimeError when target names are inconsistent in two dataset files of one experiment."""
        tmpdir = mkdtemp() + '/'
        _id = 'test_id3'
        LAB_PORT = '5080'
        LAB_HOST = 'lab'
        # Assert requests.get calls
        assert_raises(RuntimeError, get_input_data, _id, tmpdir)

    @mock.patch('requests.get', side_effect=mocked_requests_get)
    def test_get_input_data_4(self, mock_get):
        """Test get_input_data function raises RuntimeError when target names are no available from API"""
        tmpdir = mkdtemp() + '/'
        _id = 'test_id4'
        LAB_PORT = '5080'
        LAB_HOST = 'lab'
        # Assert requests.get calls
        assert_raises(RuntimeError, get_input_data, _id, tmpdir)


    @mock.patch('requests.get', side_effect=mocked_requests_get)
    def test_get_input_data_5(self, mock_get):
        """Test get_input_data function raises ValueError when target names are no available in input dataset."""
        tmpdir = mkdtemp() + '/'
        _id = 'test_id5'
        LAB_PORT = '5080'
        LAB_HOST = 'lab'
        # Assert requests.get calls
        assert_raises(ValueError, get_input_data, _id, tmpdir)

    @mock.patch('requests.get', side_effect=mocked_requests_get)
    def test_get_input_data_6(self, mock_get):
        """Test get_input_data function return one input dataset with categorical and ordinal features"""
        tmpdir = mkdtemp() + '/'
        _id = 'test_id6'
        LAB_PORT = '5080'
        LAB_HOST = 'lab'
        # Assert requests.get calls
        input_data, data_info = get_input_data(_id, tmpdir=tmpdir)
        exp_input_data = pd.read_csv(test_clf_input3, sep='\t')
        exp_filename = 'test_clf_input3'
        rmtree(tmpdir)
        assert exp_input_data.equals(input_data)
        assert data_info['filename'][0] == exp_filename
        assert data_info['target_name'] == 'class'
        assert data_info['categories'] == ["test_categorical_feature_1", "test_categorical_feature_2"]
        assert list(data_info['ordinals'].keys()) == ["test_ordinal_feature"]
        assert data_info['ordinals']['test_ordinal_feature'] == [1, 3, 5, 7, 9]


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
        assert exp.tmpdir == './machine/learn/tmp/{}/'.format('SVC')


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

            outdir = "./machine/learn/tmp/{}/{}".format(algorithm_name, _id)

            print(algorithm_name, args)
            main(args)

            value_json = '{}/value.json'.format(outdir)
            assert os.path.isfile(value_json)
            with open(value_json, 'r') as f:
                value = json.load(f)
            train_score = value['_scores']['train_score']
            assert train_score
            assert os.path.isfile('{}/prediction_values.json'.format(outdir))
            assert os.path.isfile('{}/feature_importances.json'.format(outdir))
            assert os.path.isfile('{}/confusion_matrix_{}.png'.format(outdir, _id))
            assert os.path.isfile('{}/roc_curve{}.png'.format(outdir, _id)) # only has roc for binary outcome
            assert os.path.isfile('{}/imp_score{}.png'.format(outdir, _id))
            assert os.path.isfile('{}/scripts_{}.py'.format(outdir, _id))
            # test pickle file
            pickle_file = '{}/model_{}.pkl'.format(outdir, _id)
            assert os.path.isfile(pickle_file)
            input_data = pd.read_csv(test_clf_input2, sep='\t')
            target_name='class'
            features = input_data.drop(target_name, axis=1).values
            classes = input_data[target_name].values
            training_features, testing_features, training_classes, testing_classes = \
                train_test_split(features, classes, random_state=42, stratify=input_data[target_name])
            # test reloaded model is the same
            pickle_model = joblib.load(pickle_file)
            load_clf = pickle_model['model']
            load_clf_score = SCORERS['balanced_accuracy'](
                load_clf, training_features, training_classes)
            print(algorithm_name, train_score, load_clf_score)
            assert train_score == load_clf_score


    @mock.patch('requests.get', side_effect=mocked_requests_get)
    def test_main_2(self, mock_get):
        """Test main function raises RuntimeError when time limit (1 second) is reached."""

        for obj in projects_json_data:
            algorithm_name = obj["name"]
            if algorithm_name != "GradientBoostingClassifier":
                continue
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
                if param_name != 'n_estimators':
                    args[param_name] = conv_default_value
                else:
                    args[param_name] = 10000 # set n_estimators to 1000 to raise time out.
        print(algorithm_name, args)
        assert_raises(RuntimeError, main, args, 1)

    @mock.patch('requests.get', side_effect=mocked_requests_get)
    def test_main_3(self, mock_get):
        """Test main function when applying GradientBoostingClassifier on dateset with categorical features."""
        obj = next(item for item in projects_json_data if item["name"] == "GradientBoostingClassifier")
        algorithm_name = obj["name"]
        schema = obj["schema"]
        args = {}
        _id = "test_id6"
        args['_id'] = _id
        args["method"] = algorithm_name
        for param_name in schema.keys():
            default_value = schema[param_name]["default"]
            param_type = schema[param_name]["type"]
            conv_func = get_type(param_type)
            conv_default_value = conv_func(default_value)
            if param_name != 'n_estimators':
                args[param_name] = conv_default_value
            else:
                args[param_name] = 1000 # set n_estimators to 1000 to raise time out.
        print(algorithm_name, args)
        main(args)
        outdir = "./machine/learn/tmp/{}/{}".format(algorithm_name, _id)

        value_json = '{}/value.json'.format(outdir)
        assert os.path.isfile(value_json)
        with open(value_json, 'r') as f:
            value = json.load(f)
        train_score = value['_scores']['train_score']
        assert train_score
        assert os.path.isfile('{}/prediction_values.json'.format(outdir))
        assert os.path.isfile('{}/feature_importances.json'.format(outdir))
        assert os.path.isfile('{}/confusion_matrix_{}.png'.format(outdir, _id))
        assert os.path.isfile('{}/imp_score{}.png'.format(outdir, _id))
        assert os.path.isfile('{}/scripts_{}.py'.format(outdir, _id))
        # test pickle file
        pickle_file = '{}/model_{}.pkl'.format(outdir, _id)
        assert os.path.isfile(pickle_file)
        # test pickle file
        pickle_file = '{}/model_{}.pkl'.format(outdir, _id)
        assert os.path.isfile(pickle_file)
        input_data = pd.read_csv(test_clf_input3, sep='\t')
        target_name='class'
        features = input_data.drop(target_name, axis=1).values
        classes = input_data[target_name].values
        training_features, testing_features, training_classes, testing_classes = \
            train_test_split(features, classes, random_state=42, stratify=input_data[target_name])
        # test reloaded model is the same
        pickle_model = joblib.load(pickle_file)
        load_clf = pickle_model['model']
        load_clf_str = str(load_clf)
        assert not load_clf_str.count('OneHotEncoder') # not use OneHotEncoder in GradientBoostingClassifier
        load_clf_score = SCORERS['balanced_accuracy'](
            load_clf, training_features, training_classes)
        print(algorithm_name, train_score, load_clf_score)
        assert train_score == load_clf_score


    @mock.patch('requests.get', side_effect=mocked_requests_get)
    def test_main_4(self, mock_get):
        """Test main function when applying LogisticRegression on dateset with categorical features."""
        obj = next(item for item in projects_json_data if item["name"] == "LogisticRegression")
        algorithm_name = obj["name"]
        schema = obj["schema"]
        args = {}
        _id = "test_id6"
        args['_id'] = _id
        args["method"] = algorithm_name
        for param_name in schema.keys():
            default_value = schema[param_name]["default"]
            param_type = schema[param_name]["type"]
            conv_func = get_type(param_type)
            conv_default_value = conv_func(default_value)
            if param_name != 'n_estimators':
                args[param_name] = conv_default_value
            else:
                args[param_name] = 1000 # set n_estimators to 1000 to raise time out.
        print(algorithm_name, args)
        main(args)
        outdir = "./machine/learn/tmp/{}/{}".format(algorithm_name, _id)

        value_json = '{}/value.json'.format(outdir)
        assert os.path.isfile(value_json)
        with open(value_json, 'r') as f:
            value = json.load(f)
        train_score = value['_scores']['train_score']
        assert train_score
        assert os.path.isfile('{}/prediction_values.json'.format(outdir))
        assert os.path.isfile('{}/feature_importances.json'.format(outdir))
        assert os.path.isfile('{}/confusion_matrix_{}.png'.format(outdir, _id))
        assert os.path.isfile('{}/imp_score{}.png'.format(outdir, _id))
        assert os.path.isfile('{}/scripts_{}.py'.format(outdir, _id))
        # test pickle file
        pickle_file = '{}/model_{}.pkl'.format(outdir, _id)
        assert os.path.isfile(pickle_file)
        # test pickle file
        pickle_file = '{}/model_{}.pkl'.format(outdir, _id)
        assert os.path.isfile(pickle_file)
        input_data = pd.read_csv(test_clf_input3, sep='\t')
        target_name='class'
        features = input_data.drop(target_name, axis=1).values
        classes = input_data[target_name].values
        training_features, testing_features, training_classes, testing_classes = \
            train_test_split(features, classes, random_state=42, stratify=input_data[target_name])
        # test reloaded model is the same
        pickle_model = joblib.load(pickle_file)
        load_clf = pickle_model['model']
        load_clf_str = str(load_clf)
        assert load_clf_str.count('OneHotEncoder')
        load_clf_score = SCORERS['balanced_accuracy'](
            load_clf, training_features, training_classes)
        print(algorithm_name, train_score, load_clf_score)
        assert train_score == load_clf_score


    @mock.patch('requests.get', side_effect=mocked_requests_get)
    def test_main_5(self, mock_get):
        """Test main function do not export roc_curve for dataset without binary outcome. """
        obj = next(item for item in projects_json_data if item["name"] == "LogisticRegression")
        algorithm_name = obj["name"]
        schema = obj["schema"]
        args = {}
        _id = "test_id7"
        args['_id'] = _id
        args["method"] = algorithm_name
        for param_name in schema.keys():
            default_value = schema[param_name]["default"]
            param_type = schema[param_name]["type"]
            conv_func = get_type(param_type)
            conv_default_value = conv_func(default_value)
            args[param_name] = conv_default_value

        outdir = "./machine/learn/tmp/{}/{}".format(algorithm_name, _id)

        print(algorithm_name, args)
        main(args)

        value_json = '{}/value.json'.format(outdir)
        assert os.path.isfile(value_json)
        with open(value_json, 'r') as f:
            value = json.load(f)
        train_score = value['_scores']['train_score']
        assert train_score
        assert os.path.isfile('{}/prediction_values.json'.format(outdir))
        assert os.path.isfile('{}/feature_importances.json'.format(outdir))
        assert os.path.isfile('{}/confusion_matrix_{}.png'.format(outdir, _id))
        assert not os.path.isfile('{}/roc_curve{}.png'.format(outdir, _id)) # only has roc for binary outcome
        assert os.path.isfile('{}/imp_score{}.png'.format(outdir, _id))
        assert os.path.isfile('{}/scripts_{}.py'.format(outdir, _id))
        # test pickle file
        pickle_file = '{}/model_{}.pkl'.format(outdir, _id)
        assert os.path.isfile(pickle_file)
        input_data = pd.read_csv(test_clf_input, sep='\t')
        target_name='class'
        features = input_data.drop(target_name, axis=1).values
        classes = input_data[target_name].values
        training_features, testing_features, training_classes, testing_classes = \
            train_test_split(features, classes, random_state=42, stratify=input_data[target_name])
        # test reloaded model is the same
        pickle_model = joblib.load(pickle_file)
        load_clf = pickle_model['model']
        load_clf_score = SCORERS['balanced_accuracy'](
            load_clf, training_features, training_classes)
        print(algorithm_name, train_score, load_clf_score)
        assert train_score == load_clf_score

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
    classes = input_data[target_name].values
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
    pickle_model = joblib.load(pickle_file)
    load_clf = pickle_model['model']
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


def test_generate_results_6():
    """Test generate results can produce expected pickle files with RandomForestClassifier."""
    tmpdir = mkdtemp() + '/'
    _id = 'test_id'
    outdir = tmpdir + _id
    os.mkdir(outdir)
    generate_results(model=test_rfc, input_data=test_clf_input_df,
                    tmpdir=tmpdir, _id=_id, target_name='class',
                    figure_export=False, random_state=42)

    input_data = pd.read_csv(
        test_clf_input, sep='\t')
    target_name='class'
    features = input_data.drop(target_name, axis=1).values
    classes = input_data[target_name].values
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
    pickle_model = joblib.load(pickle_file)
    load_clf = pickle_model['model']
    load_clf_score = SCORERS['balanced_accuracy'](
        load_clf, training_features, training_classes)
    assert train_score == load_clf_score

    rmtree(tmpdir)


def test_generate_results_7():
    """Test generate results can produce expected pickle files with GradientBoostingClassifier."""
    tmpdir = mkdtemp() + '/'
    _id = 'test_id'
    outdir = tmpdir + _id
    os.mkdir(outdir)
    generate_results(model=test_gbc, input_data=test_clf_input_df,
                    tmpdir=tmpdir, _id=_id, target_name='class', figure_export=False, random_state=42)

    input_data = pd.read_csv(
        test_clf_input, sep='\t')
    target_name='class'
    features = input_data.drop(target_name, axis=1).values
    classes = input_data[target_name].values
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
    pickle_model = joblib.load(pickle_file)
    load_clf = pickle_model['model']
    load_clf_score = SCORERS['balanced_accuracy'](
        load_clf, training_features, training_classes)
    assert train_score == load_clf_score

    rmtree(tmpdir)


def test_generate_results_8():
    """Test generate results return 'Timeout' once the time limit is reached."""
    tmpdir = mkdtemp() + '/'
    _id = 'test_id'
    outdir = tmpdir + _id
    os.mkdir(outdir)
    test_gbc_long = GradientBoostingClassifier(n_estimators=1000)
    return_val = generate_results(model=test_gbc_long, input_data=test_clf_input_df,
                    tmpdir=tmpdir, _id=_id, target_name='class', figure_export=False, random_state=42, timeout=1)
    assert return_val == "Timeout"
    rmtree(tmpdir)


def test_generate_results_9():
    """Test generate results can produce expected outputs with a categorical feature"""
    tmpdir = mkdtemp() + '/'
    _id = 'test_id'
    outdir = tmpdir + _id
    os.mkdir(outdir)
    generate_results(model=test_clf, input_data=test_clf_input_df3,
                    tmpdir=tmpdir, _id=_id, target_name='class',
                    figure_export=True,
                    categories=["test_categorical_feature_1"],
                    encoding_strategy='OrdinalEncoder')

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


def test_generate_results_10():
    """Test generate results can produce expected outputs with 2 categorical features and 1 ordinal feature."""
    tmpdir = mkdtemp() + '/'
    _id = 'test_id'
    outdir = tmpdir + _id
    os.mkdir(outdir)
    generate_results(
                    model=test_clf, input_data=test_clf_input_df3,
                    tmpdir=tmpdir, _id=_id, target_name='class',
                    figure_export=True,
                    categories=["test_categorical_feature_1", "test_categorical_feature_2"],
                    ordinals={'test_ordinal_feature': [1,3,5,7,9]},
                    encoding_strategy='OrdinalEncoder'
                    )

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
    classes = input_data[target_name].values
    training_features, testing_features, training_classes, testing_classes = \
        train_test_split(features, classes, random_state=42, stratify=input_data[target_name])

    test_clf = DecisionTreeClassifier(random_state=42)
    test_clf.fit(training_features, training_classes)
    test_clf_scoe = SCORERS['balanced_accuracy'](test_clf, testing_features, testing_classes)

    tmpdir = mkdtemp() + '/'
    pickle_file = tmpdir + '/test.plk'
    # test dump and load fitted model
    pickle_model = {}
    pickle_model['model'] = test_clf
    joblib.dump(pickle_model, pickle_file)
    pickle_model = joblib.load(pickle_file)
    load_clf = pickle_model['model']
    load_clf_score = SCORERS['balanced_accuracy'](load_clf, testing_features, testing_classes)
    assert test_clf_scoe == load_clf_score

    pipeline_text = generate_export_codes('test.plk', test_clf, filename=['test_dataset.tsv'],
                                        target_name=target_name, random_state=42)

    expected_text = """# Python version: {python_version}
# Results were generated with numpy v{numpy_version}, pandas v{pandas_version} and scikit-learn v{skl_version}
# random seed = 42
# Training dataset filename = test_dataset.tsv
# Pickle filename = test.plk
# Model in the pickle file: {model}
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.externals import joblib
from sklearn.utils import check_X_y
from sklearn.metrics import make_scorer

# NOTE: Edit variables below with appropriate values
# path to your pickle file, below is the downloaded pickle file
pickle_file = 'test.plk'
# file path to the dataset
dataset = 'test_dataset.tsv'
# target column name
target_column = '{target_name}'
# seed to be used for train_test_split (default in PennAI is 42)
seed = 42

# Balanced accuracy below was described in [Urbanowicz2015]: the average of sensitivity and specificity is computed for each class and then averaged over total number of classes.
# It is NOT the same as sklearn.metrics.balanced_accuracy_score, which is defined as the average of recall obtained on each class.
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

# load fitted model
pickle_model = joblib.load(pickle_file)
model = pickle_model['model']

# read input data
input_data = pd.read_csv(dataset, sep=None, engine='python')

# Application 1: reproducing training score and testing score from PennAI
features = input_data.drop(target_column, axis=1).values
target = input_data[target_column].values
# Checking dataset
features, target = check_X_y(features, target, dtype=None, order="C", force_all_finite=True)
training_features, testing_features, training_classes, testing_classes = \\
    train_test_split(features, target, random_state=seed, stratify=input_data[target_column])
scorer = make_scorer(balanced_accuracy)
train_score = scorer(model, training_features, training_classes)
print("Training score: ", train_score)
test_score = scorer(model, testing_features, testing_classes)
print("Testing score: ", test_score)


# Application 2: cross validation of fitted model
testing_features = input_data.drop(target_column, axis=1).values
testing_target = input_data[target_column].values
# Get holdout score for fitted model
print("Holdout score: ", end="")
print(model.score(testing_features, testing_target))


# Application 3: predict outcome by fitted model
# In this application, the input dataset may not include target column
input_data.drop(target_column, axis=1, inplace=True) # Please comment this line if there is no target column in input dataset
predict_target = model.predict(input_data.values)
""".format(
        python_version=sys.version.replace('\n', ''),
        numpy_version=np.__version__,
        pandas_version=pd.__version__,
        skl_version=skl_version,
        target_name=target_name,
        model=str(load_clf).replace('\n', '\n#')
    )

    assert_equal(pipeline_text, expected_text)
    rmtree(tmpdir)
