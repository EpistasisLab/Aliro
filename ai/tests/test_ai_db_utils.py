"""Tests for ai.py and db_utils.py that mock the json responses that would be returned from the lab server
"""
import os
os.environ["LAB_HOST"] = "lab"
os.environ['LAB_PORT'] = "5080"
os.environ['APIKEY'] = "aaaaa"

from ai.ai import AI
import ai.ai
import sys
import json
from unittest.mock import Mock, patch
import helper_test_api as helper
from helper_test_api import MockResponse



def mocked_requests_put(*args, **kwargs):
    """This method will be used by mock to replace requests.put"""
    print("mocked_requests_put: " + str(args[0]))
    print("kwargs: " + str(kwargs))
    if(kwargs and 'data' in kwargs.keys()) :
        data = json.dumps(kwargs['data'])
    else :
        data = []

    print("data: " + data)

    if args[0] == 'http://lab:5080/api/foo':
        json_data = []
        return MockResponse(json.dumps(json_data), 200)
    else:
        return MockResponse(None, 404)

def mocked_requests_get(*args, **kwargs):
    """This method will be used by mock to replace requests.get"""
    print("mocked_requests_get: " + str(args[0]))
    if args[0] == 'http://lab:5080/api/preferences':
        return MockResponse(json.dumps(helper.api_preferences_data), 200)
    else:
        return MockResponse(None, 404)

def mocked_requests_post(*args, **kwargs):
    """This method will be used by mock to replace requests.post"""
    print("mocked_requests_post: " + str(args[0]))
    print("kwargs: " + str(kwargs))
    if(kwargs and 'data' in kwargs.keys()) :
        data = json.dumps(kwargs['data'])
    else :
        data = []

    print("data: " + data)

    if args[0] == 'http://lab:5080/api/v1/projects' or args[0] == 'http://lab:5080/api/projects' :
        return MockResponse(json.dumps(helper.api_projects_data), 200)
    elif args[0] == 'http://lab:5080/api/preferences':
        return MockResponse(json.dumps(helper.api_preferences_data), 200)
    #elif  (args[0] == 'http://lab:5080/api/datasets' 
    #            and (kwargs['data'] == '{"ai": ["requested"], "apikey": "aaaaa"}')):
    #    return MockResponse(json.dumps({}), 200)
    elif args[0] == 'http://lab:5080/api/userdatasets' or args[0] == 'http://lab:5080/api/datasets' :
        json_data = helper.api_datasets_data
        return MockResponse(json.dumps(json_data), 200)
    elif args[0] == 'http://lab:5080/api/experiments':
        json_data = helper.api_experiments_data
        return MockResponse(json.dumps(json_data), 200)
    elif args[0] == "http://lab:5080/api/v1/projects/5ba41716dfe741699222871b/experiment":
        return MockResponse(json.dumps(helper.api_experiment_a_data), 200)
    else:
        print("Unhandled post")
        return MockResponse(None, 404)

@patch('requests.post', side_effect=mocked_requests_post)
@patch('requests.get', side_effect=mocked_requests_get)
def test_ai_init_args(mock_post, mock_get):
	lab_connection_args = {}
	pennai = AI(
		rec=None,
		api_path='http://lab:5080',
		user="testuser",
        verbose=True, 
        n_recs=1, 
        warm_start=False,
        datasets={}
    )

@patch('requests.post', side_effect=mocked_requests_post)
@patch('requests.get', side_effect=mocked_requests_get)
def test_ai_init(mock_post, mock_get):
	lab_connection_args = {}
	pennai = AI()

@patch('requests.post', side_effect=mocked_requests_post)
@patch('requests.get', side_effect=mocked_requests_get)
def test_ai_random_recommender(mock_post, mock_get):
    lab_connection_args = {}
    pennai = AI()

@patch('requests.post', side_effect=mocked_requests_post)
@patch('requests.get', side_effect=mocked_requests_get)
@patch('requests.put', side_effect=mocked_requests_put)
@patch('time.sleep', side_effect=[None, None, SystemExit]) #Third time time.sleep() is called, SystemExit exception is raised
@patch('sys.argv', ["a", "b"])
def test_main_command_line(mock_post, mock_get, mock_put, mock_sleep):
    testargs = ["ai"]
    with patch.object(sys, 'argv', testargs):
        aiProc = ai.ai.main()