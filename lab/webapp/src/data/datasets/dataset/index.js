/* ~This file is part of the PennAI library~

Copyright (C) 2017 Epistasis Lab, University of Pennsylvania

PennAI is maintained by:
    - Heather Williams (hwilli@upenn.edu)
    - Weixuan Fu (weixuanf@pennmedicine.upenn.edu)
    - William La Cava (lacava@upenn.edu)
    - and many other generous open source contributors

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.

*/
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
      return {
        ...state,
        fileUploadResp: action.payload,
        fileUploadError: undefined,
        isUploading: false
      };
    case UPLOAD_DATASET_FAILURE:
      //window.console.log('UPLOAD_DATASET_FAILURE action', action);
      //window.console.log('UPLOAD_DATASET_FAILURE state', state);
      let fileUploadError = {
        errorResp: action.payload
      }
      return {...state, fileUploadError, isUploading: false };
      //return state;
    default:
      return state;
  }
};

export default dataset;
