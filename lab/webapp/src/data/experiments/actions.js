import * as api from './api';
export const FETCH_EXPERIMENTS_REQUEST = 'FETCH_EXPERIMENTS_REQUEST';
export const FETCH_EXPERIMENTS_SUCCESS = 'FETCH_EXPERIMENTS_SUCCESS';
export const FETCH_EXPERIMENTS_FAILURE = 'FETCH_EXPERIMENTS_FAILURE';
export const ADD_EXPERIMENT = 'ADD_EXPERIMENT';
export const UPDATE_EXPERIMENT = 'UPDATE_EXPERIMENT';

export const fetchExperiments = () => (dispatch) => {
  dispatch({
    type: FETCH_EXPERIMENTS_REQUEST
  });

  return api.fetchExperiments().then(
    experiments => {
      dispatch({
        type: FETCH_EXPERIMENTS_SUCCESS,
        payload: experiments
      });
    },
    error => {
      dispatch({
        type: FETCH_EXPERIMENTS_FAILURE,
        payload: error.message || 'Something went wrong.'
      });
    }
  );
};

export const addExperiment = (experiment) => ({
  type: ADD_EXPERIMENT,
  payload: experiment
});

export const updateExperiment = (experiment) => ({
  type: UPDATE_EXPERIMENT,
  payload: experiment
});