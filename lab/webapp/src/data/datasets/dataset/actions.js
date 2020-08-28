/* This file is part of the PennAI library.

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
import * as api from './api';
export const TOGGLE_AI_REQUEST = 'TOGGLE_AI_REQUEST';
export const TOGGLE_AI_SUCCESS = 'TOGGLE_AI_SUCCESS';
export const TOGGLE_AI_FAILURE = 'TOGGLE_AI_FAILURE';
export const AI_UPDATE = 'AI_UPDATE';
export const DATASET_UPDATE = 'DATASET_UPDATE';
export const UPLOAD_DATASET_REQUEST = 'UPLOAD_DATASET_REQUEST';
export const UPLOAD_DATASET_SUCCESS = 'UPLOAD_DATASET_SUCCESS';
export const UPLOAD_DATASET_FAILURE = 'UPLOAD_DATASET_FAILURE';

export const toggleAI = (id, nextAIState) => (dispatch) => {
  dispatch({
    type: TOGGLE_AI_REQUEST,
    id
  });

  return api.toggleAI(id, nextAIState).then(
    response => {
      dispatch({
        type: TOGGLE_AI_SUCCESS,
        id,
        nextAIState,
        response
      });
    },
    error => {
      dispatch({
        type: TOGGLE_AI_FAILURE,
        message: error.message || 'Something went wrong.',
        id
      });
    }
  );
};

export const uploadDataset = (dataset) => (dispatch) => {
  dispatch({
    type: UPLOAD_DATASET_REQUEST
  });

  return api.uploadDataset(dataset).then(
    response => {
      // if error response present emit repsective redux action; this occurs when
      // server attempts to upload selected file but something goes wrong
      // and content not added as expected, otherwise assume dataset uploaded

      response.error
        ? dispatch({
          type: UPLOAD_DATASET_FAILURE,
          payload: response || 'Something went wrong.'
          })
        : dispatch({
          type: UPLOAD_DATASET_SUCCESS,
          payload: response
        });
    },
    error => {
      dispatch({
        type: UPLOAD_DATASET_FAILURE,
        payload: error.message || 'Something went wrong.'
      });
    }
  );
};

export const updateAI = (id, nextAIState) => ({
  type: AI_UPDATE,
  id,
  nextAIState
});

export const updateDataset = (dataset) => ({
  type: DATASET_UPDATE,
  dataset
});
