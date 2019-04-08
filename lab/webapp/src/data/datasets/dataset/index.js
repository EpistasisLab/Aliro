import {
  TOGGLE_AI_REQUEST,
  TOGGLE_AI_SUCCESS,
  TOGGLE_AI_FAILURE,
  AI_UPDATE,
  DATASET_UPDATE,
  UPLOAD_DATASET_REQUEST,
  UPLOAD_DATASET_SUCCESS,
  UPLOAD_DATASET_FAILURE
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
    case UPLOAD_DATASET_REQUEST:
      //window.console.log('UPLOAD_DATASET_REQUEST action', action);
      //window.console.log('UPLOAD_DATASET_REQUEST state', state);
      //return state;
      return { ...state, isUploading: true };
    case UPLOAD_DATASET_SUCCESS:
      //window.console.log('UPLOAD_DATASET_SUCCESS action', action);
      //window.console.log('UPLOAD_DATASET_SUCCESS state', state);
      //return state;
      let fileUploadResp = {
        fileUploadResp: action.payload
      }
      return {...state, fileUploadResp: action.payload, isUploading: false };
    case UPLOAD_DATASET_FAILURE:
      //window.console.log('UPLOAD_DATASET_FAILURE action', action);
      //window.console.log('UPLOAD_DATASET_FAILURE state', state);
      let fileUploadError = {
        errorResp: action.payload
      }
      return {...state, fileUploadResp: action.payload, isUploading: false };
      //return state;
    default:
      return state;
  }
};

export default dataset;
