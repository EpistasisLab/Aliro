import { combineReducers } from 'redux';
import {
  FETCH_MACHINES_REQUEST,
  FETCH_MACHINES_SUCCESS,
  FETCH_MACHINES_FAILURE,
  FETCH_ENV_VARS_REQUEST,
  FETCH_ENV_VARS_SUCCESS,
  FETCH_ENV_VARS_FAILURE
} from './actions';

const list = (state = [], action) => {
	switch(action.type) {
		case FETCH_MACHINES_SUCCESS:
			return action.payload;
		default:
			return state;
	}
};

const envVarStuff = (state = [], action) => {
	switch(action.type) {
		case FETCH_ENV_VARS_SUCCESS:
			return action.payload;
		default:
			return state;
	}
};

const isFetching = (state = false, action) => {
  switch(action.type) {
    case FETCH_MACHINES_REQUEST:
      return true;
    case FETCH_MACHINES_SUCCESS:
    case FETCH_MACHINES_FAILURE:
      return false;
    default:
      return state;
  }
};

const isEnvVarFetching = (state = false, action) => {
  switch(action.type) {
    case FETCH_ENV_VARS_REQUEST:
      return true;
    case FETCH_ENV_VARS_SUCCESS:
    case FETCH_ENV_VARS_FAILURE:
      return false;
    default:
      return state;
  }
};

const error = (state = null, action) => {
  switch(action.type) {
    case FETCH_MACHINES_FAILURE:
      return action.payload;
    case FETCH_ENV_VARS_FAILURE:
      return action.payload;
    default:
      return state;
  }
};

const machines = combineReducers({
  list,
  envVarStuff,
  isFetching,
  isEnvVarFetching,
  error
});

export default machines;
