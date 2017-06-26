import * as api from './api';
import { getIsFetching, getIsSubmitting } from './index';

export const DATASET_FETCH_REQUEST = 'DATASET_FETCH_REQUEST';
export const DATASET_FETCH_SUCCESS = 'DATASET_FETCH_SUCCESS';
export const DATASET_FETCH_FAILURE = 'DATASET_FETCH_FAILURE';

export const EXPERIMENT_FETCH_REQUEST = 'EXPERIMENT_FETCH_REQUEST';
export const EXPERIMENT_FETCH_SUCCESS = 'EXPERIMENT_FETCH_SUCCESS';
export const EXPERIMENT_FETCH_FAILURE = 'EXPERIMENT_FETCH_FAILURE';

export const EXPERIMENT_SUBMIT_REQUEST = 'EXPERIMENT_SUBMIT_REQUEST';
export const EXPERIMENT_SUBMIT_SUCCESS = 'EXPERIMENT_SUBMIT_SUCCESS';
export const EXPERIMENT_SUBMIT_FAILURE = 'EXPERIMENT_SUBMIT_FAILURE';

export const SET_CURRENT_ALGORITHM = 'SET_CURRENT_ALGORITHM';
export const SET_PARAM_VALUE = 'SET_PARAM_VALUE';

export const fetchDataset = (id) => (dispatch, getState) => {
    if(getIsFetching(getState())) {
        return Promise.resolve();
    }

    dispatch({
        type: DATASET_FETCH_REQUEST
    });

    return api.fetchDataset(id).then(
        response => {
            dispatch({
                type: DATASET_FETCH_SUCCESS,
                receivedAt: Date.now(),
                response
            });
        },
        error => {
            dispatch({
                type: DATASET_FETCH_FAILURE,
                receivedAt: Date.now(),
                message: error.message || 'Something went wrong.'
            });
        }
    );
};

export const fetchExperiment = (id) => (dispatch, getState) => {
    if(getIsFetching(getState())) {
        return Promise.resolve();
    }

    dispatch({
        type: EXPERIMENT_FETCH_REQUEST
    });

    return api.fetchExperiment(id).then(
        response => {
            dispatch({
                type: EXPERIMENT_FETCH_SUCCESS,
                receivedAt: Date.now(),
                response
            });
        },
        error => {
            dispatch({
                type: EXPERIMENT_FETCH_FAILURE,
                receivedAt: Date.now(),
                message: error.message || 'Something went wrong.'
            });
        }
    );
};

export const submitExperiment = (algorithm, params) => (dispatch, getState) => {
    if(getIsSubmitting(getState())) {
        return Promise.resolve();
    }

    dispatch({
        type: EXPERIMENT_SUBMIT_REQUEST
    });

    return api.submitExperiment(algorithm, params).then(
        response => {
            dispatch({
                type: EXPERIMENT_SUBMIT_SUCCESS,
                receivedAt: Date.now(),
                response
            });
        },
        error => {
            dispatch({
                type: EXPERIMENT_SUBMIT_FAILURE,
                receivedAt: Date.now(),
                message: error.message || 'Something went wrong.'
            });
        }
    );
};

export const setCurrentAlgorithm = (algorithm) => (dispatch) => {
    dispatch({
        type: SET_CURRENT_ALGORITHM,
        payload: { algorithm }
    });
};

export const setParamValue = (param, value) => (dispatch) => {
    dispatch({
        type: SET_PARAM_VALUE,
        payload: { param, value }
    });
};