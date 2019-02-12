import lab.pyutils.validateDataset as validateDataset
import unittest
from unittest import skip
from unittest.mock import Mock, patch
from nose.tools import nottest, raises, assert_equal, assert_true
from parameterized import parameterized
import pandas as pd
import logging
import io
import sys
import simplejson
import os

os.environ['PROJECT_ROOT'] = "."
os.environ["LAB_HOST"] = "lab"
os.environ['LAB_PORT'] = "5080"

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

@nottest
def load_bad_test_data():
	return [
		("appendicitis_bad_dim", 
			"data/datasets/test/test_bad/appendicitis_bad_dim.csv",
			"class",
			"sklearn.check_X_y() validation failed: Input contains NaN, infinity or a value too large for dtype('float64')."),
		("appendicitis_bad_target_col", 
			"data/datasets/test/test_bad/appendicitis_bad_target_col.csv",
			"class",
			"Target column 'class' not in data"),
		("appendicitis_null", 
			"data/datasets/test/test_bad/appendicitis_null.csv",
			"class",
			"sklearn.check_X_y() validation failed: Input contains NaN, infinity or a value too large for dtype('float64')."),	
	]

@nottest
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
		result, message = validateDataset.validate_data_from_filepath(file_path, target_column)
		assert not(result)
		assert(message)

	@parameterized.expand(load_good_test_data)
	def test_validate_data_file_good(self, name, file_path, target_column):
		result, message = validateDataset.validate_data_from_filepath(file_path, target_column)
		logger.debug("name: " + name + " file_path: " + file_path + " target:" + target_column + " res: " + str(result) + " msg: " + str(message))
		self.assertTrue(result)
		
	@parameterized.expand(load_good_test_data)
	def test_validate_data_file_good_no_target(self, name, file_path, target_column):
		result, message = validateDataset.validate_data_from_filepath(file_path, None)
		logger.debug("name: " + name + " file_path: " + file_path + " target:" + target_column + " res: " + str(result) + " msg: " + str(message))
		self.assertTrue(result)

	@parameterized.expand(load_good_test_data)
	def test_validate_data_file_good_main(self, name, file_path, target_column):
		result = io.StringIO()
		testargs = ["program.py", file_path, '-target', target_column, '-identifier_type', 'filepath']
		with patch.object(sys, 'argv', testargs):
			sys.stdout = result
			validateDataset.main()
			sys.stdout = sys.__stdout__
		logger.debug("testargs: " + str(testargs) + " res: " + result.getvalue())
		self.assertTrue(result.getvalue())
		objResult = simplejson.loads(result.getvalue())
		self.assertEqual(objResult, {"success": True, "errorMessage": None})


	@parameterized.expand(load_bad_test_data)
	def test_validate_data_file_bad_main(self, name, file_path, target_column, expectedMessage):
		result = io.StringIO()
		testargs = ["program.py", file_path, '-target', target_column, '-identifier_type', 'filepath']
		with patch.object(sys, 'argv', testargs):
			sys.stdout = result
			validateDataset.main()
			sys.stdout = sys.__stdout__
		logger.debug("testargs: " + str(testargs) + " res: " + result.getvalue())
		self.assertTrue(result.getvalue())
		objResult = simplejson.loads(result.getvalue())
		self.assertEqual(objResult, {"success": False, "errorMessage": expectedMessage})


	@parameterized.expand(load_good_test_data)
	def test_validate_data_api_main_connect_error(self, name, file_path, target_column):
		result = io.StringIO()
		testargs = ["program.py", file_path, '-target', target_column, '-identifier_type', 'fileid']
		with patch.object(sys, 'argv', testargs):
			sys.stdout = result
			validateDataset.main()
			sys.stdout = sys.__stdout__
		logger.debug("testargs: " + str(testargs) + " res: " + result.getvalue())
		self.assertTrue(result.getvalue())
		objResult = simplejson.loads(result.getvalue())
		#self.assertEqual(objResult, {"success": False, "errorMessage": None})
		self.assertIsInstance(objResult, dict)
		self.assertEqual(list(objResult), ["success", "errorMessage"])
		self.assertEqual(objResult['success'], False)
		self.assertRegex(objResult['errorMessage'], "^Exception: ConnectionError\(MaxRetryError")
