var fs = require('fs');
module.exports = {
  cloud: require('./cloud'),
  make: require('./make'),
  randomizer: require('./randomizer'),
  syncFile:function(filename, command) {
    var fileP = Promise.defer();
    var doer;
    if (command == 'write') {
        doer = fs.writeFile;
    } else {
        doer = fs.readFile;
    }
    var P = doer(filename, 'utf8', function(err, data) {
        if (err) throw err;
        obj = JSON.parse(data);
        fileP.resolve(obj);
    });
    return fileP;
}

}
