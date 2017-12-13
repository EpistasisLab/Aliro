var seedrandom = require('seedrandom');
var fs = require('fs');

//returns randomized, ordered list of datasets 
exports.retRandomized = function(experiment) {
    var datasets = experiment.datasets;
    var random_seed = experiment.random_seed;
    var set_size = experiment.set_size;
    var rng = seedrandom(random_seed);
    var all;
    // randomize the ordering of an array
    function randomizer(arr) {
        var currentIndex = arr.length;
        var randomIndex;
        var temporyValue;
        while (0 !== currentIndex) {
            // Pick remaining element
            randomIndex = Math.floor(rng() * currentIndex);
            currentIndex -= 1;

            // swap with current 
            temporaryValue = arr[currentIndex]
            arr[currentIndex] = arr[randomIndex];
            arr[randomIndex] = temporaryValue;
        }
        return arr;
    }

    // creates numbered sets of {chunksize} from an array
    function groupem(arr, chunksize) {
        var grouped = {}
        var len = arr.length;
        var groupnum = Math.floor(len / chunksize);
        while (groupnum--) {
            var group = []
            grouped[groupnum]
            var cz = chunksize;
            var i = 0;
            while (cz-- > 0) {
                var val = cz + groupnum * chunksize;
                group.push(arr[val])
            }
            grouped[groupnum] = group;
        }
        return grouped;
    }

    var randomized = randomizer(datasets);
    var grouped = groupem(randomized, set_size);
    var experiments = [];

    for (group in grouped) {
        //forumName: 8 digit hex code for a group of datasets
        var forumName = rng().toString(16).substr(2, 8).toLowerCase();
        experiments.push({
            forumName: forumName,
            datasets: grouped[group]
        })
    }
    //where the magic happens.  order by forum name
    var experiments = experiments.sort(function(a, b) {
        return (a.forumName > b.forumName) ? 1 : ((b.forumName > a.forumName) ? -1 : 0);
    })
    var grouped = experiments
    return grouped;
}
