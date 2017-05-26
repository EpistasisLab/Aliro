require('es6-promise').polyfill();
import fetch from 'isomorphic-fetch';
import { fromJS } from 'immutable';
import { 
    requestPreferences,
    receivePreferences
} from './actions';

export const fetchPreferences = () => {
    //const route = 'http://localhost:5080/api/v1/preferences';
    const route = 'api/preferences';

    return function(dispatch) {
        dispatch(requestPreferences());
        return fetch(route)
            .then(response => response.json())
            .then(json =>
                dispatch(receivePreferences(fromJS(json)))
            );
    }
};
