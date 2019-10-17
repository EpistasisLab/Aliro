"""
Test the labAPi methods (api_utils.py)
"""

from ai.api_utils import LabApi, AI_STATUS
import sys
from unittest.mock import Mock, patch
from nose.tools import nottest, raises, assert_is_instance, assert_equal, assert_in, assert_true
import lab_api_mocker as mocker
import pandas as pd

class TestLabApi:
	def setup(self):
		"set up test fixtures"
		self.labApi = LabApi(
			api_path=mocker.api_path, 
			user=mocker.user, 
			api_key=None, 
			extra_payload=mocker.extra_payload,
			verbose=True)


		self.partial_expected_classification_ml_p = [
			{"alg_name":"SVC", "category":"classification", "algorithm":"5ba41716dfe741699222871b", "parameters":{'C': 0.0001, 'kernel': 'poly', 'tol': 1e-05}},
			{"alg_name":"SVC", "category":"classification", "algorithm":"5ba41716dfe741699222871b", "parameters":{'C': 0.0001, 'kernel': 'poly', 'tol': 0.0001}},
			{"alg_name":"SVC", "category":"classification", "algorithm":"5ba41716dfe741699222871b", "parameters":{'C': 0.0001, 'kernel': 'poly', 'tol': 0.001}},
			{"alg_name":"SVC", "category":"classification", "algorithm":"5ba41716dfe741699222871b", "parameters":{'C': 25, 'kernel': 'rbf', 'tol': 0.1}},
			{"alg_name":"SVC", "category":"classification", "algorithm":"5ba41716dfe741699222871b", "parameters":{'C': 1, 'kernel': 'poly', 'tol': 1e-05}},
		]

		self.expected_total_classification_ml_p = 80

		self.partial_expected_regression_ml_p = [
			{"alg_name":"DecisionTreeRegressor", "category":"regression", "algorithm":"5da8d68c4590b0868cbf574e", "parameters":{'criterion': 'mse', 'max_depth': 10, 'min_samples_split':2, 'min_samples_leaf':1, 'min_weight_fraction_leaf':0}},
			{"alg_name":"DecisionTreeRegressor", "category":"regression", "algorithm":"5da8d68c4590b0868cbf574e", "parameters":{'criterion': 'mse', 'max_depth': 10, 'min_samples_split':2, 'min_samples_leaf':1, 'min_weight_fraction_leaf':.45}},
			{"alg_name":"DecisionTreeRegressor", "category":"regression", "algorithm":"5da8d68c4590b0868cbf574e", "parameters":{'criterion': 'mse', 'max_depth': 10, 'min_samples_split':2, 'min_samples_leaf':5, 'min_weight_fraction_leaf':0}},
			{"alg_name":"DecisionTreeRegressor", "category":"regression", "algorithm":"5da8d68c4590b0868cbf574e", "parameters":{'criterion': 'mae', 'max_depth': 10, 'min_samples_split':2, 'min_samples_leaf':1, 'min_weight_fraction_leaf':0}},
		]

		self.expected_total_regression_ml_p = 48

	@patch('requests.request', side_effect=mocker.mocked_requests_request)
	def test_get_projects(self, mock_request):
		res = self.labApi.get_projects()
		#print("type: ", type(res))
		#assert_is_instance(res, dict)
		assert len(res) > 0


	@patch('requests.request', side_effect=mocker.mocked_requests_request)
	def test_get_all_ml_p(self, mock_request):

		res = self.labApi.get_all_ml_p()
		print("type: ", type(res))
		assert_is_instance(res, pd.DataFrame)
		assert len(res) == (self.expected_total_classification_ml_p + self.expected_total_regression_ml_p)

		resDict = res.to_dict('records')

		for expectedRow in self.partial_expected_classification_ml_p:
			assert_in(expectedRow, resDict)

		for expectedRow in self.partial_expected_regression_ml_p:
			assert_in(expectedRow, resDict)

	@patch('requests.request', side_effect=mocker.mocked_requests_request)
	def test_get_dataset_ai_status_none(self, mock_request):
		res = self.labApi.get_dataset_ai_status(mocker.test_dataset_id_no_ai)
		assert_equal(res, None)

	@patch('requests.request', side_effect=mocker.mocked_requests_request)
	def test_get_dataset_ai_status_on(self, mock_request):
		res = self.labApi.get_dataset_ai_status(mocker.test_dataset_id_ai_on)
		assert_equal(res, "on")
		assert_equal(res, AI_STATUS.ON.value)

	@patch('requests.request', side_effect=mocker.mocked_requests_request_multi_machine)
	def test_get_all_ml_p_mulit_machine(self, mock_request):
		res = self.labApi.get_all_ml_p()
		print("type: ", type(res))
		assert_is_instance(res, pd.DataFrame)
		assert len(res) > 0