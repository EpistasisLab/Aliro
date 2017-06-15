require('es6-promise').polyfill();
import fetch from 'isomorphic-fetch';
import { fromJS } from 'immutable';
import {
    requestExperiment,
    receiveExperiment,
    requestDataset,
    receiveDataset
} from './actions';
import { hashHistory } from 'react-router';

export const fetchExperiment = (experimentId) => {
    const route = `api/userexperiments/${experimentId}`;


    return function(dispatch) {
        dispatch(requestExperiment());
        return fetch(route, {
             credentials: 'include'
           })
            .then(response => response.json())
            .then(json =>
                dispatch(receiveExperiment(fromJS(json)))
            );
    }
};

export const fetchDataset = (datasetId) => {
    const route = `api/userdatasets/${datasetId}`;

    return function(dispatch) {
        dispatch(requestDataset());
        return fetch(route, {
                credentials: 'include'
        })

            .then(response => response.json())
            .then(json =>
                dispatch(receiveDataset(fromJS(json)))
            );
    }
};

export const submitJob = (datasetId, algorithmId, params) => {
    const route = `api/v1/projects/${algorithmId}/experiment`;

    let myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');

    let body = params.set('dataset', datasetId).toJSON();
    console.log(body);
    return function(dispatch) {
        //dispatch(requestDatasets());
        return fetch(route, {
                method: 'POST',
                credentials: 'include',
                headers: myHeaders,
                mode: 'cors',
                cache: 'default', 
                body: JSON.stringify(body)
            })
            .then(response => response.json())
            .then(json =>
                hashHistory.push('experiments')
                //dispatch(receiveDatasets(fromJS(json)))
            );
    }
};
