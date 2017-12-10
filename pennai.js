'use strict';
//launch a set of clusters to execute randomized workloads 
//of machine learning experiments
var Promise = require('q');
// container, cloud and randomization modules
var awsm = require('./awsm');
// functions for interfacing with cloud services
var cloud = awsm.cloud;
// randomizer functions
var ranman = awsm.ranman;
// build = awsm.build
var make = awsm.make

var exP = awsm.syncFile('experiment.json');
console.log(exP)
exP.then(function(experiment) {
console.log(experiment);
});
//var forums = ranman['grouped'];
//var alldata = ranman['datasets'];

//var forums = ranman['grouped'];
//var alldata = ranman['datasets'];
// handle arguments

    //sync with the filesystem
    if (argv['s']) {
        doSync = true;
    }

//run in the cloud
var doCloud = true;
if (argv['c']) {
    doCloud = false;
}

//run from a share (for development)
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

//the services we'll need for each experiment
var services = [{
    name: 'dbmongo',
}, {
    name: 'lab'
}, {
    name: 'machine',
    num: '51'
}, {
    name: 'paix01',
}];




//first 
forums = forums.slice(0, 1);
// iterate over forums
for (var i in forums) {
    var forum = forums[i];
    forum['datasets'] = forum['datasets'].slice(0, 3);
    //console.log(forum['datasets']);
    var forumName = forum['forumName'];
    if (doCloud) {
        console.log({
            action
        });
        var infP = cloud.cloudMan(forum, services, action, tasks);
    } else {
        services.push({
            name: 'paiwww'
        });
        var infP = make.build(forum, services, action, doShared, tasks);
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
