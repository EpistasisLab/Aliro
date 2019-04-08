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
      dispatch({
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
