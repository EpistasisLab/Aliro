require('es6-promise').polyfill();
import fetch from 'isomorphic-fetch';

export const fetchRecommender = () => 
  fetch('/api/recommender')
    .then(response => {
      if(response.status >= 400) {
        throw new Error(`${response.status}: ${response.statusText}`);
      } 
      return response.json();
    })
    .then(recommender => recommender);