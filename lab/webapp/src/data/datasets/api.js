require('es6-promise').polyfill();
import fetch from 'isomorphic-fetch';

export const fetchDatasets = () => 
  fetch('/api/userdatasets')
    .then(response => {
      if(response.status >= 400) {
        throw new Error(`${response.status}: ${response.statusText}`);
      } 
      return response.json();
    })
    .then(datasets => datasets);