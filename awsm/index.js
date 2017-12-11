var fs = require('fs');
var Q = require('q');
var cloud = require('./cloud');
var make = require('./make');
var ranman = require('./ranman');
module.exports = {
    cloud: cloud,
    make: make,
    ranman: ranman,
    metalMan:make.build,
    cloudMan:cloud.build,
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
