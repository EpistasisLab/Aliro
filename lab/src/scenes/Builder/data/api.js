require('es6-promise').polyfill();
import fetch from 'isomorphic-fetch';
import { fromJS } from 'immutable';

export const submitJob = (algorithmId, params) => {
    const route = `http://localhost:5080/api/v1/projects/${algorithmId}/experiment`;

    console.log(algorithmId, params.toJS());
    return function(dispatch) {
        //dispatch(requestDatasets());
        return fetch(route, {method: 'POST', body: JSON.stringify(params.toJSON())})
            .then(response => response.json())
            .then(json =>
                console.log(json)
                //dispatch(receiveDatasets(fromJS(json)))
            );
    }
};