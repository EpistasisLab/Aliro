require('es6-promise').polyfill();
import fetch from 'isomorphic-fetch';

export const get = (route) => {
  return fetch(route, {
    credentials: 'include'
  }).then(checkStatus)
    .then(response => { 
      return response.json();
    })
    .catch((err) => {
           throw(`Error: ${err}, Route: ${route}`);
    })
    .then(json => json);
};

export const getFile = (route) => {
  return fetch(route, {
    credentials: 'include'
  }).then(checkStatus)
    .then(response => { 
      return response.blob();
    })
    .catch((err) => {
           throw(`Error: ${err}, Route: ${route}`);
    })
    .then(json => json);
};

export const post = (route, body) => {
  let myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/json');
  let myBody = JSON.stringify(body)

  return fetch(route, {
    method: 'POST',
    credentials: 'include',
    headers: myHeaders,
    mode: 'cors',
    cache: 'default',
    body: myBody
  }).then(checkStatus)
    .then(response => {
      return response.json();
    })
    .catch((err) => {
           throw(`Error: ${err}, Route: ${route}`);
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
  }).then(checkStatus)
    .then(response => {
      return response.json();
    })
    .catch((err) => {
           throw(`Error: ${err}, Route: ${route}`);
    })
    .then(json => json);
};


function checkStatus(response) {
  if (response.status >= 400) {
    var error = new Error(`${response.status}: ${response.statusText}`);
    error.response = response;
    throw error;
  } else {
    return response
  }
};
