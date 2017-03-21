export const currentAlgorithmParams = {
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
};

export const currentAlgorithmNoParams = {
    "name":  "GaussianNB",
    "params": {}
};