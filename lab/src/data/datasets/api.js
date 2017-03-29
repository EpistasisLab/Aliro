require('es6-promise').polyfill();
import fetch from 'isomorphic-fetch';
import { fromJS } from 'immutable';
import { 
    requestDatasets,
    receiveDatasets
} from './actions';

export const fetchDatasets = () => {
    //const route = 'http://localhost:5080/api/v1/datasets';
    const route = 'api/v1/datasets';

    return function(dispatch) {
        dispatch(requestDatasets());
        return fetch(route)
            .then(response => response.json())
            .then(json =>
                dispatch(receiveDatasets(fromJS(json)))
            );
    }
};