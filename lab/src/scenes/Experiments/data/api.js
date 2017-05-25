require('es6-promise').polyfill();
import fetch from 'isomorphic-fetch';
import { fromJS } from 'immutable';
import { 
    requestExperiments,
    receiveExperiments
} from './actions';

export const fetchExperiments = () => {
    const route = 'api/experiments';

    return function(dispatch) {
        dispatch(requestExperiments());
        return fetch(route)
            .then(response => response.json())
            .then(json =>
                dispatch(receiveExperiments(fromJS(json)))
            );
    }
};
