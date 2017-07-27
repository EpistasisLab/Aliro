import * as api from './api';
import { getIsFetching } from './index';

export const ALGORITHMS_FETCH_REQUEST = 'ALGORITHMS_FETCH_REQUEST';
export const ALGORITHMS_FETCH_SUCCESS = 'ALGORITHMS_FETCH_SUCCESS';
export const ALGORITHMS_FETCH_FAILURE = 'ALGORITHMS_FETCH_FAILURE';

export const fetchAlgorithms = () => (dispatch, getState) => {
  if(getIsFetching(getState())) {
    return Promise.resolve();
  }

  dispatch({
    type: ALGORITHMS_FETCH_REQUEST
  });

  return api.fetchAlgorithms().then(
    response => {
      dispatch({
        type: ALGORITHMS_FETCH_SUCCESS,
        receivedAt: Date.now(),
        response
      });
    },
    error => {
      dispatch({
        type: ALGORITHMS_FETCH_FAILURE,
        receivedAt: Date.now(),
        message: error.message || 'Something went wrong.'
      });
    }
  );
};