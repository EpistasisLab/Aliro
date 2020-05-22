import * as api from './api';
export const FETCH_RECOMMENDER_REQUEST = 'FETCH_RECOMMENDER_REQUEST';
export const FETCH_RECOMMENDER_SUCCESS = 'FETCH_RECOMMENDER_SUCCESS';
export const FETCH_RECOMMENDER_FAILURE = 'FETCH_RECOMMENDER_FAILURE';

export const fetchRecommender = () => (dispatch) => {
  dispatch({
    type: FETCH_RECOMMENDER_REQUEST
  });

  return api.fetchRecommender().then(
    recommender => {
      dispatch({
        type: FETCH_RECOMMENDER_SUCCESS,
        payload: recommender
      });
    },
    error => {
      dispatch({
        type: FETCH_RECOMMENDER_FAILURE,
        payload: error.message || 'Something went wrong.'
      });
    }
  );
};