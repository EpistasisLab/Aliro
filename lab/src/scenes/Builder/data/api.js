require('es6-promise').polyfill();
import fetch from 'isomorphic-fetch';
import { fromJS } from 'immutable';
import { 
    requestDataset,
    receiveDataset
} from './actions';

export const fetchDataset = (datasetId) => {
    const route = `api/datasets/${datasetId}`;
    //const route = `http://localhost:5080/api/datasets/${datasetId}`;

    return function(dispatch) {
        dispatch(requestDataset());
        return fetch(route)
            .then(response => response.json())
            .then(json =>
                dispatch(receiveDataset(fromJS(json)))
            );
    }
};

export const submitJob = (datasetId, algorithmId, params) => {
    const route = `api/v1/projects/${algorithmId}/experiment`;
    //const route = `http://localhost:5080/api/v1/projects/${algorithmId}/experiment`;

    console.log(algorithmId, params.toJS());
    return function(dispatch) {
        //dispatch(requestDatasets());
        let body = {
            dataset: datasetId,
            params: params.toJSON()
        };
        return fetch(route, {method: 'POST', body: JSON.stringify(body)})
            .then(response => response.json())
            .then(json =>
                console.log(json)
                //dispatch(receiveDatasets(fromJS(json)))
            );
    }
};