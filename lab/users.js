require("./env"); // Load configuration variables
var db = require("./db").db;
//return a user data
exports.returnUsername = function(req) {
    return new Promise(function(success, fail) {
        returnUserData(req)
            .then((results) => {
            var username = results[0]['username'];
            success(username);
            })
            .catch((err) => {
                fail(err);
            });
    });
}
returnUserData = function(req) {
  var data = {}
  var query = {}
  //if the username is handled by the server, use that
  if(req.headers['X-Forwarded-User:']) {
    var username = req.headers['X-Forwarded-User:'];
    query = {username:username}
  } else if (req.body && req.body.apikey) {
    var apikey = req.body.apikey;
    query = {apikey:apikey}
  } else {
    var username = 'testuser'; 
    query = {username:username}
  }
  if(Object.keys(query).length === 0) {
    return(false);
  } else {
    return new Promise(function(success, fail) {
        db.users.find(query).limit(1)
            .toArrayAsync()
            .then((results) => {
                 success(results);
            })
            .catch((err) => {
                fail(err);
            });
    });

   
  }
}
