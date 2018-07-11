var db = require("./db").db;
var Q = require("q");
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
  if(Object.keys(query).length === 0) {
//return (new Promise());
    return(Q.when());
   //// return(false);
  } else {
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
}
