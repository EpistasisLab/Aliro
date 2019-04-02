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

export const uploadFile = (route, body) => {
  // using headers with content type - multipart/form-data results in an error
  // when trying to upload a file from a form
  // error in question - Error: Multipart: Boundary not found
  // don't need to pass headers when uploading files with - check here:
  // https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
  return fetch("/api/v1/datasets", {
    method: 'PUT',
    credentials: 'include',
    body: body
  }).then(response => {
      return response.json();
    })
    .catch((err) => {
           throw(err);
    })
    .then((json) => {
      window.console.log('api helper json', json);
      return json;
    });
}
