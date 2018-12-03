"""
Mock responses from the lab api
"""
import logging
import json

logger = logging.getLogger(__name__)
logger.setLevel(logging.ERROR)



class MockResponse:
    def __init__(self, json_data, status_code):
        self.json_data = json_data
        self.status_code = status_code
        self.text = json_data

    def json(self):
        return self.json_data

#===========================================
# requests.* Mock Methods
#===========================================
def mocked_requests_request(*args, **kwargs):
    """This method will be used by mock to replace requests.request"""
    logger.info("mocked_requests: " + str(args))
    logger.debug("kwargs: " + str(kwargs))

    if(kwargs and 'data' in kwargs.keys()) :
        data = json.dumps(kwargs['data'])
    else :
        data = []

    assert (args[0] in ["POST", "GET", "PUT"])

    if (args[0] == "POST"): return handle_post(args[1], data)
    elif (args[0] == "GET"): return handle_get(args[1], data)
    elif (args[0] == "PUT"): return handle_put(args[1], data)

def mocked_requests_request_invalid_launch_experiment(*args, **kwargs):
    """This method will be used by mock to replace requests.request"""
    logger.info("mocked_requests_invalid: " + str(args))
    logger.debug("kwargs: " + str(kwargs))

    if(kwargs and 'data' in kwargs.keys()) :
        data = json.dumps(kwargs['data'])
    else :
        data = []

    assert (args[0] in ["POST", "GET", "PUT"])

    if (args[0] == "POST"): return handle_post_invalid_launch_experiment(args[1], data)
    elif (args[0] == "GET"): return handle_get(args[1], data)
    elif (args[0] == "PUT"): return handle_put(args[1], data)

def mocked_requests_put(*args, **kwargs):
    """This method will be used by mock to replace requests.put"""
    logger.info("mocked_requests_put: " + str(args[0]))
    logger.debug("kwargs: " + str(kwargs))

    if(kwargs and 'data' in kwargs.keys()) :
        data = json.dumps(kwargs['data'])
        logger.debug("data: " + data)
    else :
        data = []

    return handle_put(args[0], data)

def mocked_requests_post(*args, **kwargs):
    """This method will be used by mock to replace requests.post"""
    logger.info("mocked_requests_post: " + str(args[0]))
    logger.debug("kwargs: " + str(kwargs))

    if(kwargs and 'data' in kwargs.keys()) :
        data = json.dumps(kwargs['data'])
        logger.debug("data: " + data)
    else :
        data = []

    return handle_post(args[0], data)

def mocked_requests_get(*args, **kwargs):
    """This method will be used by mock to replace requests.get"""
    logger.info("mocked_requests_get: " + str(args[0]))
    logger.debug("kwargs: " + str(kwargs))

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
        return MockResponse(json.dumps(api_experiment_ai_on), 200)
    else:
        logger.error("Unhandled path: " + str(path))
        return MockResponse(None, 404)

def handle_get(path, data):
    """This method will be used by mock to replace requests.get"""
    # print("handle_get: ", path)

    if path == 'http://lab:5080/api/preferences':
        return MockResponse(json.dumps(api_preferences_data), 200)
    elif (path == 'http://lab:5080/api/datasets/5b58f9d506c14c003221b3f1' or 
        path =='http://lab:5080/api/datasets/5ba417507831bf002bcbd59b'):
        return MockResponse(json.dumps(api_dataset_metafeatures), 200)
    else:
        logger.error("Unhandled path: " + str(path))
        return MockResponse(None, 404)

def handle_post(path, data):
    """This method will be used by mock to replace requests.post"""
    #print("handle_post: ", path)

    if path == 'http://lab:5080/api/v1/projects' or path == 'http://lab:5080/api/projects' :
        return MockResponse(json.dumps(api_projects_data), 200)
    elif path == 'http://lab:5080/api/preferences':
        return MockResponse(json.dumps(api_preferences_data), 200)
    #elif  (path == 'http://lab:5080/api/datasets' 
    #            and (data == '{"ai": ["requested"], "apikey": "aaaaa"}')):
    #    return MockResponse(json.dumps({}), 200)
    elif path == 'http://lab:5080/api/userdatasets' or path == 'http://lab:5080/api/datasets' :
        return MockResponse(json.dumps(api_datasets_data), 200)
    elif path == 'http://lab:5080/api/experiments':
        return MockResponse(json.dumps(api_experiments_data), 200)
    elif path == "http://lab:5080/api/v1/projects/5ba41716dfe741699222871b/experiment":
        return MockResponse(json.dumps(api_launch_experiment_running), 200)
    else:
        logger.error("Unhandled path: " + str(path))
        return MockResponse(None, 404)

def handle_post_invalid_launch_experiment(path, data):
    """This method will be used by mock to replace requests.post"""
    #print("handle_post: ", path)

    if path == 'http://lab:5080/api/v1/projects' or path == 'http://lab:5080/api/projects' :
        return MockResponse(json.dumps(api_projects_data), 200)
    elif path == 'http://lab:5080/api/preferences':
        return MockResponse(json.dumps(api_preferences_data), 200)
    elif path == 'http://lab:5080/api/userdatasets' or path == 'http://lab:5080/api/datasets' :
        return MockResponse(json.dumps(api_datasets_data), 200)
    elif path == 'http://lab:5080/api/experiments':
        return MockResponse(json.dumps(api_experiments_data), 200)
    elif path == "http://lab:5080/api/v1/projects/5ba41716dfe741699222871b/experiment":
        return MockResponse(json.dumps(api_launch_experiment_invalid), 200)
    else:
        logger.error("Unhandled path: " + str(path))
        return MockResponse(None, 404)


#===========================================
# Mock lab api data
#===========================================
api_preferences_data = [
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
            }            ]
        }]

api_projects_data = [{
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
            },
            {
                    "_id": '12345',
        "name": "DecisionTreeClassifier",
        "path": "sklearn.tree",
        "description": "Classifier that assigns a class to a sample based on a chained series of yes/no queries about the sample's features.",
        "url": "http://scikit-learn.org/stable/modules/generated/sklearn.tree.DecisionTreeClassifier.html",
        "schema": {
            "criterion": {
                "description": "The function to measure the quality of a split. Supported criteria are “gini” for the Gini impurity and “entropy” for the information gain.",
                "type": "enum",
                "default": "gini",
                "ui": {
                    "style": "radio",
                    "choices": ["Gini impurity", "Information gain"],
                    "values": ["gini", "entropy"]
                }
            },
            "max_depth": {
                "description": "The maximum depth of the tree. If None, then nodes are expanded until all leaves are pure or until all leaves contain less than min_samples_split samples.",
                "type": "int",
                "default": 2,
                "ui": {
                    "style": "radio",
                    "choices": [2, 4, 6, 8]
                }
            },
            "min_samples_split": {
                "description": "The minimum number of samples required to split an internal node.",
                "type": "int",
                "default": 5,
                "ui": {
                    "style": "radio",
                    "choices": [5, 10, 20]
                }
            },
            "min_samples_leaf": {
                "description": "The minimum number of samples required to be at a leaf node.",
                "type": "int",
                "default": 5,
                "ui": {
                    "style": "radio",
                    "choices": [5, 10, 20]
                }
            }
        },
        "category": "classification"
    },
    {
            "_id": '123456',
        "name": "GradientBoostingClassifier",
        "path": "sklearn.ensemble",
        "description": "An ensemble of decision trees that are iteratively trained on the dataset to minimize classification accuracy.",
        "url": "http://scikit-learn.org/stable/modules/generated/sklearn.ensemble.GradientBoostingClassifier.html",
        "schema": {
            "n_estimators": {
                "description": "The number of boosting stages to perform. Gradient boosting is fairly robust to over-fitting so a large number usually results in better performance.",
                "type": "int",
                "default": 100,
                "ui": {
                    "style": "radio",
                    "choices": [100, 250]
                }
            },
            "learning_rate": {
                "description": "Learning rate shrinks the contribution of each tree by learning_rate. There is a trade-off between learning_rate and n_estimators.",
                "type": "float",
                "default": 0.1,
                "ui": {
                    "style": "radio",
                    "choices": [0.01, 0.1, 1]
                }
            },
            "max_depth": {
                "description": "Maximum depth of the individual regression estimators. The maximum depth limits the number of nodes in the tree. Tune this parameter for best performance; the best value depends on the interaction of the input variables.",
                "type": "int",
                "default": 1,
                "ui": {
                    "style": "radio",
                    "choices": [1, 5, 10]
                }
            },
            "min_samples_split": {
                "description": "The minimum number of samples required to split an internal node.",
                "type": "int",
                "default": 5,
                "ui": {
                    "style": "radio",
                    "choices": [5, 10, 20]
                }
            },
            "min_samples_leaf": {
                "description": "The minimum number of samples required to be at a leaf node.",
                "type": "int",
                "default": 5,
                "ui": {
                    "style": "radio",
                    "choices": [5, 10, 20]
                }
            },
            "subsample": {
                "description": "The fraction of samples to be used for fitting the individual base learners. If smaller than 1.0 this results in Stochastic Gradient Boosting. subsample interacts with the parameter n_estimators. Choosing subsample \u003c 1.0 leads to a reduction of variance and an increase in bias.",
                "type": "float",
                "default": 1,
                "ui": {
                    "style": "radio",
                    "choices": [0.5, 1]
                }
            },
            "max_features": {
                "description": "The number of features to consider when looking for the best split.",
                "type": "string",
                "default": "sqrt",
                "ui": {
                    "style": "radio",
                    "choices": ["Square root", "Log2"],
                    "values": ["sqrt", "log2"]
                }
            }
        },
        "category": "classification"
    },
    {
            "_id":'1234567',
        "name": "KNeighborsClassifier",
        "path": "sklearn.neighbors",
        "description": "Nearest-neighbor classifier that classifies new data points based on the most common class among the k nearest data points.",
        "url": "http://scikit-learn.org/stable/modules/generated/sklearn.neighbors.KNeighborsClassifier.html",
        "schema": {
            "n_neighbors": {
                "description": "Number of neighbors to use by default for k_neighbors queries.",
                "type": "int",
                "default": 5,
                "ui": {
                    "style": "radio",
                    "choices": [1, 3, 5, 7, 9, 11]
                }
            },
            "weights": {
                "description": "Weight function used in prediction.",
                "type": "string",
                "default": "uniform",
                "ui": {
                    "style": "radio",
                    "choices": ["Uniform", "Distance"],
                    "values": ["uniform", "distance"]
                }
            },
            "p": {
                "description": "Power parameter for the Minkowski metric.",
                "type": "int",
                "default": 2,
                "ui": {
                    "style": "radio",
                    "choices": [1, 2]
                }
            }
        },
        "category": "classification"
    },
    {
            "_id": '12345678',
        "name": "LogisticRegression",
        "path": "sklearn.linear_model",
        "description": "Basic logistic regression that makes predictions about the outcome based on a linear combination of the features.",
        "url": "http://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LogisticRegression.html",
        "invalidParameterCombinations" : [
            [{"penalty":"l1"}, {"dual":"true"}]
        ],
        "schema": {
            "penalty": {
                "description": "Used to specify the norm used in the penalization. The ‘newton-cg’, ‘sag’ and ‘lbfgs’ solvers support only l2 penalties.",
                "type": "string",
                "default": "l2",
                "ui": {
                    "style": "radio",
                    "choices": ["L1", "L2"],
                    "values": ["l1", "l2"]
                }
            },
            "C": {
                "description": "Inverse of regularization strength; must be a positive float. Like in support vector machines, smaller values specify stronger regularization.",
                "type": "float",
                "default": 1.0,
                "ui": {
                    "style": "radio",
                    "choices": [0.0001, 0.001, 0.01, 0.1, 0.5, 1, 10, 25]
                }
            },
            "dual": {
                "description": "Select the algorithm to either solve the dual or primal optimization problem. Prefer dual=False when n_samples \u003e n_features.",
                "type": "bool",
                "default": "false",
                "ui": {
                    "style": "radio",
                    "choices": ["True", "False"],
                    "values": ["true", "false"]
                }
            }
        },
        "category": "classification"
    },
    {
            "_id": '9837641',
        "name": "RandomForestClassifier",
        "path": "sklearn.ensemble",
        "description": "An ensemble of decision trees that are trained on random sub-samples of the dataset.",
        "url": "http://scikit-learn.org/stable/modules/generated/sklearn.ensemble.RandomForestClassifier.html",
        "schema": {
            "n_estimators": {
                "description": "The number of trees in the forest.",
                "type": "int",
                "default": 100,
                "ui": {
                    "style": "radio",
                    "choices": [100, 250]
                }
            },
            "criterion": {
                "description": "The function to measure the quality of a split. Supported criteria are “gini” for the Gini impurity and “entropy” for the information gain. Note: this parameter is tree-specific.",
                "type": "string",
                "default": "gini",
                "ui": {
                    "style": "radio",
                    "choices": ["Gini impurity", "Information gain"],
                    "values": ["gini", "entropy"]
                }
            },
            "max_features": {
                "description": "The number of features to consider when looking for the best split.",
                "type": "string",
                "default": "sqrt",
                "ui": {
                    "style": "radio",
                    "choices": ["Square root", "Log2"],
                    "values": ["sqrt", "log2"]
                }
            },
            "min_samples_split": {
                "description": "The minimum number of samples required to split an internal node.",
                "type": "int",
                "default": 5,
                "ui": {
                    "style": "radio",
                    "choices": [5, 10, 20]
                }
            },
            "min_samples_leaf": {
                "description": "The minimum number of samples required to be at a leaf node.",
                "type": "int",
                "default": 5,
                "ui": {
                    "style": "radio",
                    "choices": [5, 10, 20]
                }
            },
            "bootstrap": {
                "description": "Whether bootstrap samples are used when building trees.",
                "type": "bool",
                "default": "true",
                "ui": {
                    "style": "radio",
                    "choices": ["True", "False"],
                    "values": ["true", "false"]
                }
            }
        },
        "category": "classification"
    }

]
api_dataset_metafeatures = [{"name":"ring","metafeatures": {
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
        }}]
api_datasets_data = [
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
api_experiments_data = [
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

api_experiment_ai_on = 	[{
    	"_id": "562a12bd612a17b20f99a143"
    }]

api_launch_experiment_running = {
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
        "_status": "running",
        "_started": "2018-07-25T22:29:53.772Z"
       }

# invalid response; should return a dict, not a list
api_launch_experiment_invalid = [
	{
    	"_id": "562a12bd612a17b20f99a143"
    }]

api_launch_experiment_no_capacity = {
        "_id": "5b58f9e106c14c003221b4a0",
        "_options": {
            "criterion": "gini",
            "max_depth": 3,
            "min_samples_split": 2,
            "min_samples_leaf": 1
        },
        "error": "No machine capacity available"
       }

api_launch_experiment_error = {
        "_id": "5b58f9e106c14c003221b4a0",
        "_options": {
            "criterion": "gini",
            "max_depth": 3,
            "min_samples_split": 2,
            "min_samples_leaf": 1
        },
        "error": "An unrecoverable error occured"
       }
