

import lab.init.loadInitialDatasets as loadInitialDatasets
import unittest
from unittest import skip
from unittest.mock import Mock, patch
from nose.tools import nottest, raises, assert_equals
from parameterized import parameterized
import pandas as pd


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
        ("appendicitis", 
        	"data/datasets/test/test_flat", 
        	"appendicitis.csv",
        	"class"),
        ("appendicitis_alt_target_col", 
        	"data/datasets/test/test_bad", 
        	"appendicitis_bad_target_col.csv",
        	"foobar"),
	   ]

class TestResultUtils(unittest.TestCase):
	@parameterized.expand(load_bad_test_data)
	def test_validate_data_file_bad(self, name, root, file, target_column, expectedMessage):
		result, message = loadInitialDatasets.validateDatafile(root, file, target_column)
		print(message)
		assert not(result)
		assert(message)

	@parameterized.expand(load_good_test_data)
	def test_validate_data_file_good(self, name, root, file, target_column):
		result, message = loadInitialDatasets.validateDatafile(root, file, target_column)
		assert(result)
		assert not(message)