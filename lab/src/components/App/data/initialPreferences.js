export const initialPreferences = {
"_id": "58c9a40915f1e8675d319730",
"username": "testuser",
"firstname": "Test",
"lastname": "User",
"algorithms": [
{
"_id": "5817af52382153354043496e",
"name": "RandomForestClassifier",
"schema": {
"n_estimators": {
"description": "The number of trees in the forest.",
"type": "int",
"default": 100,
"ui": {
"style": "radio",
"choices": [
10,
100,
500,
1000
]
}
},
"criterion": {
"description": "The function to measure the quality of a split. Supported criteria are “gini” for the Gini impurity and “entropy” for the information gain. Note: this parameter is tree-specific.",
"type": "string",
"default": "gini",
"ui": {
"style": "radio",
"choices": [
"gini",
"entropy"
]
}
},
"max_features": {
"description": "The number of features to consider when looking for the best split.",
"type": "string",
"default": "sqrt",
"ui": {
"style": "radio",
"choices": [
"sqrt",
"log2",
"None"
]
}
},
"min_samples_split": {
"description": "The minimum number of samples required to split an internal node.",
"type": "int",
"default": 2,
"ui": {
"style": "radio",
"choices": [
2,
5,
10,
15,
20
]
}
},
"min_samples_leaf": {
"description": "The minimum number of samples required to be at a leaf node.",
"type": "int",
"default": 1,
"ui": {
"style": "radio",
"choices": [
1,
5,
10,
15,
20
]
}
},
"bootstrap": {
"description": "Whether bootstrap samples are used when building trees.",
"type": "bool",
"default": true,
"ui": {
"style": "radio",
"choices": [
true,
false
]
}
}
},
"category": "ML"
},
{
"_id": "581796a43821533540434890",
"name": "GradientBoostingClassifier",
"schema": {
"n_estimators": {
"description": "The number of boosting stages to perform. Gradient boosting is fairly robust to over-fitting so a large number usually results in better performance.",
"type": "int",
"default": 100,
"ui": {
"style": "radio",
"choices": [
10,
100,
500,
1000
]
}
},
"learning_rate": {
"description": "Learning rate shrinks the contribution of each tree by learning_rate. There is a trade-off between learning_rate and n_estimators.",
"type": "float",
"default": 0.1,
"ui": {
"style": "radio",
"choices": [
0.001,
0.01,
0.1,
0.5,
1
]
}
},
"max_depth": {
"description": "Maximum depth of the individual regression estimators. The maximum depth limits the number of nodes in the tree. Tune this parameter for best performance; the best value depends on the interaction of the input variables.",
"type": "int",
"default": 3,
"ui": {
"style": "radio",
"choices": [
1,
3,
5,
7,
9,
"None"
]
}
},
"min_samples_split": {
"description": "The minimum number of samples required to split an internal node.",
"type": "int",
"default": 2,
"ui": {
"style": "radio",
"choices": [
2,
5,
10,
15,
20
]
}
},
"min_samples_leaf": {
"description": "The minimum number of samples required to be at a leaf node.",
"type": "int",
"default": 1,
"ui": {
"style": "radio",
"choices": [
1,
5,
10,
15,
20
]
}
},
"subsample": {
"description": "The fraction of samples to be used for fitting the individual base learners. If smaller than 1.0 this results in Stochastic Gradient Boosting. subsample interacts with the parameter n_estimators. Choosing subsample < 1.0 leads to a reduction of variance and an increase in bias.",
"type": "float",
"default": 1,
"ui": {
"style": "radio",
"choices": [
0.05,
0.25,
0.5,
0.75,
1
]
}
},
"max_features": {
"description": "The number of features to consider when looking for the best split.",
"type": "string",
"default": "None",
"ui": {
"style": "radio",
"choices": [
"sqrt",
"log2",
"None"
]
}
}
},
"category": "ML"
},
{
"_id": "5817a73538215335404348ee",
"name": "LinearSVC",
"schema": {
"penalty": {
"description": "Specifies the norm used in the penalization. The ‘l2’ penalty is the standard used in SVC. The ‘l1’ leads to coef_ vectors that are sparse.",
"type": "string",
"default": "l2",
"ui": {
"style": "radio",
"choices": [
"l1",
"l2"
]
}
},
"loss": {
"description": "Specifies the loss function. ‘hinge’ is the standard SVM loss (used e.g. by the SVC class) while ‘squared_hinge’ is the square of the hinge loss.",
"type": "string",
"default": "squared_hinge",
"ui": {
"style": "radio",
"choices": [
"hinge",
"squared_hinge"
]
}
},
"dual": {
"description": "Select the algorithm to either solve the dual or primal optimization problem. Prefer dual=False when n_samples > n_features.",
"type": "bool",
"default": true,
"ui": {
"style": "radio",
"choices": [
true,
false
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
"_id": "5817ad7f3821533540434948",
"name": "LogisticRegression",
"schema": {
"penalty": {
"description": "Used to specify the norm used in the penalization. The ‘newton-cg’, ‘sag’ and ‘lbfgs’ solvers support only l2 penalties.",
"type": "string",
"default": "l2",
"ui": {
"style": "radio",
"choices": [
"l1",
"l2"
]
}
},
"C": {
"description": "Inverse of regularization strength; must be a positive float. Like in support vector machines, smaller values specify stronger regularization.",
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
},
"dual": {
"description": "Select the algorithm to either solve the dual or primal optimization problem. Prefer dual=False when n_samples > n_features.",
"type": "bool",
"default": false,
"ui": {
"style": "radio",
"choices": [
true,
false
]
}
}
},
"category": "ML"
},
{
"_id": "5817a21138215335404348cd",
"name": "KNeighborsClassifier",
"schema": {
"n_neighbors": {
"description": "Number of neighbors to use by default for k_neighbors queries.",
"type": "int",
"default": 5,
"ui": {
"style": "radio",
"choices": [
1,
3,
5,
7,
9,
11
]
}
},
"weights": {
"description": "Weight function used in prediction.",
"type": "string",
"default": "uniform",
"ui": {
"style": "radio",
"choices": [
"uniform",
"distance"
]
}
},
"p": {
"description": "Power parameter for the Minkowski metric.",
"type": "int",
"default": 2,
"ui": {
"style": "radio",
"choices": [
1,
2
]
}
}
},
"category": "ML"
},
{
"_id": "5817660338215335404347c7",
"name": "DecisionTreeClassifier",
"schema": {
"criterion": {
"description": "The function to measure the quality of a split. Supported criteria are “gini” for the Gini impurity and “entropy” for the information gain.",
"type": "enum",
"values": [
"gini",
"entropy"
],
"default": "gini",
"ui": {
"style": "radio",
"choices": [
"gini",
"entropy"
]
}
},
"max_depth": {
"description": "The maximum depth of the tree. If None, then nodes are expanded until all leaves are pure or until all leaves contain less than min_samples_split samples.",
"type": "int",
"default": "None",
"ui": {
"style": "radio",
"choices": [
1,
3,
5,
7,
9,
"None"
]
}
},
"min_samples_split": {
"description": "The minimum number of samples required to split an internal node.",
"type": "int",
"default": 2,
"ui": {
"style": "radio",
"choices": [
2,
5,
10,
15,
20
]
}
},
"min_samples_leaf": {
"description": "The minimum number of samples required to be at a leaf node.",
"type": "int",
"default": 1,
"ui": {
"style": "radio",
"choices": [
1,
5,
10,
15,
20
]
}
}
},
"category": "ML"
}
]
};