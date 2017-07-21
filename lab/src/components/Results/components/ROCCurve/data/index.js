import { combineReducers } from 'redux-immutable';
import {
  ROC_CURVE_FETCH_REQUEST,
  ROC_CURVE_FETCH_SUCCESS,
  ROC_CURVE_FETCH_FAILURE,
  ROC_CURVE_CLEAR
} from './actions';

export const getROCCurve = (state) => 
  state.getIn(['results', 'rocCurve', 'data']);

const data = (state = null, action) => {
  switch(action.type) {
    case ROC_CURVE_FETCH_SUCCESS:
      return action.response;
    case ROC_CURVE_CLEAR:
      return null;
    default:
      return state;
  }
};

export const getIsFetching = (state) => 
  state.getIn(['results', 'rocCurve', 'isFetching']);

const isFetching = (state = false, action) => {
  switch(action.type) {
    case ROC_CURVE_FETCH_REQUEST:
      return true;
    case ROC_CURVE_FETCH_SUCCESS:
    case ROC_CURVE_FETCH_FAILURE:
    case ROC_CURVE_CLEAR:
      return false;   
    default:
      return state;
  }
};

export const getErrorMessage = (state) =>
  state.getIn(['results', 'rocCurve', 'errorMessage']);

const errorMessage = (state = null, action) => {
  switch(action.type) {
    case ROC_CURVE_FETCH_FAILURE:
      return action.message;
    case ROC_CURVE_FETCH_REQUEST:
    case ROC_CURVE_FETCH_SUCCESS:
    case ROC_CURVE_CLEAR:
      return null;
    default:
      return state;
  }
};

const rocCurve = combineReducers({
  data,
  isFetching,
  errorMessage
});

export default rocCurve;