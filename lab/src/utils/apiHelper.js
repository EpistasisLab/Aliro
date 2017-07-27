require('es6-promise').polyfill();
import fetch from 'isomorphic-fetch';

export const get = (route) => {
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

export const getFile = (route) => {
  return fetch(route, {
    credentials: 'include'
  })
    .then(response => {
      if(response.status >= 400) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }  
      return response.blob();
    })
    .then(json => json);
};

export const post = (route, body) => {
  let myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/json');

  return fetch(route, {
    method: 'POST',
    credentials: 'include',
    headers: myHeaders,
    mode: 'cors',
    cache: 'default',
    body: JSON.stringify(body)
  })
    .then(response => {
      if(response.status >= 400) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      return response.json();
    })
    .then(json => json);
};

export const put = (route, body) => {
  let myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/json');

  return fetch(route, {
    method: 'PUT',
    credentials: 'include',
    headers: myHeaders,
    mode: 'cors',
    cache: 'default',
    body: JSON.stringify(body)
  })
    .then(response => {
      if(response.status >= 400) {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
      return response.json();
    })
    .then(json => json);
};