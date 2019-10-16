require('es6-promise').polyfill();
import fetch from 'isomorphic-fetch';

export const fetchExperiments = () =>
  fetch('/api/userexperiments')
    .then(response => {
      if(response.status >= 400) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      return response.json();
    })
    .then(experiments => experiments);
