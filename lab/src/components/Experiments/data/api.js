require('es6-promise').polyfill();
import fetch from 'isomorphic-fetch';

export const fetchExperiments = () => {
    const route = 'api/userexperiments';
    
    return fetch(route, {
        credentials: 'include'
    })
        .then(response => {
            if(response.status >= 400) {
                throw new Error(`${response.status}: ${response.statusText}`);
            }  
            return response.json();
        })
        .then(json => json);
};