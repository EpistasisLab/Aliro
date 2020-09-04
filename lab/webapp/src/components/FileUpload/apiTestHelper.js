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
export function apiReq(route, body) {
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
}
