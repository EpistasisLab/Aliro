

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
	   ]

def load_metadata():
	return [
		("good1", 
			"data/datasets/test/metadata", 
			"test.csv",
			True,
			"my_target_column",
			[],
			{}),
		("good2", 
			"data/datasets/test/metadata", 
			"test.tsv",
			True,
			"my_target_column",
			[],
			{}),
		("dne", 
			"data/datasets/test/metadata", 
			"i_dont_exist.csv",
			False,
			"class",
			[],
			{}),
	   ]

class TestResultUtils(unittest.TestCase):
	@parameterized.expand(load_metadata)
	def test_get_metadata_for_datafile(self, name, root, file, expected_fileExists, expected_target_column, expected_categorical_features, expected_ordinal_features):
		fileExists, target_column, categorical_features, ordinal_features = loadInitialDatasets.getMetadataForDatafile(root, file)
		assert(fileExists == expected_fileExists)
		assert(target_column == expected_target_column)
		assert(categorical_features == expected_categorical_features)
		assert(ordinal_features == expected_ordinal_features)