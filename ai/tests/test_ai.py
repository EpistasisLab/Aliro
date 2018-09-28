import os
os.environ["LAB_HOST"] = "lab"
os.environ['LAB_PORT'] = "5080"
os.environ['APIKEY'] = "aaaaa"

from ai.ai import AI
import ai.ai
import sys
import json
from unittest.mock import Mock, patch

class MockResponse:
    def __init__(self, json_data, status_code):
        self.json_data = json_data
        self.status_code = status_code
        self.text = json_data

    def json(self):
        return self.json_data

def mocked_requests_put(*args, **kwargs):
    """This method will be used by mock to replace requests.post"""
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


# This method will be used by the mock to replace requests.get
def mocked_requests_get(*args, **kwargs):
    print("mocked_requests_get: " + str(args[0]))
    if args[0] == 'http://lab:5080/api/preferences':
        json_data = [
    {
        "_id": "5ba41716dfe741699222870f",
        "username": "testuser",
        "firstname": "Test",
        "lastname": "User",
        "algorithms": [
            {
                "_id": "5ba41716dfe741699222871b",
                "name": "SVC",
                "description": "Kernel-based classifier that maps the data into a high-dimesional space then constructs a hyperplane that maximally separates the classes in that high-dimesional space.",
                "url": "http://scikit-learn.org/stable/modules/generated/sklearn.svm.SVC.html",
                "schema": {
                    "kernel": {
                        "description": "Specifies the kernel type to be used in the algorithm",
                        "type": "string",
                        "default": "rbf",
                        "ui": {
                            "style": "radio",
                            "choices": [
                                "Polynomial",
                                "Radial basis function"
                            ],
                            "values": [
                                "poly",
                                "rbf"
                            ]
                        }
                    },
                    "tol": {
                        "description": "Tolerance for stopping criteria.",
                        "type": "float",
                        "default": 0.0001,
                        "ui": {
                            "style": "radio",
                            "choices": [
                                0.00001,
                                0.0001,
                                0.001,
                                0.01,
                                0.1
                            ]
                        }
                    },
                    "C": {
                        "description": "Penalty parameter C of the error term.",
                        "type": "float",
                        "default": 1,
                        "ui": {
                            "style": "radio",
                            "choices": [
                                0.0001,
                                0.001,
                                0.01,
                                0.1,
                                0.5,
                                1,
                                10,
                                25
                            ]
                        }
                    }
                },
                "category": "ML"
            }
            ]
        }]
        return MockResponse(json.dumps(json_data), 200)
    else:
        return MockResponse(None, 404)


# This method will be used by the mock to replace requests.get
def mocked_requests_post(*args, **kwargs):
    print("mocked_requests_post: " + str(args[0]))
    print("kwargs: " + str(kwargs))
    if(kwargs and 'data' in kwargs.keys()) :
        data = json.dumps(kwargs['data'])
    else :
        data = []

    print("data: " + data)

    if args[0] == 'http://lab:5080/api/v1/projects' or args[0] == 'http://lab:5080/api/projects' :
        json_data = [{
                "_id": "5ba41716dfe741699222871b",
                "name": "SVC",
                "description": "Kernel-based classifier that maps the data into a high-dimesional space then constructs a hyperplane that maximally separates the classes in that high-dimesional space.",
                "url": "http://scikit-learn.org/stable/modules/generated/sklearn.svm.SVC.html",
                "schema": {
                    "kernel": {
                        "description": "Specifies the kernel type to be used in the algorithm",
                        "type": "string",
                        "default": "rbf",
                        "ui": {
                            "style": "radio",
                            "choices": [
                                "Polynomial",
                                "Radial basis function"
                            ],
                            "values": [
                                "poly",
                                "rbf"
                            ]
                        }
                    },
                    "tol": {
                        "description": "Tolerance for stopping criteria.",
                        "type": "float",
                        "default": 0.0001,
                        "ui": {
                            "style": "radio",
                            "choices": [
                                0.00001,
                                0.0001,
                                0.001,
                                0.01,
                                0.1
                            ]
                        }
                    },
                    "C": {
                        "description": "Penalty parameter C of the error term.",
                        "type": "float",
                        "default": 1,
                        "ui": {
                            "style": "radio",
                            "choices": [
                                0.0001,
                                0.001,
                                0.01,
                                0.1,
                                0.5,
                                1,
                                10,
                                25
                            ]
                        }
                    }
                },
                "category": "ML"
            }]
        return MockResponse(json.dumps(json_data), 200)
    elif args[0] == 'http://lab:5080/api/preferences':
        json_data = [
    {
        "_id": "5ba41716dfe741699222870f",
        "username": "testuser",
        "firstname": "Test",
        "lastname": "User",
        "algorithms": [
            {
                "_id": "5ba41716dfe741699222871b",
                "name": "SVC",
                "description": "Kernel-based classifier that maps the data into a high-dimesional space then constructs a hyperplane that maximally separates the classes in that high-dimesional space.",
                "url": "http://scikit-learn.org/stable/modules/generated/sklearn.svm.SVC.html",
                "schema": {
                    "kernel": {
                        "description": "Specifies the kernel type to be used in the algorithm",
                        "type": "string",
                        "default": "rbf",
                        "ui": {
                            "style": "radio",
                            "choices": [
                                "Polynomial",
                                "Radial basis function"
                            ],
                            "values": [
                                "poly",
                                "rbf"
                            ]
                        }
                    },
                    "tol": {
                        "description": "Tolerance for stopping criteria.",
                        "type": "float",
                        "default": 0.0001,
                        "ui": {
                            "style": "radio",
                            "choices": [
                                0.00001,
                                0.0001,
                                0.001,
                                0.01,
                                0.1
                            ]
                        }
                    },
                    "C": {
                        "description": "Penalty parameter C of the error term.",
                        "type": "float",
                        "default": 1,
                        "ui": {
                            "style": "radio",
                            "choices": [
                                0.0001,
                                0.001,
                                0.01,
                                0.1,
                                0.5,
                                1,
                                10,
                                25
                            ]
                        }
                    }
                },
                "category": "ML"
            }
        	]
        }]
        return MockResponse(json.dumps(json_data), 200)
    #elif  (args[0] == 'http://lab:5080/api/datasets' 
    #            and (kwargs['data'] == '{"ai": ["requested"], "apikey": "aaaaa"}')):
    #    return MockResponse(json.dumps({}), 200)
    elif args[0] == 'http://lab:5080/api/userdatasets' or args[0] == 'http://lab:5080/api/datasets' :
        json_data = [
    {
        "_id": "5ba417507831bf002bcbd59b",
        "name": "ring",
        "username": "testuser",
        "files": [
            {
                "_id": "5ba417877831bf002bcbd5bc",
                "filename": "ring.csv",
                "mimetype": "text/csv",
                "timestamp": 1537480600060
            }
        ],
        "metafeatures": {
            "class_prob_max": 0.5048648648648648,
            "class_prob_mean": 0.5,
            "class_prob_median": 0.5,
            "class_prob_min": 0.49513513513513513,
            "class_prob_std": 0.006879957871004215,
            "corr_with_dependent_abs_25p": None,
            "corr_with_dependent_abs_75p": None,
            "corr_with_dependent_abs_kurtosis": None,
            "corr_with_dependent_abs_max": None,
            "corr_with_dependent_abs_mean": None,
            "corr_with_dependent_abs_median": None,
            "corr_with_dependent_abs_min": None,
            "corr_with_dependent_abs_skew": None,
            "corr_with_dependent_abs_std": None,
            "diversity_fraction": 0.9999526665530977,
            "entropy_dependent": 0.6930998459927801,
            "kurtosis_kurtosis": -0.9915257694367137,
            "kurtosis_max": 1.714405525037348,
            "kurtosis_mean": 1.505773348593862,
            "kurtosis_median": 1.510528474478538,
            "kurtosis_min": 1.3155491270314172,
            "kurtosis_skew": 0.10360978421877708,
            "kurtosis_std": 0.11362077825636065,
            "n_categorical": 0,
            "n_classes": 2,
            "n_columns": 21,
            "n_numerical": 20,
            "n_rows": 7400,
            "pca_fraction_95": 0.95,
            "ratio_rowcol": 352.3809523809524,
            "skew_kurtosis": 1.4275988915248297,
            "skew_max": -0.12182524123703901,
            "skew_mean": -0.23381089497140187,
            "skew_median": -0.24180172281195894,
            "skew_min": -0.3115874555709863,
            "skew_skew": 1.0380508092829852,
            "skew_std": 0.04283907774210813,
            "symbols_kurtosis": None,
            "symbols_max": None,
            "symbols_mean": None,
            "symbols_min": None,
            "symbols_skew": None,
            "symbols_std": None,
            "symbols_sum": None
        },
        "ai": "off",
        "has_metadata": True,
        "experiments": {
            "pending": 0,
            "running": 0,
            "finished": 0
        },
        "notifications": {
            "new": 0,
            "error": 0
        }
    }]
        return MockResponse(json.dumps(json_data), 200)
    elif args[0] == 'http://lab:5080/api/experiments':
        json_data = [
    {
        "_id": "5b58f9e106c14c003221b4a0",
        "_options": {
            "criterion": "gini",
            "max_depth": 3,
            "min_samples_split": 2,
            "min_samples_leaf": 1
        },
        "_dataset_id": "5b58f9d506c14c003221b3f1",
        "_project_id": "5b58f99db7941fabb1921e76",
        "_machine_id": "5b58f9d106c14c003221b3bb",
        "username": "testuser",
        "files": [
            {
                "_id": "5b58f9d506c14c003221b416",
                "filename": "adult.csv",
                "mimetype": "text/csv",
                "timestamp": 1532557783791
            }
        ],
        "_status": "success",
        "_started": "2018-07-25T22:29:53.772Z",
        "feature_names": [
            "age",
            "workclass",
            "fnlwgt",
            "education",
            "education-num",
            "marital-status",
            "occupation",
            "relationship",
            "race",
            "sex",
            "capital-gain",
            "capital-loss",
            "hours-per-week",
            "native-country"
        ],
        "feature_importances": [
            0,
            0,
            0,
            0,
            0.13651453065421976,
            0,
            0,
            0.6905689425662924,
            0,
            0,
            0.17291652677948785,
            0,
            0,
            0
        ],
        "_finished": "2018-07-25T22:30:11.551Z",
        "cnf_matrix": [
            [
                2134,
                788
            ],
            [
                1544,
                7745
            ]
        ],
        "class_names": [
            0,
            1
        ],
        "fpr": [
            0,
            0.10574948665297741,
            0.26967830253251196,
            0.29603011635865845,
            0.4996577686516085,
            0.5670773442847364,
            0.9356605065023956,
            0.9722792607802875,
            1
        ],
        "tpr": [
            0,
            0.6673484766928626,
            0.8337818925610938,
            0.8501453331897943,
            0.9308859941866724,
            0.9458499300247605,
            0.9954785229841748,
            0.9996770373560125,
            1
        ],
        "roc_auc_score": 0.8471272019652751,
        "_scores": {
            "train_score": 0.7834103139427467,
            "test_score": 0.7820517950142909,
            "accuracy_score": 0.7820517950142909,
            "precision_score": 0.9076526426813547,
            "recall_score": 0.8337818925610938,
            "f1_score": 0.8691504881607002,
            "roc_auc_score": 0.8471272019652751,
            "cv_scores_mean": 0.7820172531844529,
            "cv_scores_std": 0.004985773325245799,
            "cv_scores": [
                0.7863307168745117,
                0.7885698803077219,
                0.7756285423496405,
                0.7822186139287611,
                0.7773385124616292
            ]
        }
    }
]
        return MockResponse(json.dumps(json_data), 200)
    elif args[0] == "http://lab:5080/api/v1/projects/5ba41716dfe741699222871b/experiment":
        json_data = {
                  "_id": "562a12bd612a17b20f99a143"
                }
        return MockResponse(json.dumps(json_data), 200)
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
def test_main(mock_post, mock_get, mock_put, mock_sleep):
    testargs = ["ai"]
    with patch.object(sys, 'argv', testargs):
        aiProc = ai.ai.main()