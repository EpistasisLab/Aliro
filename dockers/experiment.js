'use strict';
//launch a set of clusters to execute randomized workloads 
//of machine learning experiments
var Promise = require('q');
// cloud functions
var awsm = require('./awsm');
// randomizing the order of experiments
var make = awsm.make
//make a particular host
var host = false
//
var ranman = awsm.randomizer.retData();
// many forums, one complete list of datasets
var forums = ranman['grouped'];
var alldata = ranman['datasets'];
// handle arguments
var argv = require('minimist')(process.argv.slice(2));
// the default behavior for this script
var action = 'info';
if (argv['_'] && argv['_'].length > 0) {
    action = argv['_'][0];
}
//sync with the filesystem
var doSync = false
if (argv['s']) {
    doSync = true;
}
//specify a particular task/service
var tasks = []
if (argv['t']) {
    tasks = argv['t'].split(',');
}
//parent db to inherit
var ParentForum = 'init';
if (argv['d']) {
    ParentForum = argv['d'];
}


// iterate over forums
for (var i in forums) {
    var forum = forums[i];
    var forumName = forum['forumName'];
    var cloudP = awsm.getCloud(forum);
    cloudP.then(function(finfo) {
            }).catch(function(err) {
                console.log('error', err);
            });
        }
    }).catch(function(err) {
        console.log('error', err);
    });
}
