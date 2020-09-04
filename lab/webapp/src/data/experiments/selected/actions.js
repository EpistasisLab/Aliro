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
import * as api from './api';
export const FETCH_EXPERIMENT_REQUEST = 'FETCH_EXPERIMENT_REQUEST';
export const FETCH_EXPERIMENT_SUCCESS = 'FETCH_EXPERIMENT_SUCCESS';
export const FETCH_EXPERIMENT_FAILURE = 'FETCH_EXPERIMENT_FAILURE';
export const CLEAR_EXPERIMENT = 'CLEAR_EXPERIMENT';

export const fetchExperiment = (id) => (dispatch) => {
  dispatch({
    type: FETCH_EXPERIMENT_REQUEST
  });

  return api.fetchExperiment(id).then(
    experiment => {
      dispatch({
        type: FETCH_EXPERIMENT_SUCCESS,
        payload: experiment[0]
      });
    },
    error => {
      dispatch({
        type: FETCH_EXPERIMENT_FAILURE,
        payload: error.message || 'Something went wrong.'
      });
    }
  );
};

export const clearExperiment = () => ({
  type: CLEAR_EXPERIMENT
});