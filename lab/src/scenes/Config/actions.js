require('es6-promise').polyfill();
import fetch from 'isomorphic-fetch';

export const REQUEST_ALGORITHMS = 'REQUEST_ALGORITHMS';
export const RECEIVE_ALGORITHMS = 'RECEIVE_ALGORITHMS';

export const requestAlgorithms = () => {
    return {
        type: REQUEST_ALGORITHMS
    }
};

export const receiveAlgorithms = (json) => {
    return {
        type: RECEIVE_ALGORITHMS,
        algorithms: json,
        receivedAt: Date.now()
    }
};

export const fetchAlgorithms = () => {
    const route = 'api/v1/projects';

    return function(dispatch) {
        dispatch(requestAlgorithms());
        return fetch(route)
            .then(response => response.json())
            .then(json =>
                dispatch(receiveAlgorithms(json))
            );
    }
};