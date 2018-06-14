import os
from sklearn.datasets import load_digits, load_boston
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor
from tempfile import mkdtemp
from shutil import rmtree
from learn.skl_utils import generate_results, generate_export_codes
import json

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
    rmtree(tmpdir)


def test_generate_results_2():
    """Test generate results can produce right outputs in classification mode without figure_export=False"""
    tmpdir = mkdtemp() + '/'
    _id = 'test_id'
    outdir = tmpdir + _id
    os.mkdir(outdir)
    generate_results(model=test_clf, input_file=test_clf_input,
                    tmpdir=tmpdir, _id=_id, target_name='label:nom', figure_export=False)

    value_json = '{}/value.json'.format(outdir)
    assert os.path.isfile(value_json)
    with open(value_json, 'r') as f:
        value = json.load(f)
    assert value['_scores']['train_score'] > 0.9
    assert os.path.isfile('{}/prediction_values.json'.format(outdir))
    assert os.path.isfile('{}/feature_importances.json'.format(outdir))
    assert not os.path.isfile('{}/confusion_matrix_{}.png'.format(outdir, _id))
    assert not os.path.isfile('{}/roc_curve{}.png'.format(outdir, _id)) # only has roc for binary outcome
    assert not os.path.isfile('{}/imp_score{}.png'.format(outdir, _id))
    assert os.path.isfile('{}/scripts_{}.py'.format(outdir, _id))
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
    rmtree(tmpdir)


def test_generate_export_codes():
    """Test generate_export_codes can generate scripts as execpted."""
    test_clf = DecisionTreeClassifier(random_state=42)
    pipeline_text = generate_export_codes(test_clf)

    expected_text = """import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.tree.tree import DecisionTreeClassifier

# NOTE: Make sure that the target (y) is labeled 'target' in the data file
input_data = pd.read_csv('PATH/TO/DATA/FILE', sep='COLUMN_SEPARATOR', dtype=np.float64)
features = input_data.drop('target', axis=1).values
training_features, testing_features, training_target, testing_target = \\
            train_test_split(features, tpot_data['target'].values, random_state=42)

model=DecisionTreeClassifier(class_weight=None, criterion=gini, max_depth=None, max_features=None, max_leaf_nodes=None, min_impurity_decrease=0.0, min_impurity_split=None, min_samples_leaf=1, min_samples_split=2, min_weight_fraction_leaf=0.0, presort=False, random_state=42, splitter=best)
model.fit(training_features, training_target)
results = model.predict(testing_features)
"""

    assert pipeline_text==expected_text
