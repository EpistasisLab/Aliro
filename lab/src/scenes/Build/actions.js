require('es6-promise').polyfill();
import fetch from 'isomorphic-fetch';

/*
 * action types
 */

export const SET_DATASETS = 'SET_DATASETS';
export const SET_CURRENT_DATASET = 'SET_CURRENT_DATASET';
export const SET_ALGORITHMS = 'SET ALGORITHMS';
export const SET_CURRENT_ALGORITHM = 'SET_CURRENT_ALGORITHM';
export const SET_CURRENT_LEVEL = 'SET_CURRENT_LEVEL';
export const SET_PARAMETER_VALUE = 'SET_PARAMETER_VALUE';

export const REQUEST_ALGORITHMS = 'REQUEST_ALGORITHMS';
export const RECEIVE_ALGORITHMS = 'RECEIVE_ALGORITHMS';

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

export const requestAlgorithms = () => {
    return {
        type: REQUEST_ALGORITHMS
    }
};

export const receiveAlgorithms = (json) => {
    return {
        type: RECEIVE_ALGORITHMS,
        algorithms: json,
        receivedAt: Date.now()
    }
};

export const fetchAlgorithms = () => {
    //const route = 'http://localhost:5080/api/v1/projects';
    const route = 'api/v1/projects';

    return function(dispatch) {
        dispatch(requestAlgorithms());
        return fetch(route)
            .then(response => response.json())
            .then(json =>
                dispatch(receiveAlgorithms(json))
            );
    }
};
