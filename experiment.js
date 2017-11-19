var seedrandom = require('seedrandom');
var rng = seedrandom('NDE3MjNiYbIyYWE3MTZlZDI3MjFjNTFk');
//prime the pump
console.log(rng());          // Always 0.9282578795792454 
console.log(rng());          // Always 0.9282578795792454 
const testFolder = 'machine/datasets/byuser/testuser';
const fs = require('fs');


function getRandom(arr, n) {
    var result = new Array(n),
        len = arr.length,
        taken = new Array(len);
    if (n > len)
        throw new RangeError("getRandom: more elements taken than available");
    while (n--) {
        var x = Math.floor(rng() * len);
        result[n] = arr[x in taken ? taken[x] : x];
        taken[x] = --len;
    }
    return result;
}




fs.readdir(testFolder, (err, files) => {
  var random_eleven= getRandom(files,11);
  random_eleven.forEach(file => {
    console.log(testFolder + '/' + file+'/metadata.json');
  });
})

