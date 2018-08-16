import * as api from './api';
export const SUBMIT_EXPERIMENT_REQUEST = 'SUBMIT_EXPERIMENT_REQUEST';
export const SUBMIT_EXPERIMENT_SUCCESS = 'SUBMIT_EXPERIMENT_SUCCESS';
export const SUBMIT_EXPERIMENT_FAILURE = 'SUBMIT_EXPERIMENT_FAILURE';
export const SET_CURRENT_ALGORITHM = 'SET_CURRENT_ALGORITHM';
export const SET_PARAM_VALUE = 'SET_PARAM_VALUE';
export const CLEAR_ERROR = 'CLEAR_ERROR';

export const submitExperiment = (algorithm, params) => (dispatch) => {
  dispatch({
    type: SUBMIT_EXPERIMENT_REQUEST
  });

  return api.submitExperiment(algorithm, params).then(
    response => {
      dispatch({
        type: SUBMIT_EXPERIMENT_SUCCESS,
        payload: response
      });
    },
    error => {
      dispatch({
        type: SUBMIT_EXPERIMENT_FAILURE,
        payload: error.message || 'Something went wrong.'
      });
    }
  );
};

export const setCurrentAlgorithm = (algorithm) => ({
  type: SET_CURRENT_ALGORITHM,
  payload: { algorithm }
});

export const setParamValue = (param, value) => ({
  type: SET_PARAM_VALUE,
  payload: { param, value }
});

export const clearError = () => ({
  type: CLEAR_ERROR
});