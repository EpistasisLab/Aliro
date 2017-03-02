/*
 * action types
 */

export const SET_DATASETS = 'SET_DATASETS';
export const SET_CURRENT_DATASET = 'SET_CURRENT_DATASET';
export const SET_ALGORITHMS = 'SET ALGORITHMS';
export const SET_CURRENT_ALGORITHM = 'SET_CURRENT_ALGORITHM';
export const SET_CURRENT_LEVEL = 'SET_CURRENT_LEVEL';
export const SET_PARAMETER_VALUE = 'SET_PARAMETER_VALUE';

/*
 * other constants
 */

export const Levels = {
  BASIC: 'BASIC',
  ADVANCED: 'ADVANCED',
  GRID: 'GRID',
  RANDOM: 'RANDOM'
};

/*
 * action creators
 */

export const setDatasets = (datasets) => {
    return {
        type: SET_DATASETS,
        datasets
    }
};

export const setCurrentDataset = (currentDataset) => {
    return {
        type: SET_CURRENT_DATASET,
        currentDataset
    }
};

export const setAlgorithms = (algorithms) => {
    return {
        type: SET_ALGORITHMS,
        algorithms
    }
};

export const setCurrentAlgorithm = (currentAlgorithm) => {
    return {
        type: SET_CURRENT_ALGORITHM,
        currentAlgorithm
    }
};

export const setCurrentLevel = (currentLevel) => {
    return {
        type: SET_CURRENT_LEVEL,
        currentLevel
    }
};

export const setParameterValue = (param, value) => {
    return {
        type: SET_PARAMETER_VALUE,
        param,
        value
    }
};