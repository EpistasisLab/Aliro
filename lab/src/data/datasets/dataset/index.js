import {
  TOGGLE_AI_REQUEST,
  TOGGLE_AI_SUCCESS,
  TOGGLE_AI_FAILURE,
  AI_UPDATE,
  DATASET_UPDATE
} from './actions';

const dataset = (state = {}, action) => {
  switch(action.type) {
    case TOGGLE_AI_REQUEST:
      return Object.assign({}, state, {
        isTogglingAI: true
      });
    case TOGGLE_AI_SUCCESS:
      return Object.assign({}, state, {
        ai: action.nextAIState,
        isTogglingAI: false
      });
    case TOGGLE_AI_FAILURE:
      return Object.assign({}, state, {
        errorMessage: action.message,
        isTogglingAI: false
      });
    case AI_UPDATE:
      return Object.assign({}, state, {
        ai: action.nextAIState
      });
    case DATASET_UPDATE:
      return action.dataset;  
    default:
      return state;  
  }
};

export default dataset;