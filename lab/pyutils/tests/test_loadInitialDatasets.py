

import lab.pyutils.loadInitialDatasets as loadInitialDatasets
import unittest
from unittest import skip
from unittest.mock import Mock, patch
from nose.tools import nottest, raises, assert_equals, assert_true
from parameterized import parameterized
import pandas as pd
import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

@nottest
def load_bad_test_data():
	return [
		("appendicitis_bad_dim", 
			"data/datasets/test/test_bad", 
			"appendicitis_bad_dim.csv",
			"class",
			"error"),
		("appendicitis_bad_target_col", 
			"data/datasets/test/test_bad", 
			"appendicitis_bad_target_col.csv",
			"class",
			"error"),
		("appendicitis_null", 
			"data/datasets/test/test_bad", 
			"appendicitis_null.csv",
			"class",
			"error"),	
	]

def load_good_test_data():
	return [
		("allbp", 
			"data/datasets/test/test_flat", 
			"allbp.csv",
			"class"),
		("appendicitis_alt_target_col", 
			"data/datasets/test/test_flat", 
			"appendicitis.csv",
			"target_class"),
		("reg_vineyard", 
			"data/datasets/test/test_regression", 
			"192_vineyard.csv",
			"target"),

	   ]

def load_metadata():
	return [
		("good1", 
			"data/datasets/test/metadata", 
			"test.csv",
			True,
			"my_target_column",
			"classification",
			[],
			{}),
		("good2", 
			"data/datasets/test/metadata", 
			"test.tsv",
			True,
			"my_target_column",
			"classification",
			[],
			{}),
		("dne", 
			"data/datasets/test/metadata", 
			"i_dont_exist.csv",
			False,
			"class",
			"classification",
			[],
			{}),
		("good_regression", 
			"data/datasets/test/metadata", 
			"test_regression.csv",
			True,
			"my_target_column",
			"regression",
			[],
			{}),
	   ]

class TestResultUtils(unittest.TestCase):
	@parameterized.expand(load_metadata)
	def test_get_metadata_for_datafile(self, 
			name, 
			root,
			file,
			expected_fileExists,
			expected_target_column,
			expected_prediction_type,
			expected_categorical_features, 
			expected_ordinal_features):
		fileExists, target_column, prediction_type, categorical_features, ordinal_features = loadInitialDatasets.getMetadataForDatafile(root, file)
		self.assertEqual(fileExists, expected_fileExists)
		self.assertEqual(target_column, expected_target_column)
		self.assertEqual(prediction_type, expected_prediction_type)
		self.assertEqual(categorical_features, expected_categorical_features)
		self.assertEqual(ordinal_features, expected_ordinal_features)
