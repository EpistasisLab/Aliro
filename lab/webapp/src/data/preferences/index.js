import { combineReducers } from 'redux';
import { 
  FETCH_PREFERENCES_REQUEST, 
  FETCH_PREFERENCES_SUCCESS, 
  FETCH_PREFERENCES_FAILURE
} from './actions';

const data = (state = {}, action) => {
  switch(action.type) {
    case FETCH_PREFERENCES_SUCCESS:
      return action.payload;
    default:
      return state;
  }
};

// initalize to true since preferences are fetched immediately on app load
const isFetching = (state = true, action) => {
  switch(action.type) {
    case FETCH_PREFERENCES_REQUEST:
      return true;
    case FETCH_PREFERENCES_SUCCESS:
    case FETCH_PREFERENCES_FAILURE:
      return false;   
    default:
      return state;
  }
};

const error = (state = null, action) => {
  switch(action.type) {
    case FETCH_PREFERENCES_FAILURE:
      return action.payload;
    default:
      return state;  
  }
};

const preferences = combineReducers({
  data,
  isFetching,
  error
});

export default preferences;