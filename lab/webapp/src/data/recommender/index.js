import { combineReducers } from 'redux';
import { 
  FETCH_RECOMMENDER_REQUEST, 
  FETCH_RECOMMENDER_SUCCESS, 
  FETCH_RECOMMENDER_FAILURE
} from './actions';

const data = (state = {}, action) => {
  switch(action.type) {
    case FETCH_RECOMMENDER_SUCCESS:
      return action.payload;
    default:
      return state;
  }
};

// initalize to true since preferences are fetched immediately on app load
const isFetching = (state = true, action) => {
  switch(action.type) {
    case FETCH_RECOMMENDER_REQUEST:
      return true;
    case FETCH_RECOMMENDER_SUCCESS:
    case FETCH_RECOMMENDER_FAILURE:
      return false;   
    default:
      return state;
  }
};

const error = (state = null, action) => {
  switch(action.type) {
    case FETCH_RECOMMENDER_FAILURE:
      return action.payload;
    default:
      return state;  
  }
};

const recommender = combineReducers({
  data,
  isFetching,
  error
});

export default recommender;