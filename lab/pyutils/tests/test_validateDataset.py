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
		("appendicitis_bad_rows", 
			"data/datasets/test/test_bad/appendicitis_bad_rows.csv",
			"target_class",
			None,
			None,
			"Dataset has dimensions (5, 8), classification datasets must have at least 10 rows."),
		# because the data has only one column, the file is not autoparsed properly
		("appendicitis_bad_cols", 
			"data/datasets/test/test_bad/appendicitis_bad_cols.csv",
			"target_class",
			None,
			None,
			"Target column 'target_class' not in data"),
			#"Dataset has dimensions (5, 2), classification datasets must have at least 2 columns."),
		("appendicitis_bad_cols_per_class", 
			"data/datasets/test/test_bad/appendicitis_bad_cols_per_class.csv",
			"target_class",
			None,
			None,
			"Classification datasets must have at least 2 rows per class, class(es) '[3]' have only 1 row."),
		("appendicitis_bad_dim", 
			"data/datasets/test/test_bad/appendicitis_bad_dim.csv",
			"class",
			None,
			None,
			"Classification datasets must have at least 2 rows per class, class(es) '[9999999.0]' have only 1 row."),
		("appendicitis_bad_target_col", 
			"data/datasets/test/test_bad/appendicitis_bad_target_col.csv",
			"class",
			None,
			None,
			"Target column 'class' not in data"),
		("appendicitis_null", 
			"data/datasets/test/test_bad/appendicitis_null.csv",
			"class",
			None,
			None,
			"sklearn.check_array() validation Input contains NaN, infinity or a value too large for dtype('float64')."),	
		("appendicitis_cat", 
			"data/datasets/test/test_bad/appendicitis_cat.csv",
			"target_class",
			None,
			None,
			"sklearn.check_array() validation could not convert string to float: 'b'"),
		("appendicitis_cat_2", 
			"data/datasets/test/test_bad/appendicitis_cat_2.csv",
			"target_class",
			None,
			None,
			"sklearn.check_array() validation could not convert string to float: 'a'"),
		("appendicitis_cat_missing_col", 
			"data/datasets/test/integration/appendicitis_cat_ord.csv",
			"target_class",
			["cat"],
			None,
			"sklearn.check_array() validation could not convert string to float: 'first'"),
		("appendicitis_ord_missing_col", 
			"data/datasets/test/integration/appendicitis_cat_ord.csv",
			"target_class",
			None,
			{"ord" : ["first", "second", "third"]},
			"sklearn.check_array() validation could not convert string to float: 'b'"),
		("appendicitis_cat_ord_missing_val", 
			"data/datasets/test/integration/appendicitis_cat_ord.csv",
			"target_class",
			["cat"],
			{"ord" : ["first", "second"]},
			"encode_data() failed, Found unknown categories ['third'] in column 0 during fit"),
		("appendicitis_ord_target", 
			"data/datasets/test/test_bad/appendicitis_ord_target.csv",
			"target_class",
			None,
			{"target_class" : ["true", "false"]},
			"Target column 'target_class' cannot be an ordinal feature"),
		("appendicitis_cat_target", 
			"data/datasets/test/test_bad/appendicitis_ord_target.csv",
			"target_class",
			["target_class"],
			None,
			"Target column 'target_class' cannot be a categorical feature")
	]

@nottest
def load_bad_test_data_no_target():
	return [
		("appendicitis_bad_dim", 
			"data/datasets/test/test_bad/appendicitis_bad_dim.csv",
			"class",
			"sklearn.check_array() validation Input contains NaN, infinity or a value too large for dtype('float64')."),
		("appendicitis_null", 
			"data/datasets/test/test_bad/appendicitis_null.csv",
			"class",
			"sklearn.check_array() validation Input contains NaN, infinity or a value too large for dtype('float64')."),	
		("appendicitis_cat", 
			"data/datasets/test/test_bad/appendicitis_cat.csv",
			"target_class",
			"sklearn.check_array() validation could not convert string to float: 'b'"),
		("appendicitis_cat_2", 
			"data/datasets/test/test_bad/appendicitis_cat_2.csv",
			"target_class",
			"sklearn.check_array() validation could not convert string to float: 'a'"),
	]

@nottest
def load_good_test_data():
	return [
		("allbp", 
			"data/datasets/test/test_flat/allbp.csv",
			"class",
			None,
			None),
		("appendicitis_alt_target_col", 
			"data/datasets/test/test_flat/appendicitis.csv",
			"target_class",
			[],
			{}),
		("appendicitis_cat", 
			"data/datasets/test/integration/appendicitis_cat.csv",
			"target_class",
			["cat"],
			None),
		("appendicitis_ord", 
			"data/datasets/test/integration/appendicitis_ord.csv",
			"target_class",
			None,
			{"ord" : ["first", "second", "third"]}
			),
		("appendicitis_cat_ord", 
			"data/datasets/test/integration/appendicitis_cat_ord.csv",
			"target_class",
			["cat"],
			{"ord" : ["first", "second", "third"]}
			),
		("appendicitis_str_target", 
			"data/datasets/test/integration/appendicitis_string_target.csv",
			"target_class",
			None,
			None
			),
	   ]

class TestResultUtils(unittest.TestCase):
	@parameterized.expand(load_bad_test_data)
	def test_validate_data_file_bad(self, name, file_path, target_column, categories, ordinals, expectedMessage):
		result, message = validateDataset.validate_data_from_filepath(file_path, target_column, categories, ordinals)
		assert(message)
		self.assertEqual(message, expectedMessage)
		assert not(result)

	#  NaN or string errors are only checked if the target column is specified.	
##	@parameterized.expand(load_bad_test_data_no_target)
##	def test_validate_data_file_bad_no_target(self, name, file_path, target_column, expectedMessage):
##		result, message = validateDataset.validate_data_from_filepath(file_path, None)
##		assert(message)
##		self.assertEqual(message, expectedMessage)
##		assert not(result)

	@parameterized.expand(load_good_test_data)
	def test_validate_data_file_good(self, name, file_path, target_column, categories, ordinals):
		result, message = validateDataset.validate_data_from_filepath(file_path, target_column, categories, ordinals)
		logger.debug("name: " + name + " file_path: " + file_path + " target:" + target_column + " res: " + str(result) + " msg: " + str(message))
		self.assertTrue(result)
	
	@parameterized.expand(load_good_test_data)
	def test_validate_data_file_good_no_target(self, name, file_path, target_column, categories, ordinals):
		result, message = validateDataset.validate_data_from_filepath(file_path, None, categories, ordinals)
		logger.debug("name: " + name + " file_path: " + file_path + " target:" + target_column + " res: " + str(result) + " msg: " + str(message))
		self.assertTrue(result)

	@parameterized.expand(load_good_test_data)
	def test_validate_data_main_file_good(self, name, file_path, target_column, categories, ordinals):
		result = io.StringIO()
		testargs = ["program.py", file_path, '-target', target_column, '-identifier_type', 'filepath']
		
		if (categories) : testargs.extend(['-categorical_features', simplejson.dumps(categories)])
		if (ordinals) : testargs.extend(['-ordinal_features', simplejson.dumps(ordinals)])

		with patch.object(sys, 'argv', testargs):
			sys.stdout = result
			validateDataset.main()
			sys.stdout = sys.__stdout__
		logger.debug("testargs: " + str(testargs) + " res: " + result.getvalue())
		self.assertTrue(result.getvalue())
		objResult = simplejson.loads(result.getvalue())
		self.assertEqual(objResult, {"success": True, "errorMessage": None})


	@parameterized.expand(load_bad_test_data)
	def test_validate_data_main_file_bad(self, name, file_path, target_column, categories, ordinals, expectedMessage):
		result = io.StringIO()
		testargs = ["program.py", file_path, '-target', target_column, '-identifier_type', 'filepath']

		if (categories) : testargs.extend(['-categorical_features', simplejson.dumps(categories)])
		if (ordinals) : testargs.extend(['-ordinal_features', simplejson.dumps(ordinals)])

		with patch.object(sys, 'argv', testargs):
			sys.stdout = result
			validateDataset.main()
			sys.stdout = sys.__stdout__
		logger.debug("testargs: " + str(testargs) + " res: " + result.getvalue())
		self.assertTrue(result.getvalue())
		objResult = simplejson.loads(result.getvalue())
		self.assertEqual(objResult, {"success": False, "errorMessage": expectedMessage})


	@parameterized.expand(load_good_test_data)
	def test_validate_data_main_api_connect_error(self, name, file_path, target_column, categories, ordinals):
		result = io.StringIO()
		testargs = ["program.py", file_path, '-target', target_column, '-identifier_type', 'fileid']

		if (categories) : testargs.extend(['-categorical_features', simplejson.dumps(categories)])
		if (ordinals) : testargs.extend(['-ordinal_features', simplejson.dumps(ordinals)])

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
		#self.assertRegex(objResult['errorMessage'], "^Exception: ConnectionError\(MaxRetryError")
		#self.assertRegex(objResult['errorMessage'], "^Exception: ConnectTimeout\(MaxRetryError")
		self.assertRegex(objResult['errorMessage'], "^Exception: Connect.*\(MaxRetryError")