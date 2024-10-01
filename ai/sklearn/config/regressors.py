"""~This file is part of the Aliro library~

Copyright (C) 2023 Epistasis Lab, 
Center for Artificial Intelligence Research and Education (CAIRE),
Department of Computational Biomedicine (CBM),
Cedars-Sinai Medical Center.

Aliro is maintained by:
    - Hyunjun Choi (hyunjun.choi@cshs.org)
    - Miguel Hernandez (miguel.e.hernandez@cshs.org)
    - Nick Matsumoto (nicholas.matsumoto@cshs.org)
    - Jay Moran (jay.moran@cshs.org)
    - and many other generous open source contributors

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.

(Autogenerated header, do not modify)

"""
regressor_config_dict = {
    'sklearn.tree.DecisionTreeRegressor': {
        'params': {
            # 'criterion': ["mse", "mae"],
            # Jay M.: names changed after scikit-learn 1.0
            'criterion': ["squared_error", "absolute_error"],
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
            # 'criterion': ["mse", "mae"],
            # Jay M.: names changed after scikit-learn 1.0
            'criterion': ["squared_error", "absolute_error"],
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
