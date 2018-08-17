import * as api from './api';
export const FETCH_EXPERIMENT_REQUEST = 'FETCH_EXPERIMENT_REQUEST';
export const FETCH_EXPERIMENT_SUCCESS = 'FETCH_EXPERIMENT_SUCCESS';
export const FETCH_EXPERIMENT_FAILURE = 'FETCH_EXPERIMENT_FAILURE';
export const CLEAR_EXPERIMENT = 'CLEAR_EXPERIMENT';

export const fetchExperiment = (id) => (dispatch) => {
  dispatch({
    type: FETCH_EXPERIMENT_REQUEST
  });

  return api.fetchExperiment(id).then(
    experiment => {
      dispatch({
        type: FETCH_EXPERIMENT_SUCCESS,
        payload: experiment[0]
      });
    },
    error => {
      dispatch({
        type: FETCH_EXPERIMENT_FAILURE,
        payload: error.message || 'Something went wrong.'
      });
    }
  );
};

export const clearExperiment = () => ({
  type: CLEAR_EXPERIMENT
});