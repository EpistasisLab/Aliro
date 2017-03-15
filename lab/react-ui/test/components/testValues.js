export const initialDatasets =  [
    {
        "name": "Gametes"
    },
    {
        "name": "Adults"
    },
    {
        "name": "Hypothyroid"
    }
];

export const initialAlgorithms = [
    {
        "name": "BernoulliNB",
        "params": {
            "alpha": {
                "help": "Additive (Laplace/Lidstone) smoothing parameter (0 for no smoothing).",
                "accepts": "float",
                "default": 1.0,
                "accepts": "int",
                "ui": {
                    "style": "radio",
                    "choices": [0.001, 0.01, 0.1, 1.0, 10.0, 100.0]
                }
            },
            "binarize": {
                "help": "Threshold for binarizing (mapping to booleans) of sample features. If None, input is presumed to already consist of binary vectors.",
                "accepts": "float",
                "default": 0.0,
                "ui": {
                    "style": "radio",
                    "choices": [0.0, 0.25, 0.5, 0.75, 1.0]
                }
            },
            "fit_prior": {
                "alias": "fit prior",
                "help": "Whether to learn class prior probabilities or not. If false, a uniform prior will be used.",
                "accepts": "bool",
                "default": "true",
                "ui": {
                    "style": "radio",
                    "choices": ["true", "false"]
                }
            }
        }
    },
    {
        "name":  "GaussianNB",
        "params": {}
    },
    {
        "name": "LinearSVC",
        "params": {
            "penalty": {
                "help": "Specifies the norm used in the penalization. The ‘l2’ penalty is the standard used in SVC. The ‘l1’ leads to coef_ vectors that are sparse.",
                "type": "string",
                "default": "l2",
                "ui": {
                    "style": "radio",
                    "choices": ["l1", "l2"]
                }
            },
            "loss": {
                "help": "Specifies the loss function. ‘hinge’ is the standard SVM loss (used e.g. by the SVC class) while ‘squared_hinge’ is the square of the hinge loss.",
                "type": "string",
                "default": "squared_hinge",
                "ui": {
                    "style": "radio",
                    "choices": ["hinge", "squared_hinge"]
                }
            },
            "dual": {
                "help": "Select the algorithm to either solve the dual or primal optimization problem. Prefer dual=False when n_samples > n_features.",
                "type": "bool",
                "default": "true",
                "ui": {
                    "style": "radio",
                    "choices": ["true", "false"]
                }
            },
            "tol": {
                "help": "Tolerance for stopping criteria.",
                "type": "float",
                "default": 0.0001,
                "ui": {
                    "style": "radio",
                    "choices": [0.00001, 0.0001, 0.001, 0.01, 0.1]
                }
            },
            "C": {
                "help": "Penalty parameter C of the error term.",
                "type": "float",
                "default": 1.0,
                "ui": {
                    "style": "radio",
                    "choices": [0.0001, 0.001, 0.01, 0.1, 0.5, 1.0, 10.0, 25.0]
                }
            }
        }
    }
];