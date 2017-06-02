export const initialExperiment = {
  _id: '293894938',
  dataset: {
     _id: 293894938,
    name: 'Gametes'
  },
  algorithm: {
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
  params: {
    n_estimators: 1000,
    learning_rate: 1e-2,
    max_depth: 7,
    min_impurity_split: 1e-1,
    subsample: 0.05,
    max_features: 'log2'
  },
  run: {
  	started: 1495484890013,
  	finished: 1495485103872,
  	launched_by: 'ai'
  },
  scores: {
  	testing_accuracy: 0.68,
  	training_accuracy: 0.78,
  	AUC: 0.96
  }
};