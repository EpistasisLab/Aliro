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
import { combineReducers } from 'redux';
import { 
  FETCH_PREFERENCES_REQUEST, 
  FETCH_PREFERENCES_SUCCESS, 
  FETCH_PREFERENCES_FAILURE
} from './actions';

const data = (state = {}, action) => {
  switch(action.type) {
    case FETCH_PREFERENCES_SUCCESS:
      return action.payload;
    default:
      return state;
  }
};

// initalize to true since preferences are fetched immediately on app load
const isFetching = (state = true, action) => {
  switch(action.type) {
    case FETCH_PREFERENCES_REQUEST:
      return true;
    case FETCH_PREFERENCES_SUCCESS:
    case FETCH_PREFERENCES_FAILURE:
      return false;   
    default:
      return state;
  }
};

const error = (state = null, action) => {
  switch(action.type) {
    case FETCH_PREFERENCES_FAILURE:
      return action.payload;
    default:
      return state;  
  }
};

const preferences = combineReducers({
  data,
  isFetching,
  error
});

export default preferences;