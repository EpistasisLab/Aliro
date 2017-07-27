import { combineReducers } from 'redux-immutable';
import {
  CONF_MATRIX_FETCH_REQUEST,
  CONF_MATRIX_FETCH_SUCCESS,
  CONF_MATRIX_FETCH_FAILURE,
  CONF_MATRIX_CLEAR
} from './actions';

export const getConfusionMatrix = (state) => 
  state.getIn(['results', 'confusionMatrix', 'data']);

const data = (state = null, action) => {
  switch(action.type) {
    case CONF_MATRIX_FETCH_SUCCESS:
      return action.response;
    case CONF_MATRIX_CLEAR:
      return null;  
    default:
      return state;
  }
};

export const getIsFetching = (state) => 
  state.getIn(['results', 'confusionMatrix', 'isFetching']);

const isFetching = (state = false, action) => {
  switch(action.type) {
    case CONF_MATRIX_FETCH_REQUEST:
      return true;
    case CONF_MATRIX_FETCH_SUCCESS:
    case CONF_MATRIX_FETCH_FAILURE:
    case CONF_MATRIX_CLEAR:
      return false;   
    default:
      return state;
  }
};

export const getErrorMessage = (state) =>
  state.getIn(['results', 'confusionMatrix', 'errorMessage']);

const errorMessage = (state = null, action) => {
  switch(action.type) {
    case CONF_MATRIX_FETCH_FAILURE:
      return action.message;
    case CONF_MATRIX_FETCH_REQUEST:
    case CONF_MATRIX_FETCH_SUCCESS:
    case CONF_MATRIX_CLEAR:
      return null;
    default:
      return state;
  }
};

const confusionMatrix = combineReducers({
  data,
  isFetching,
  errorMessage
});

export default confusionMatrix;