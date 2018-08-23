require('es6-promise').polyfill();
import fetch from 'isomorphic-fetch';

export const fetchPreferences = () => 
  fetch('/api/preferences')
    .then(response => {
      if(response.status >= 400) {
        throw new Error(`${response.status}: ${response.statusText}`);
      } 
      return response.json();
    })
    .then(preferences => preferences);