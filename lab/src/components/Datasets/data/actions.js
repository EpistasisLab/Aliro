import * as api from './api';
import { getIsFetching } from './index';

export const DATASETS_FETCH_REQUEST = 'DATASETS_FETCH_REQUEST';
export const DATASETS_FETCH_SUCCESS = 'DATASETS_FETCH_SUCCESS';
export const DATASETS_FETCH_FAILURE = 'DATASETS_FETCH_FAILURE';

export const fetchDatasets = () => (dispatch, getState) => {
  if(getIsFetching(getState())) {
    return Promise.resolve();
  }

  dispatch({
    type: DATASETS_FETCH_REQUEST
  });

  return api.fetchDatasets().then(
    response => {
      dispatch({
        type: DATASETS_FETCH_SUCCESS,
        receivedAt: Date.now(),
        response
      });
    },
    error => {
      dispatch({
        type: DATASETS_FETCH_FAILURE,
        receivedAt: Date.now(),
        message: error.message || 'Something went wrong.'
      });
    }
  );
};