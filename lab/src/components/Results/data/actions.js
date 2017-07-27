import * as api from './api';
import { getIsFetching } from './index';

export const RESULTS_FETCH_REQUEST = 'RESULTS_FETCH_REQUEST';
export const RESULTS_FETCH_SUCCESS = 'RESULTS_FETCH_SUCCESS';
export const RESULTS_FETCH_FAILURE = 'RESULTS_FETCH_FAILURE';
export const RESULTS_CLEAR = 'RESULTS_CLEAR';

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

export const clearResults = () => (dispatch) => {
  dispatch({
    type: RESULTS_CLEAR
  });
};