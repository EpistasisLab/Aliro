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
export const SUBMIT_EXPERIMENT_REQUEST = 'SUBMIT_EXPERIMENT_REQUEST';
export const SUBMIT_EXPERIMENT_SUCCESS = 'SUBMIT_EXPERIMENT_SUCCESS';
export const SUBMIT_EXPERIMENT_FAILURE = 'SUBMIT_EXPERIMENT_FAILURE';
export const SET_CURRENT_ALGORITHM = 'SET_CURRENT_ALGORITHM';
export const SET_PARAM_VALUE = 'SET_PARAM_VALUE';
export const CLEAR_ERROR = 'CLEAR_ERROR';

export const submitExperiment = (algorithm, params) => (dispatch) => {
  dispatch({
    type: SUBMIT_EXPERIMENT_REQUEST
  });

  return api.submitExperiment(algorithm, params).then(
    response => {
      dispatch({
        type: SUBMIT_EXPERIMENT_SUCCESS,
        payload: response
      });
    },
    error => {
      dispatch({
        type: SUBMIT_EXPERIMENT_FAILURE,
        payload: error.message || 'Something went wrong.'
      });
    }
  );
};

export const setCurrentAlgorithm = (algorithm) => ({
  type: SET_CURRENT_ALGORITHM,
  payload: { algorithm }
});

export const setParamValue = (param, value) => ({
  type: SET_PARAM_VALUE,
  payload: { param, value }
});

export const clearError = () => ({
  type: CLEAR_ERROR
});