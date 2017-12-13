var fs = require('fs');
var Q = require('q');
var cloud = require('./cloud');
var make = require('./make');
var ranman = require('./ranman');
module.exports = {
    cloud: cloud,
    make: make,
    ranman: ranman,
    build: function(forum, experiment) {
        if (forum.doCloud) {
            return (cloud.build(forum, experiment))
        } else {
            return (make.build(forum, experiment))
        }
    },
    syncFile: function(filename, command) {
        var deferred = Q.defer();
        var doer;
        if (command == 'write') {
            doer = fs.writeFile;
        } else {
            doer = fs.readFile;
        }
        var P = doer(filename, 'utf8', (error, data) => {
            if (error) {
                deferred.reject(new Error(error));

            } else {
                obj = JSON.parse(data);
                deferred.resolve(obj);

            }
        });
        return deferred.promise;
    }

}