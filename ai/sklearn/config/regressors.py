regressor_config_dict = {
    'sklearn.tree.DecisionTreeRegressor': {
        'params': {
            'criterion': ["mse", "mae"],
            'max_depth': [3, 5, 10],
            'min_samples_split': [2, 5, 10, 20],
            'min_samples_leaf': [1, 5, 10, 20],
            'min_weight_fraction_leaf': [0.0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45],
            'max_features': ["sqrt", "log2", None]
        }
    },

    'sklearn.ensemble.RandomForestRegressor': {
        'params': {
            'n_estimators': [100, 500],
            'criterion': ["mse", "mae"],
            'max_features': ["sqrt", "log2"],
            'min_samples_split': [2, 5, 10, 20],
            'min_samples_leaf':  [1, 5, 10, 20],
            'bootstrap': [True, False],
            'min_weight_fraction_leaf': [0.0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45]
        }
    },

    'sklearn.svm.SVR': {
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
        }
    },


    'sklearn.neighbors.KNeighborsRegressor': {
        'params': {
            'n_neighbors': [1, 3, 5, 7, 9, 11],
            'weights': ["uniform", "distance"],
            'p': [1, 2]
        }
    },

    'sklearn.kernel_ridge.KernelRidge': {
        'params': {
            'alpha': [0.001, 0.01, 0.1, 1],
            'gamma': [0.0001, 0.001, 0.01, 0.1, 1, 10, 100]
        },
        'static_parameters': {
            'kernel': "rbf"
        }
    },

    'xgboost.XGBRegressor': {
        'params': {
            'n_estimators': [100, 500],
            'learning_rate': [0.01, 0.1, 1],
            'max_depth': [1, 3, 5, 10],
            'min_child_weight': [1, 3, 5, 10, 20],
            'subsample': [0.5, 1],
        },
        'static_parameters': {
            'objective': "reg:squarederror"
        }
    },

    'sklearn.ensemble.GradientBoostingRegressor': {
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
}
