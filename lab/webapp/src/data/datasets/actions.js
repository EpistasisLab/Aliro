import * as api from './api';
export const FETCH_DATASETS_REQUEST = 'FETCH_DATASETS_REQUEST';
export const FETCH_DATASETS_SUCCESS = 'FETCH_DATASETS_SUCCESS';
export const FETCH_DATASETS_FAILURE = 'FETCH_DATASETS_FAILURE';

export const fetchDatasets = () => (dispatch) => {
  dispatch({
    type: FETCH_DATASETS_REQUEST
  });

  return api.fetchDatasets().then(
    datasets => {
      dispatch({
        type: FETCH_DATASETS_SUCCESS,
        payload: datasets
      });
    },
    error => {
      dispatch({
        type: FETCH_DATASETS_FAILURE,
        payload: error.message || 'Something went wrong.'
      });
    }
  );
};