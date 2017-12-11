'use strict';
// launch a forum or a set of forums
//of machine learning experiments
//
// utility functions and modules for interfacing building containers
// and cloud services
var awsm = require('./awsm');
var argv = require('minimist')(process.argv.slice(2));
//the maximum number of forums we can run at once
var num_forums = 3;
var action = 'info';
if (argv['_'].length >0 ) {
action = argv['_'][0];
}

//run in the cloud
var doCloud = true;
if (!argv['c']) {
doCloud = false;
//only one forum at a time on metal
num_forums=1;
}

//run from share 
var doShared = false
if (argv['p']) {
    doShared = true;
}

//specify a particular task/service/host
var tasks = []
if (argv['t']) {
    tasks = argv['t'].split(',');
}


//parent db to inherit
if (argv['d']) {
    ParentForum = argv['d'];
}

//load experiment data
var exP = awsm.syncFile('experiment.json');
exP.then(function(experiment) {
//console.log(experiment);
    var randomized = awsm.ranman.retData(experiment.datasets,experiment.random_seed);
var forums = randomized.slice(0,num_forums);
//    console.log(forums);
for (var i in forums) {
    var forum = forums[i];
console.log(forum);
    var forumName = forum['forumName'];
    if (doCloud) {
        console.log({
            action
        });
        //infrastructure in the cloud
        var infP = awsm.cloudMan(forum, experiment, action, tasks);
    } else {
        //infrastructure on the metal
        var infP = awsm.metalMan(forum, experiment, action, tasks);
    }
    infP.then(function(finfo) {
        if (finfo) {
            //console.log(finfo);
        }
    }).catch(function(err) {
        console.log('error', err);
    });
    //}
}
}).catch(function(err) {
    console.log('something went wrong')
console.log(err);
    deferred.reject(new Error(err));
})
