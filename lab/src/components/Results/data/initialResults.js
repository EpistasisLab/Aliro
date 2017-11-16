export const initialResults = {
  _id: '293894938',
  dataset: {
     _id: 293894938,
    name: 'Gametes'
  },
  algorithm: {
    _id: 293849228,
    name: 'Gradient Boosting',
    params: {
    n_estimators: 100,
    learning_rate: 1e-2,
    max_depth: 7,
    min_impurity_split: 1e-1,
    subsample: 0.05,
    max_features: 'log2'
   }
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