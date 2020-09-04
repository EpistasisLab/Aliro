/* ~This file is part of the PennAI library~

Copyright (C) 2017 Epistasis Lab, University of Pennsylvania

PennAI is maintained by:
    - Heather Williams (hwilli@upenn.edu)
    - Weixuan Fu (weixuanf@pennmedicine.upenn.edu)
    - William La Cava (lacava@upenn.edu)
    - and many other generous open source contributors

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.

*/
require('es6-promise').polyfill();
import fetch from 'isomorphic-fetch';
const FormData = require('form-data');


export const get = (route) => {
  return fetch(route, {
    credentials: 'include'
  }).then(checkStatus)
    .then(response => { 
      return response.json();
    })
    .catch((err) => {
           throw(err);
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
           throw(err);
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
           throw(err);
    })
    .then(json => json);
};

export const put = (route, body, stringify=true, contentType='application/json') => {
  let myHeaders = new Headers();
  myHeaders.append('Content-Type', contentType);
  
  if (stringify) { body = JSON.stringify(body) }

  return fetch(route, {
    method: 'PUT',
    credentials: 'include',
    headers: myHeaders,
    mode: 'cors',
    cache: 'default',
    body: body
  }).then(checkStatus)
    .then(response => {
      return response.json();
    })
    .catch((err) => {
           throw(err);
    })
    .then(json => json);
};

export const putFormData = (route, form) => {
  let myHeaders = new Headers();
  myHeaders.append('Content-Type', 'multipart/form-data');
  
  /*
  def form = new FormData();

  Object.keys(data).forEach(function(key) {
    //console.log(`key: ${key}`)
    form.append(key, data[key]);
  });
*/
  return fetch(route, {
    method: 'PUT',
    credentials: 'include',
    body: form
  }).then(checkStatus)
    .then(response => {
      return response.json();
    })
    .catch((err) => {
           throw(err);
    })
    .then(json => json);
};


function checkStatus(response) {
  if (response.status >= 400) {
    //console.log(`error: ${response.error}`)
    var error = new Error(`${response.status}: ${response.statusText} : ${response.url}`);
    error.response = response;
    throw error;
  } else {
    return response
  }
};
