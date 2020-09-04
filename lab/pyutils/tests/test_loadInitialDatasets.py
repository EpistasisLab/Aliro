"""~This file is part of the PennAI library~

Copyright (C) 2017 Epistasis Lab, University of Pennsylvania

PennAI is maintained by:
    - Heather Williams (hwilli@upenn.edu)
    - Weixuan Fu (weixuanf@pennmedicine.upenn.edu)
    - William La Cava (lacava@upenn.edu)
    - and many other generous open source contributors

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.

"""


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
