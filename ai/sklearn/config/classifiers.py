classifier_config_dict = {

    'sklearn.tree.DecisionTreeClassifier': {
        'params': {
            'criterion': ["gini", "entropy"],
            'max_depth': [3, 5, 10],
            'min_samples_split': [2, 5, 10, 20],
            'min_samples_leaf': [1, 5, 10, 20],
            'min_weight_fraction_leaf': [0.0, 0.05, 0.1, 0.15, 0.2,  0.25, 0.3, 0.35, 0.4, 0.45],
            'max_features': ["sqrt", "log2", None]
        }

    },

    'sklearn.ensemble.GradientBoostingClassifier': {
        'params': {
            'n_estimators': [100, 500],
            'learning_rate': [0.01, 0.1, 1],
            'max_depth': [1, 3, 5, 10],
            'min_samples_split': [2, 5, 10, 20],
            'min_samples_leaf': [1, 5, 10, 20],
            'subsample': [0.5, 1],
            'max_features': ["sqrt", "log2"]
        }
    },

    'sklearn.neighbors.KNeighborsClassifier': {
        'params': {
            'n_neighbors': [1, 3, 5, 7, 9, 11],
            'weights': ["uniform", "distance"],
            'p': [1, 2]
        },
    },

    'sklearn.svm.SVC': {
        'params': {
            'kernel': ["poly", "rbf"],
            'tol': [1e-5, 1e-4, 1e-3, 1e-2, 1e-1],
            'C': [0.0001, 0.001, 0.01, 0.1, 1, 10, 100],
            'gamma': [0.0001, 0.001, 0.01, 0.1, 1, 10, 100],
            'degree': [2, 3],
            'coef0': [0.0, 0.0001, 0.001, 0.01, 0.1, 1, 10]
        },
        'static_parameters': {
            'cache_size': 700, # static_parameters
            'max_iter': 10000, # static_parameters
            'probability': True, # static_parameters
        }
    },

    'sklearn.linear_model.LogisticRegression': {
        'params': {
            'penalty': ["l1", "l2"],
            'C': [0.0001, 0.001, 0.01, 0.1, 1, 10, 100],
            'dual': [True, False],
            'fit_intercept': [True, False]
        },
        'static_parameters': {
            'solver': "liblinear",
            'multi_class': "auto",
        },
        #invalidParameterCombinations
        "invalid_params_comb" : [
            [{"penalty":"l1"}, {"dual": True}]
        ]
    },

    'sklearn.ensemble.RandomForestClassifier': {
        'params': {
            'n_estimators': [100, 500],
            'criterion': ["gini", "entropy"],
            'max_features': ["sqrt", "log2", None],
            'min_samples_split': [2, 5, 10, 20],
            'min_samples_leaf':  [1, 5, 10, 20],
            'bootstrap': [True, False],
            'min_weight_fraction_leaf': [0.0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45]
        }
    }
}
