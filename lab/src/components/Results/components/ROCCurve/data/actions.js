import * as api from '../../../data/api';
import { getIsFetching } from './index';

export const ROC_CURVE_FETCH_REQUEST = 'ROC_CURVE_FETCH_REQUEST';
export const ROC_CURVE_FETCH_SUCCESS = 'ROC_CURVE_FETCH_SUCCESS';
export const ROC_CURVE_FETCH_FAILURE = 'ROC_CURVE_FETCH_FAILURE';
export const ROC_CURVE_CLEAR = 'ROC_CURVE_CLEAR';

export const fetchROCCurve = (id) => (dispatch, getState) => {
  if(getIsFetching(getState())) {
    return Promise.resolve();
  }

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

export const clearROCCurve = () => (dispatch) => {
  dispatch({
    type: ROC_CURVE_CLEAR
  });
};