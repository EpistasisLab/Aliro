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
