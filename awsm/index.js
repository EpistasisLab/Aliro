var fs = require('fs');
var Q = require('q');
module.exports = {
    cloud: require('./cloud'),
    make: require('./make'),
    ranman: require('./ranman'),
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
