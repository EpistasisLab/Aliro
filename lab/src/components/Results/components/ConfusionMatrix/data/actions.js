import * as api from '../../../data/api';
import { getIsFetching } from './index';

export const CONF_MATRIX_FETCH_REQUEST = 'CONF_MATRIX_FETCH_REQUEST';
export const CONF_MATRIX_FETCH_SUCCESS = 'CONF_MATRIX_FETCH_SUCCESS';
export const CONF_MATRIX_FETCH_FAILURE = 'CONF_MATRIX_FETCH_FAILURE';
export const CONF_MATRIX_CLEAR = 'CONF_MATRIX_CLEAR';

export const fetchConfusionMatrix = (id) => (dispatch, getState) => {
  if(getIsFetching(getState())) {
    return Promise.resolve();
  }

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

export const clearConfusionMatrix = () => (dispatch) => {
  dispatch({
    type: CONF_MATRIX_CLEAR
  });
};