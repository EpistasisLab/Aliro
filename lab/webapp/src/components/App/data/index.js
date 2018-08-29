import { Map } from 'immutable';
import { combineReducers } from 'redux-immutable';
import { 
  PREFERENCES_FETCH_REQUEST, 
  PREFERENCES_FETCH_SUCCESS, 
  PREFERENCES_FETCH_FAILURE
} from './actions';

export const getPreferences = (state) => 
  state.getIn(['preferences', 'data']);

const data = (state = Map(), action) => {
  switch(action.type) {
    case PREFERENCES_FETCH_SUCCESS:
      return state.merge(action.response[0]);
    default:
      return state;
  }
};

export const getIsFetching = (state) => 
  state.getIn(['preferences', 'isFetching']);

const isFetching = (state = false, action) => {
  switch(action.type) {
    case PREFERENCES_FETCH_REQUEST:
      return true;
    case PREFERENCES_FETCH_SUCCESS:
    case PREFERENCES_FETCH_FAILURE:
      return false;   
    default:
      return state;
  }
};

export const getErrorMessage = (state) =>
  state.getIn(['preferences', 'errorMessage']);

const errorMessage = (state = null, action) => {
  switch(action.type) {
    case PREFERENCES_FETCH_FAILURE:
      return action.message;
    case PREFERENCES_FETCH_REQUEST:
    case PREFERENCES_FETCH_SUCCESS:
      return null;
    default:
      return state; 
  }
};

const preferences = combineReducers({
  data,
  isFetching,
  errorMessage
});

export default preferences;