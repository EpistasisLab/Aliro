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
import { Map } from 'immutable';
import { combineReducers } from 'redux-immutable';
import { 
  PREFERENCES_FETCH_REQUEST, 
  PREFERENCES_FETCH_SUCCESS, 
  PREFERENCES_FETCH_FAILURE
} from './actions';

export const getPreferences = (state) => 
  state.getIn(['preferences', 'data']);

const data = (state = Map(), action) => {
  switch(action.type) {
    case PREFERENCES_FETCH_SUCCESS:
      return state.merge(action.response[0]);
    default:
      return state;
  }
};

export const getIsFetching = (state) => 
  state.getIn(['preferences', 'isFetching']);

const isFetching = (state = false, action) => {
  switch(action.type) {
    case PREFERENCES_FETCH_REQUEST:
      return true;
    case PREFERENCES_FETCH_SUCCESS:
    case PREFERENCES_FETCH_FAILURE:
      return false;   
    default:
      return state;
  }
};

export const getErrorMessage = (state) =>
  state.getIn(['preferences', 'errorMessage']);

const errorMessage = (state = null, action) => {
  switch(action.type) {
    case PREFERENCES_FETCH_FAILURE:
      return action.message;
    case PREFERENCES_FETCH_REQUEST:
    case PREFERENCES_FETCH_SUCCESS:
      return null;
    default:
      return state; 
  }
};

const preferences = combineReducers({
  data,
  isFetching,
  errorMessage
});

export default preferences;