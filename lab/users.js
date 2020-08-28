/* This file is part of the PennAI library.

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
var db = require("./db").db;
var Promise = require("bluebird");

//return a user data
exports.returnUserData = function(req) {
  var data = {}
  var query = {}

  //if the username is handled by the server, use that
  if(req.headers['x-forwarded-user']) {
    var username = req.headers['x-forwarded-user'];
    query = {username:username}
  } else if (req.body && req.body.apikey) {
    var apikey = req.body.apikey;
    query = {apikey:apikey}
  } else {
    var username = 'testuser';
    query = {username:username}
  }

  return new Promise(function(success, fail) {
      db.users.find(query).limit(1)
          .toArrayAsync()
          .then((results) => {
               success(results[0]);
          })
          .catch((err) => {
              fail(err);
          });
  });

}
