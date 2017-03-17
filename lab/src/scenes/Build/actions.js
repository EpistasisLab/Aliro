require('es6-promise').polyfill();
import fetch from 'isomorphic-fetch';

/*
 * action types
 */

export const SET_PREFERENCES = 'SET_PREFERENCES';
export const REQUEST_PREFERENCES = 'REQUEST_PREFERENCES';
export const RECEIVE_PREFERENCES = 'RECEIVE_PREFERENCES';
export const REQUEST_ALGORITHMS = 'REQUEST_ALGORITHMS';
export const RECEIVE_ALGORITHMS = 'RECEIVE_ALGORITHMS';
export const SET_CURRENT_DATASET = 'SET_CURRENT_DATASET';
export const SET_CURRENT_ALGORITHM = 'SET_CURRENT_ALGORITHM';
export const SET_PARAMETER_VALUE = 'SET_PARAMETER_VALUE';

/*
 * action creators
 */

const local = true;
const localAddr = 'http://localhost:5080/';
const apiAddr = 'api/v1/';

export const setPreferences = (preferences) => {
    return {
        type: SET_PREFERENCES,
        preferences
    }
};

export const requestPreferences = () => {
    return {
        type: REQUEST_PREFERENCES
    }
};

export const receivePreferences = (json) => {
    return {
        type: RECEIVE_PREFERENCES,
        preferences: json[0], // change this when preferences route is fixed
        receivedAt: Date.now()
    }
};

export const fetchPreferences = () => {
    const route = local ? localAddr + apiAddr + 'preferences' : apiAddr + 'preferences';
    //const route = 'api/v1/preferences';

    return function(dispatch) {
        dispatch(requestPreferences());
        return fetch(route)
            .then(response => response.json())
            .then(json =>
                dispatch(receivePreferences(json))
            );
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
    const route = local ? localAddr + apiAddr + 'projects' : apiAddr + 'projects';
    //const route = 'api/v1/projects';

    return function(dispatch) {
        dispatch(requestAlgorithms());
        return fetch(route)
            .then(response => response.json())
            .then(json =>
                dispatch(receiveAlgorithms(json))
            );
    }
};

export const setCurrentDataset = (currentDataset) => {
    return {
        type: SET_CURRENT_DATASET,
        currentDataset
    }
};

export const setCurrentAlgorithm = (currentAlgorithm) => {
    return {
        type: SET_CURRENT_ALGORITHM,
        currentAlgorithm
    }
};

export const setParameterValue = (param, value) => {
    return {
        type: SET_PARAMETER_VALUE,
        param,
        value
    }
};