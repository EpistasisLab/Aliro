"""
Test the api engine (ai.py) and the labAPi methods (db_utils.py) together by simulating the 
responses that would be returned by GETing, POSTing and PUTing requests to the lab server.
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
from nose.tools import nottest, raises
import helper_test_api as helper
from helper_test_api import MockResponse
import logging

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


#===========================================
# requests.* Mock Methods
#===========================================
def mocked_requests_request(*args, **kwargs):
    """This method will be used by mock to replace requests.request"""
    logger.debug("mocked_requests: " + str(args) + " kwargs: " + str(kwargs))
    if(kwargs and 'data' in kwargs.keys()) :
        data = json.dumps(kwargs['data'])
    else :
        data = []

    assert (args[0] in ["POST", "GET", "PUT"])

    if (args[0] == "POST"): return handle_post(args[1], data)
    elif (args[0] == "GET"): return handle_get(args[1], data)
    elif (args[0] == "PUT"): return handle_put(args[1], data)

def mocked_requests_request_bad_launch_experiment(*args, **kwargs):
    """This method will be used by mock to replace requests.request"""
    logger.debug("mocked_requests_bad: " + str(args) + " kwargs: " + str(kwargs))
    if(kwargs and 'data' in kwargs.keys()) :
        data = json.dumps(kwargs['data'])
    else :
        data = []

    assert (args[0] in ["POST", "GET", "PUT"])

    if (args[0] == "POST"): return handle_post_bad_launch_experiment(args[1], data)
    elif (args[0] == "GET"): return handle_get(args[1], data)
    elif (args[0] == "PUT"): return handle_put(args[1], data)

def mocked_requests_put(*args, **kwargs):
    """This method will be used by mock to replace requests.put"""
    logger.debug("mocked_requests_put: " + str(args[0]) + " kwargs: " + str(kwargs))
    if(kwargs and 'data' in kwargs.keys()) :
        data = json.dumps(kwargs['data'])
        logger.debug("data: " + data)
    else :
        data = []

    return handle_put(args[0], data)

def mocked_requests_post(*args, **kwargs):
    """This method will be used by mock to replace requests.post"""
    logger.debug("mocked_requests_post: " + str(args[0]) + " kwargs: " + str(kwargs))
    if(kwargs and 'data' in kwargs.keys()) :
        data = json.dumps(kwargs['data'])
        logger.debug("data: " + data)
    else :
        data = []

    return handle_post(args[0], data)

def mocked_requests_get(*args, **kwargs):
    """This method will be used by mock to replace requests.get"""
    logger.debug("mocked_requests_get: " + str(args[0]) + " kwargs: " + str(kwargs))
    if(kwargs and 'data' in kwargs.keys()) :
        data = json.dumps(kwargs['data'])
        logger.debug("data: " + data)
    else :
        data = []

    return handle_get(args[0], data)

#===========================================
# API response simulation utility methods
#===========================================
def handle_put(path, data):
    #print("handle_put: ", path)

    if path == "http://lab:5080/api/userdatasets/5ba417507831bf002bcbd59b/ai":
        return MockResponse(json.dumps(helper.api_experiment_ai_on), 200)
    else:
        logger.error("Unhandled path: " + str(args[0]))
        return MockResponse(None, 404)

def handle_get(path, data):
    """This method will be used by mock to replace requests.get"""
    #print("handle_get: ", path)

    if path == 'http://lab:5080/api/preferences':
        return MockResponse(json.dumps(helper.api_preferences_data), 200)
    else:
        logger.error("Unhandled path: " + str(args[0]))
        return MockResponse(None, 404)

def handle_post(path, data):
    """This method will be used by mock to replace requests.post"""
    #print("handle_post: ", path)

    if path == 'http://lab:5080/api/v1/projects' or path == 'http://lab:5080/api/projects' :
        return MockResponse(json.dumps(helper.api_projects_data), 200)
    elif path == 'http://lab:5080/api/preferences':
        return MockResponse(json.dumps(helper.api_preferences_data), 200)
    #elif  (path == 'http://lab:5080/api/datasets' 
    #            and (data == '{"ai": ["requested"], "apikey": "aaaaa"}')):
    #    return MockResponse(json.dumps({}), 200)
    elif path == 'http://lab:5080/api/userdatasets' or path == 'http://lab:5080/api/datasets' :
        return MockResponse(json.dumps(helper.api_datasets_data), 200)
    elif path == 'http://lab:5080/api/experiments':
        return MockResponse(json.dumps(helper.api_experiments_data), 200)
    elif path == "http://lab:5080/api/v1/projects/5ba41716dfe741699222871b/experiment":
        return MockResponse(json.dumps(helper.api_launch_experiment_running), 200)
    else:
        logger.error("Unhandled path: " + str(args[0]))
        return MockResponse(None, 404)

def handle_post_bad_launch_experiment(path, data):
    """This method will be used by mock to replace requests.post"""
    #print("handle_post: ", path)

    if path == 'http://lab:5080/api/v1/projects' or path == 'http://lab:5080/api/projects' :
        return MockResponse(json.dumps(helper.api_projects_data), 200)
    elif path == 'http://lab:5080/api/preferences':
        return MockResponse(json.dumps(helper.api_preferences_data), 200)
    elif path == 'http://lab:5080/api/userdatasets' or path == 'http://lab:5080/api/datasets' :
        return MockResponse(json.dumps(helper.api_datasets_data), 200)
    elif path == 'http://lab:5080/api/experiments':
        return MockResponse(json.dumps(helper.api_experiments_data), 200)
    elif path == "http://lab:5080/api/v1/projects/5ba41716dfe741699222871b/experiment":
        return MockResponse(json.dumps(helper.api_launch_experiment_bad), 200)
    else:
        logger.error("Unhandled path: " + str(args[0]))
        return MockResponse(None, 404)


#===========================================
# Tests
#===========================================
@patch('requests.request', side_effect=mocked_requests_request)
@patch('requests.post', side_effect=mocked_requests_post)
@patch('requests.get', side_effect=mocked_requests_get)
def test_ai_init_args(mock_request, mock_post, mock_get):
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

@patch('requests.request', side_effect=mocked_requests_request)
@patch('requests.post', side_effect=mocked_requests_post)
@patch('requests.get', side_effect=mocked_requests_get)
def test_ai_init(mock_request, mock_post, mock_get):
	lab_connection_args = {}
	pennai = AI()

@patch('requests.request', side_effect=mocked_requests_request)
@patch('requests.post', side_effect=mocked_requests_post)
@patch('requests.get', side_effect=mocked_requests_get)
def test_ai_random_recommender(mock_request, mock_post, mock_get):
    lab_connection_args = {}
    pennai = AI()

@patch('requests.request', side_effect=mocked_requests_request)
@patch('requests.post', side_effect=mocked_requests_post)
@patch('requests.get', side_effect=mocked_requests_get)
@patch('requests.put', side_effect=mocked_requests_put)
@patch('time.sleep', side_effect=[None, None, SystemExit]) #Third time time.sleep() is called, SystemExit exception is raised
@patch('sys.argv', ["a", "b"])
def test_main_command_line(mock_request, mock_post, mock_get, mock_put, mock_sleep):
    testargs = ["ai"]
    with patch.object(sys, 'argv', testargs):
        aiProc = ai.ai.main()

@raises(Exception)
@patch('requests.request', side_effect=mocked_requests_request_bad_launch_experiment)
@patch('requests.post', side_effect=mocked_requests_post)
@patch('requests.get', side_effect=mocked_requests_get)
@patch('requests.put', side_effect=mocked_requests_put)
@patch('time.sleep', side_effect=[None, None, SystemExit]) #Third time time.sleep() is called, SystemExit exception is raised
@patch('sys.argv', ["a", "b"])
def test_main_command_line_queue_exception(mock_request, mock_post, mock_get, mock_put, mock_sleep):
    """
    exception should be raised when trying to parse the result launch_experiment()
    """
    testargs = ["ai"]
    with patch.object(sys, 'argv', testargs):
        aiProc = ai.ai.main()