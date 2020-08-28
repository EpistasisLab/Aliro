"""This file is part of the PennAI library.

Copyright (C) 2017 Epistasis Lab, University of Pennsylvania

PennAI is maintained by:
    - Heather Williams (hwilli@upenn.edu)
    - Weixuan Fu (weixuanf@pennmedicine.upenn.edu)
    - William La Cava (lacava@upenn.edu)
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

"""
# Python version: 3.6.5 |Anaconda, Inc.| (default, Apr 29 2018, 16:14:56) [GCC 7.2.0]
# Results were generated with numpy v1.15.1, pandas v0.23.4 and scikit-learn v0.19.1
# random seed = 42
# Training dataset filename = iris.csv
# Pickle filename = model_5bff04d5758a07002ce3b3bf.pkl
# Model in the pickle file: RandomForestClassifier(bootstrap=True, class_weight='balanced',
#            criterion='entropy', max_depth=None, max_features='sqrt',
#            max_leaf_nodes=None, min_impurity_decrease=0.0,
#            min_impurity_split=None, min_samples_leaf=20,
#            min_samples_split=5, min_weight_fraction_leaf=0.0,
#            n_estimators=100, n_jobs=1, oob_score=False, random_state=42,
#            verbose=0, warm_start=False)
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.externals import joblib
from sklearn.utils import check_X_y
from sklearn.metrics import make_scorer

# NOTE: Edit variables below with appropriate values
# path to your pickle file, below is the downloaded pickle file
pickle_file = 'model_5bff04d5758a07002ce3b3bf.pkl'
# file path to the dataset
dataset = 'iris.csv'
# target column name
target_column = 'class'
# seed to be used for train_test_split (default in PennAI is 42)
seed = 42

# Balanced accuracy below was described in [Urbanowicz2015]: the average of sensitivity and specificity is computed for each class and then averaged over total number of classes.
# It is NOT the same as sklearn.metrics.balanced_accuracy_score, which is defined as the average of recall obtained on each class.
def balanced_accuracy(y_true, y_pred):
    all_classes = list(set(np.append(y_true, y_pred)))
    all_class_accuracies = []
    for this_class in all_classes:
        this_class_sensitivity = 0.
        this_class_specificity = 0.
        if sum(y_true == this_class) != 0:
            this_class_sensitivity = \
                float(sum((y_pred == this_class) & (y_true == this_class))) /\
                float(sum((y_true == this_class)))
            this_class_specificity = \
                float(sum((y_pred != this_class) & (y_true != this_class))) /\
                float(sum((y_true != this_class)))
        this_class_accuracy = (this_class_sensitivity +
                               this_class_specificity) / 2.
        all_class_accuracies.append(this_class_accuracy)
    return np.mean(all_class_accuracies)

# load fitted model
pickle_model = joblib.load(pickle_file)
model = pickle_model['model']

# read input data
input_data = pd.read_csv(dataset, sep=None, engine='python', dtype=np.float64)

# Application 1: reproducing training score and testing score from PennAI
features = input_data.drop(target_column, axis=1).values
target = input_data[target_column].values
# Checking dataset
features, target = check_X_y(features, target, dtype=np.float64, order="C", force_all_finite=True)
training_features, testing_features, training_classes, testing_classes = \
    train_test_split(features, target, random_state=seed, stratify=input_data[target_column])
scorer = make_scorer(balanced_accuracy)
train_score = scorer(model, training_features, training_classes)
print("Training score: ", train_score)
test_score = scorer(model, testing_features, testing_classes)
print("Testing score: ", test_score)


# Application 2: cross validation of fitted model
testing_features = input_data.drop(target_column, axis=1).values
testing_target = input_data[target_column].values
# Get holdout score for fitted model
print("Holdout score: ", end="")
print(model.score(testing_features, testing_target))


# Application 3: predict outcome by fitted model
# In this application, the input dataset may not include target column
input_data.drop(target_column, axis=1, inplace=True) # Please comment this line if there is no target column in input dataset
predict_target = model.predict(input_data.values)
