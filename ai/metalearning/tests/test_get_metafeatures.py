import unittest
from unittest.mock import Mock, patch
from nose.tools import nottest, raises, assert_equals, assert_in, assert_not_in, assert_is_none
from parameterized import parameterized
import ai.metalearning.get_metafeatures as mf
import simplejson
import logging
import sys
import os
import io

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

os.environ["PROJECT_ROOT"] = "/appsrc"

package_directory = os.path.dirname(os.path.abspath(__file__))
 
@nottest
def main_args_good():
	return [
			(os.path.join(package_directory, 'iris.csv'),
			'Name',
			'filepath'),
			(os.path.join(package_directory, 'iris.csv'),
			'Name',
			None),
	]

def main_args_bad():
	return [
			(os.path.join(package_directory, 'iris.csv'),
			'Namezzz',
			'filepath')
	]


class Dataset_Describe(unittest.TestCase):

	def setUp(self):
		irisPath = os.path.join(package_directory, 'iris.csv')

	@parameterized.expand(main_args_good)
	def test_validate_main_good(self, file_path, target, identifier_type):
		result = io.StringIO()
		testargs = ["program.py", file_path]

		if target: testargs.extend(['-target', target])
		if identifier_type: testargs.extend(['-identifier_type', identifier_type])

		logger.debug("testargs: " + str(testargs))

		with patch.object(sys, 'argv', testargs):
			sys.stdout = result
			mf.main()
			sys.stdout = sys.__stdout__

		logger.debug(f'result:\n=====\n{result.getvalue()}\n=====')

		self.assertTrue(result.getvalue())
		
		objResult = None
		try:
			objResult = simplejson.loads(result.getvalue())
		except simplejson.JSONDecodeError as e:
			self.assertIsNone(e)

		self.assertIsInstance(objResult, dict)
		self.assertNotIn("success", objResult.keys())
		self.assertIn("n_classes", objResult.keys())


	@parameterized.expand(main_args_bad)
	def test_validate_main_bad(self, file_path, target, identifier_type):
		result = io.StringIO()
		testargs = ["program.py", file_path]

		if target: testargs.extend(['-target', target])
		if identifier_type: testargs.extend(['-identifier_type', identifier_type])

		logger.debug("testargs: " + str(testargs))

		with patch.object(sys, 'argv', testargs):
			sys.stdout = result
			mf.main()
			sys.stdout = sys.__stdout__

		logger.debug(f'result:\n=====\n{result.getvalue()}\n=====')

		self.assertTrue(result.getvalue())
		
		objResult = None
		try:
			objResult = simplejson.loads(result.getvalue())
		except simplejson.JSONDecodeError as e:
			self.assertIsNone(e)

		self.assertIsInstance(objResult, dict)
		self.assertIn("success", objResult.keys())
		self.assertFalse(objResult['success'])