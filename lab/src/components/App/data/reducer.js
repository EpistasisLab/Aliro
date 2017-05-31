import { fromJS } from 'immutable';
import { 
    REQUEST_PREFERENCES,
    RECEIVE_PREFERENCES
} from './actions';

import { initialPreferences } from './initialPreferences'; // for testing
const initialState = fromJS({
    isFetching: false,
    preferences: {} /*initialPreferences*/ // for testing
});

const preferences = (state = initialState, action) => {
    switch(action.type) {
        case REQUEST_PREFERENCES:
            return state.merge({
                isFetching: true
            });
        case RECEIVE_PREFERENCES:
            return state.merge({
                isFetching: false,
                preferences: action.preferences
            });
        default:
            return state;
    }
};

export default preferences;