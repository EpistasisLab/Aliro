require('es6-promise').polyfill();
import fetch from 'isomorphic-fetch';
import { fromJS } from 'immutable';
import { 
    requestDatasets,
    receiveDatasets,
    requestAIToggle,
    receiveAIToggle
} from './actions';

export const fetchDatasets = () => {
    const route = 'api/userdatasets';
    
    return function(dispatch) {
        dispatch(requestDatasets());
        return fetch(route)
            .then(response => response.json())
            .then(json =>
                dispatch(receiveDatasets(fromJS(json)))
            );
    }
};

export const toggleAI = (datasetId, aiState) => {
    const route = `api/v1/datasets/${datasetId}/ai`;
    
    let myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');

    return function(dispatch) {
        dispatch(requestAIToggle(datasetId));
        return fetch(route, {
            method: 'PUT',
            headers: myHeaders,
            mode: 'cors',
            cache: 'default',
            body: JSON.stringify({ai: aiState})
        })
            .then(response => response.json())
            .then(json =>
                dispatch(receiveAIToggle(datasetId, aiState))
            );
    }  
};
