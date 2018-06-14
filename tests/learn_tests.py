import os
from sklearn.datasets import load_digits, load_boston
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor
from tempfile import mkdtemp
from shutil import rmtree
from learn.skl_utils import generate_results
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
    rmtree(tmpdir)
