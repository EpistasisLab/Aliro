"""Tests for ai.py and db_utils.py that mock the json responses that would be returned from the lab server
"""
import os
os.environ["LAB_HOST"] = "lab"
os.environ['LAB_PORT'] = "5080"
os.environ['APIKEY'] = "aaaaa"

from ai.ai import AI
import ai.ai
from ai.db_utils import LabApi
import ai.recommender.random_recommender
import sys
import json
from unittest.mock import Mock, patch
import helper_test_api as helper

def mocked_requests_post(*args, **kwargs):
    """This method will be used by mock to replace requests.post"""
    print("mocked_requests_post: " + str(args[0]))
    print("kwargs: " + str(kwargs))
    if(kwargs and 'data' in kwargs.keys()) :
        data = json.dumps(kwargs['data'])
    else :
        data = []

    print("data: " + data)

    if args[0] == 'http://lab:5080/api/preferences':
        return helper.MockResponse(json.dumps(helper.api_preferences_data), 200)
    elif args[0] == 'http://lab:5080/api/projects':
        return helper.MockResponse(json.dumps(helper.api_projects_data), 200)
    elif args[0] == 'http://lab:5080/api/userdatasets':
        return helper.MockResponse(json.dumps(helper.api_datasets_data), 200)
    else:
        return helper.MockResponse(None, 404)

@patch('ai.db_utils.LabApi')
@patch('requests.post', side_effect = mocked_requests_post)  #remove once api calls have been removed from recommenders
def test_ai_init( mockLabApi, mockRequestsPost):
        labApiInstance = mockLabApi.return_value

        labApiInstance.launch_experiment.return_value = {'launch_experiment'}
        labApiInstance.get_projects.return_value = {'get_projects'}
        labApiInstance.get_filtered_datasets.return_value = {'get_filtered_datasets'}
        labApiInstance.get_new_experiments.return_value = {'get_new_experiments'}
        labApiInstance.set_ai_status.return_value = {'set_ai_status'}

        lab_connection_args = {}
        pennai = AI()