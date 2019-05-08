require('es6-promise').polyfill();
import fetch from 'isomorphic-fetch';

export const fetchMachines = () =>
  fetch('/api/v1/machines')
    .then(response => {
      if(response.status >= 400) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      return response.json();
    })
    .then(machines => machines);

export const fetchEnvVars = () =>
  fetch('/api/environment')
    .then(response => {
      if(response.status >= 400) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      return response.json();
    })
    .then(envVars => envVars);
