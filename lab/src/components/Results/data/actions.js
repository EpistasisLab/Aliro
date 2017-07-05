import * as api from './api';
import { getIsFetching } from './index';

export const RESULTS_FETCH_REQUEST = 'RESULTS_FETCH_REQUEST';
export const RESULTS_FETCH_SUCCESS = 'RESULTS_FETCH_SUCCESS';
export const RESULTS_FETCH_FAILURE = 'RESULTS_FETCH_FAILURE';

export const CONF_MATRIX_FETCH_REQUEST = 'CONF_MATRIX_FETCH_REQUEST';
export const CONF_MATRIX_FETCH_SUCCESS = 'CONF_MATRIX_FETCH_SUCCESS';
export const CONF_MATRIX_FETCH_FAILURE = 'CONF_MATRIX_FETCH_FAILURE';

export const ROC_CURVE_FETCH_REQUEST = 'ROC_CURVE_FETCH_REQUEST';
export const ROC_CURVE_FETCH_SUCCESS = 'ROC_CURVE_FETCH_SUCCESS';
export const ROC_CURVE_FETCH_FAILURE = 'ROC_CURVE_FETCH_FAILURE';

export const fetchResults = (id) => (dispatch, getState) => {
    if(getIsFetching(getState())) {
        return Promise.resolve();
    }

    dispatch({
        type: RESULTS_FETCH_REQUEST
    });

    return api.fetchResults(id).then(
        response => {
            dispatch({
                type: RESULTS_FETCH_SUCCESS,
                receivedAt: Date.now(),
                response
            });
        },
        error => {
            dispatch({
                type: RESULTS_FETCH_FAILURE,
                receivedAt: Date.now(),
                message: error.message || 'Something went wrong.'
            });
        }
    );
};

export const fetchConfusionMatrix = (id) => (dispatch, getState) => {
    /*if(getIsFetching(getState())) {
        return Promise.resolve();
    }*/

    dispatch({
        type: CONF_MATRIX_FETCH_REQUEST
    });

    return api.fetchFile(id).then(
        response => {
            dispatch({
                type: CONF_MATRIX_FETCH_SUCCESS,
                receivedAt: Date.now(),
                response
            });
        },
        error => {
            dispatch({
                type: CONF_MATRIX_FETCH_FAILURE,
                receivedAt: Date.now(),
                message: error.message || 'Something went wrong.'
            });
        }
    );
};

export const fetchROCCurve = (id) => (dispatch, getState) => {
    /*if(getIsFetching(getState())) {
        return Promise.resolve();
    }*/

    dispatch({
        type: ROC_CURVE_FETCH_REQUEST
    });

    return api.fetchFile(id).then(
        response => {
            dispatch({
                type: ROC_CURVE_FETCH_SUCCESS,
                receivedAt: Date.now(),
                response
            });
        },
        error => {
            dispatch({
                type: ROC_CURVE_FETCH_FAILURE,
                receivedAt: Date.now(),
                message: error.message || 'Something went wrong.'
            });
        }
    );
};