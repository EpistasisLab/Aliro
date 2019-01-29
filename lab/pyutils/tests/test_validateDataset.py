import lab.pyutils.validateDataset as validateDataset
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
			"data/datasets/test/test_bad/appendicitis_bad_dim.csv",
			"class",
			"error"),
		("appendicitis_bad_target_col", 
			"data/datasets/test/test_bad/appendicitis_bad_target_col.csv",
			"class",
			"error"),
		("appendicitis_null", 
			"data/datasets/test/test_bad/appendicitis_null.csv",
			"class",
			"error"),	
	]

def load_good_test_data():
	return [
		("allbp", 
			"data/datasets/test/test_flat/allbp.csv",
			"class"),
		("appendicitis_alt_target_col", 
			"data/datasets/test/test_flat/appendicitis.csv",
			"target_class"),
	   ]

class TestResultUtils(unittest.TestCase):
	@parameterized.expand(load_bad_test_data)
	def test_validate_data_file_bad(self, name, file_path, target_column, expectedMessage):
		result, message = validateDataset.validate_data_from_file(file_path, target_column)
		assert not(result)
		assert(message)

	@parameterized.expand(load_good_test_data)
	def test_validate_data_file_good(self, name, file_path, target_column):
		result, message = validateDataset.validate_data_from_file(file_path, target_column)
		logger.debug("name: " + name + " file_path: " + file_path + " target:" + target_column + " res: " + str(result) + " msg: " + str(message))
		self.assertTrue(result)
		
	@parameterized.expand(load_good_test_data)
	def test_validate_data_file_good_no_target(self, name, file_path, target_column):
		result, message = validateDataset.validate_data_from_file(file_path, None)
		logger.debug("name: " + name + " file_path: " + file_path + " target:" + target_column + " res: " + str(result) + " msg: " + str(message))
		self.assertTrue(result)