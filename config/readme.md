# Environment Configuration

# Algorithm Configuration
Machine learning algorithm parameters and UI settings are defined in `/dockers/dbmongo/files/projects.json`

## Schema
```
{
    "name": "<algorithm name>",
    "path": "<import path from scikit-learn or package following scikit-learn API>"
    "description": "<algorithm description>",
    "url": "<documentation url>",
    "category": "<classification or regression>"
    "invalidParameterCombinations": [
        <optional; lists of arrays of invalid parameter combinations.  array keys must be valid parameter names, array values must be valid parameter values>
    ]
    "schema": {
        "<parameter 1 name>": {
            "description": "<parameter description>",
            "type": "<one of: (float, int, string, bool).  how the algorithm will cast the parameter value>",
            "default": "<default value> Used to set the default UI value, must match one of the return values",
            "ui": {
                "style": <one of ('array')>,
                "choices": <array of parameter values to be displayed in the ui.  If 'values' is not specified, the return value is the same as the display value. Can be any fundamental type; string, int, float, bool etc.>,
                "values": <optional; array of values to be returned by the ui.  Only necessary if the return value is different then the display values.  Can be any fundamental type; string, int, float, bool etc.>
            }
        },
        {
            ...param 2...
        }
    }
}
{
  ...algo 2...
}
```

## Example
```
{
    "name": "LinearSVC",
    "path": "sklearn.svm",
    "description": "Linear Support Vector Classification.",
    "url": "http://scikit-learn.org/stable/modules/generated/sklearn.svm.LinearSVC.html",
    "invalidParameterCombinations" : [
        [{"penalty":"l2"}, {"loss":"hinge"}, {"dual":"false"}],
        [{"penalty":"l1"}, {"loss":"square_hinge"}, {"dual":"true"}],
        [{"penalty":"l1"}, {"loss":"hinge"}]
    ],
    "schema": {
        "penalty": {
            "description": "Specifies the norm used in the penalization. The ‘l2’ penalty is the standard used in SVC. The ‘l1’ leads to coef_ vectors that are sparse.",
            "type": "string",
            "default": "l2",
            "ui": {
                "style": "radio",
                "choices": ["L1", "L2"],
                "values": ["l1", "l2"]
            }
        },
        "loss": {
            "description": "Specifies the loss function. ‘hinge’ is the standard SVM loss (used e.g. by the SVC class) while ‘squared_hinge’ is the square of the hinge loss.",
            "type": "string",
            "default": "squared_hinge",
            "ui": {
                "style": "radio",
                "choices": ["Hinge", "Squared hinge"],
                "values": ["hinge", "squared_hinge"]
            }
        },
        "dual": {
            "description": "Select the algorithm to either solve the dual or primal optimization problem. Prefer dual=False when n_samples \u003e n_features.",
            "type": "bool",
            "default": "true",
            "ui": {
                "style": "radio",
                "choices": ["True", "False"],
                "values": ["true", "false"]
            }
        },
        "tol": {
            "description": "Tolerance for stopping criteria.",
            "type": "float",
            "default": 0.0001,
            "ui": {
                "style": "radio",
                "choices": [1e-05, 0.0001, 0.001, 0.01, 0.1]
            }
        },
        "C": {
            "description": "Penalty parameter C of the error term.",
            "type": "float",
            "default": 1,
            "ui": {
                "style": "radio",
                "choices": [0.0001, 0.001, 0.01, 0.1, 0.5, 1, 10, 25]
            }
        }
    },
    "category": "classification"
} 
```
