'use strict';
//launch a set of clusters to execute randomized workloads 
//of machine learning experiments
var Promise = require('q');
// cloud functions
var awsm = require('./dockers/awsm');
var cloud = awsm.cloud;
// randomizing the order of experiments
var ranman = awsm.randomizer.retData();
var make = awsm.make
// many forums, one complete list of datasets
var forums = ranman['grouped'];
var alldata = ranman['datasets'];
// handle arguments
var argv = require('minimist')(process.argv.slice(2));
// the default behavior for this script
var action = 'info';
if (argv['_'] && argv['_'].length > 0) {
    var permitted_actions = ['info', 'stop', 'start', 'build', 'push']
    action = argv['_'][0];
    if (permitted_actions.indexOf(action) == '-1') {
        console.log("action must be one of " + permitted_actions);
        process.exit()
    }
}

//sync with the filesystem
var doSync = false
if (argv['s']) {
    doSync = true;
}

//run in the cloud
var doCloud = true;
if (argv['c']) {
    doCloud = false;
}


//run in the cloud
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
var ParentForum = 'init';
if (argv['d']) {
    ParentForum = argv['d'];
}

//the services we'll need for each experiment
var services = [{
    name: 'dbmongo',
}, {
    name: 'lab'
}, {
    name: 'machine'
}, {
    name: 'paix01',
}];




//first 
forums = forums.slice(0,4);
// iterate over forums
for (var i in forums) {
var forum = forums[i];
forum['datasets'] = forum['datasets'].slice(0,3);
//console.log(forum['datasets']);
var forumName = forum['forumName'];
if (doCloud) {
console.log({action});
    var infP = cloud.cloudMan(forum, services, action, tasks);
} else {
    services.push({name: 'paiwww'});
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
