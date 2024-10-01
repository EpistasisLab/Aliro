"""~This file is part of the Aliro library~

Copyright (C) 2023 Epistasis Lab, 
Center for Artificial Intelligence Research and Education (CAIRE),
Department of Computational Biomedicine (CBM),
Cedars-Sinai Medical Center.

Aliro is maintained by:
    - Hyunjun Choi (hyunjun.choi@cshs.org)
    - Miguel Hernandez (miguel.e.hernandez@cshs.org)
    - Nick Matsumoto (nicholas.matsumoto@cshs.org)
    - Jay Moran (jay.moran@cshs.org)
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

(Autogenerated header, do not modify)

"""
"""
Test the labAPi methods (api_utils.py)
"""

from ai.api_utils import LabApi, AI_STATUS, RECOMMENDER_STATUS
import sys
from unittest.mock import Mock, patch
from nose.tools import nottest, raises, assert_is_instance, assert_equal, assert_in, assert_true, assert_dict_equal
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
            {
                         "algorithm":"SVC", 
                         "algorithm_id":"5ba41716dfe741699222871b",
                         "category":"classification", 
                         "parameters":{'C': 0.0001, 
                                       'kernel': 'poly', 
                                       'tol': 1e-05}
                        },
            {
                         "algorithm":"SVC", 
                         "algorithm_id":"5ba41716dfe741699222871b",
                         "category":"classification",  
                         "parameters":{'C': 0.0001, 
                             'kernel': 'poly', 
                             'tol': 0.0001}},
            {
                         "algorithm":"SVC", 
                         "algorithm_id":"5ba41716dfe741699222871b",
                         "category":"classification",  
                         "parameters":{'C': 0.0001, 
                             'kernel': 'poly', 
                             'tol': 0.001}},
            {
                         "algorithm":"SVC", 
                         "algorithm_id":"5ba41716dfe741699222871b",
                         "category":"classification",  
                         "parameters":{'C': 25, 
                             'kernel': 'rbf', 
                             'tol': 0.1}},
            {
                         "algorithm":"SVC", 
                         "algorithm_id":"5ba41716dfe741699222871b",
                         "category":"classification",  
                         "parameters":{'C': 1, 
                             'kernel': 'poly', 
                             'tol': 1e-05}},
        ]

        self.expected_total_classification_ml_p = 80

        self.partial_expected_regression_ml_p = [
            {
                         "algorithm":"DecisionTreeRegressor", 
                         "algorithm_id":"5da8d68c4590b0868cbf574e", 
                         "category":"regression", 
                        #  "parameters":{'criterion': 'mse', 
                        # Jay M.: names changed after scikit-learn 1.0
                         "parameters":{'criterion': 'squared_error', 
                                       'max_depth': 10,
                                       'min_samples_split':2, 
                                       'min_samples_leaf':1, 
                                       'min_weight_fraction_leaf':0}
                        },
            {
                         "algorithm":"DecisionTreeRegressor", 
                         "algorithm_id":"5da8d68c4590b0868cbf574e", 
                         "category":"regression", 
                        #  "parameters":{'criterion': 'mse', 
                        # Jay M.: names changed after scikit-learn 1.0
                         "parameters":{'criterion': 'squared_error', 

                                       'max_depth': 10, 
                                       'min_samples_split':2, 
                                       'min_samples_leaf':1, 
                                       'min_weight_fraction_leaf':.45}
                        },
            {
                         "algorithm":"DecisionTreeRegressor", 
                         "algorithm_id":"5da8d68c4590b0868cbf574e", 
                         "category":"regression", 
                        #  "parameters":{'criterion': 'mse', 
                        # Jay M.: names changed after scikit-learn 1.0
                         "parameters":{'criterion': 'squared_error', 
                                       'max_depth': 10, 
                                       'min_samples_split':2, 
                                       'min_samples_leaf':5, 
                                       'min_weight_fraction_leaf':0}
                        },
            {
                         "algorithm":"DecisionTreeRegressor", 
                         "algorithm_id":"5da8d68c4590b0868cbf574e", 
                         "category":"regression", 
                        #  "parameters":{'criterion': 'mae', 
                        # Jay M.: names changed after scikit-learn 1.0
                          "parameters":{'criterion': 'absolute_error',
                                       'max_depth': 10, 
                                       'min_samples_split':2, 
                                       'min_samples_leaf':1, 
                                       'min_weight_fraction_leaf':0}
                         },
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
    def test_set_recommender_status(self, mock_request):
        res = self.labApi.set_recommender_status(RECOMMENDER_STATUS.RUNNING.value)
        print("type: ", type(res))
        print(res)
        assert_dict_equal(res, {"message": "AI status set to 'running'"})

    @patch('requests.request', side_effect=mocker.mocked_requests_request)
    def test_get_all_ml_p_classification(self, mock_request):

        res = self.labApi.get_all_ml_p("classification")
        print("type: ", type(res))
        assert_is_instance(res, pd.DataFrame)
        assert len(res) == self.expected_total_classification_ml_p

        resDict = res.to_dict('records')

        for expectedRow in self.partial_expected_classification_ml_p:
            assert_in(expectedRow, resDict)

    @patch('requests.request', side_effect=mocker.mocked_requests_request)
    def test_get_all_ml_p_regression(self, mock_request):

        res = self.labApi.get_all_ml_p("regression")
        print("type: ", type(res))
        assert_is_instance(res, pd.DataFrame)
        assert len(res) == self.expected_total_regression_ml_p

        resDict = res.to_dict('records')

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
