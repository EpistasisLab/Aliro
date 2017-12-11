'use strict';
//launch a set of clusters to execute randomized workloads 
//of machine learning experiments
//
// utility functions and modules for interfacing building containers
// and cloud services
var awsm = require('./awsm');
var argv = require('minimist')(process.argv.slice(2));
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
console.log('experiment');
var exP = awsm.syncFile('experiment.json');
exP.then(function(experiment) {
    var randomized = awsm.ranman.retData(experiment.datasets);

    console.log(randomized);
}).catch(function(err) {
    console.log('something went wrong')
    deferred.reject(new Error(err));
})
var forums = [];
for (var i in forums) {
    var forum = forums[i];
    forum['datasets'] = forum['datasets'].slice(0, 3);
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
