import { Map } from 'immutable';
import { combineReducers } from 'redux-immutable';
import {
  RESULTS_FETCH_REQUEST,
  RESULTS_FETCH_SUCCESS,
  RESULTS_FETCH_FAILURE,
  RESULTS_CLEAR
} from './actions';
import confusionMatrix from '../components/ConfusionMatrix/data';
import rocCurve from '../components/ROCCurve/data';
import importanceScore from '../components/ImportanceScore/data';

export const getResults = (state) =>
  state.getIn(['results', 'data']);

const data = (state = Map(), action) => {
  switch(action.type) {
    case RESULTS_FETCH_SUCCESS:
      return state.merge(action.response[0]);
    case RESULTS_CLEAR:
      return Map();
    default:
      return state;
  }
};

export const getIsFetching = (state) =>
  state.getIn(['results', 'isFetching']);

const isFetching = (state = false, action) => {
  switch(action.type) {
    case RESULTS_FETCH_REQUEST:
      return true;
    case RESULTS_FETCH_SUCCESS:
    case RESULTS_FETCH_FAILURE:
    case RESULTS_CLEAR:
      return false;
    default:
      return state;
  }
};

export const getErrorMessage = (state) =>
  state.getIn(['results', 'errorMessage']);

const errorMessage = (state = null, action) => {
  switch(action.type) {
    case RESULTS_FETCH_FAILURE:
      return action.message;
    case RESULTS_FETCH_REQUEST:
    case RESULTS_FETCH_SUCCESS:
    case RESULTS_CLEAR:
      return null;
    default:
      return state;
  }
};

const results = combineReducers({
  data,
  isFetching,
  errorMessage,
  confusionMatrix,
  rocCurve,
  importanceScore
});

export default results;
