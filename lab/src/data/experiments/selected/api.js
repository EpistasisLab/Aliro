require('es6-promise').polyfill();
import fetch from 'isomorphic-fetch';

export const fetchExperiment = (id) => 
  fetch(`api/userexperiments/${id}`)
    .then(response => {
      if(response.status >= 400) {
        throw new Error(`${response.status}: ${response.statusText}`);
      } 
      return response.json();
    })
    .then(experiment => experiment);