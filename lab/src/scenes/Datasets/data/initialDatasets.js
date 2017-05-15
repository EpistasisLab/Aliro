export const initialDatasets = [
  {
    _id: '293894938',
    name: 'Gametes',
    has_metadata: true,
    ai: true,
    best_result: {
      _id: '103984903',
      algorithm: 'Linear Regression',
      accuracy_score: 0.72
    },
    experiments: {
      pending: 15,
      running: 2,
      finished: 267
    },
    notifications: {
      new: 5,
      error: 1
    }
  },
  {
    _id: '239201303',
    name: 'Thyroid',
    has_metadata: true,
    ai: false,
    best_result: {
      _id: '928392293',
      algorithm: 'Random Forest',
      accuracy_score: 0.42
    },
    experiments: {
      pending: 2,
      running: 5, 
      finished: 15
    },
    notifications: {
      new: 0,
      error: 1
    }
  },
  {
    _id: '129003021',
    name: 'Adults',
    has_metadata: true,
    ai: true,
    best_result: {
      _id: '983748834',
      algorithm: 'Gradient Boosting',
      accuracy_score: 0.94
    },
    experiments: {
      pending: 27,
      running: 20,
      finished: 462
    },
    notifications: {
      new: 11,
      error: 0
    }
  },
  {
    _id: '929993098',
    name: 'Heart',
    has_metadata: true,
    ai: false,
    best_result: {
      _id: '293993203',
      algorithm: 'Support Vector Machine',
      accuracy_score: 0.33
    },
    experiments: {
      pending: 0,
      running: 0,
      finished: 26
    },
    notifications: {
      new: 0,
      error: 0
    }
  },
  {
    _id: '879654098',
    name: 'Breast Cancer',
    ai: false,
    has_metadata: false,
    best_result: undefined,
    experiments: {
      pending: 0,
      running: 0,
      finished: 0
    },
    notifications: {
      new: 0,
      error: 0
    }
  },
  {
    _id: '293203002',
    name: 'Hepatitis',
    ai: true,
    has_metadata: true,
    best_result: undefined,
    experiments: {
      pending: 0,
      running: 0,
      finished: 0
    },
    notifications: {
      new: 0,
      error: 0
    }
  }
];