'use strict';
//launch a set of clusters to execute randomized workloads 
//of machine learning experiments
var Promise = require('q');
// cloud functions
var awsm = require('./awsm');
// randomizing the order of experiments
var ranman = require('./ranman').retData();
// many forums, one complete list of datasets
var forums = ranman['grouped'];
var all = ranman['datasets'];
// handle arguments
var argv = require('minimist')(process.argv.slice(2));
// the default behavior for this script
var action = 'info';
if (argv['_'] && argv['_'].length > 0) {
    action = argv['_'][0];
}



// iterate over forums
for (var i in forums) {
    var forum = forums[i];
    var forumName = forum['forumName'];
    var cloudP, tasksP;
    if (['start', 'stop', 'info'].indexOf(action) >= 0) {
        cloudP = awsm.getCloud(forumName, action);
    } else {
        cloudP = Promise.when();
    }
        cloudP.then(function(cloud) {
           if (action == 'start') {
                tasksP = awsm.startTasks(cloud);
            } else if (action == 'stop') {
                //tasksP = awsm.stopTasks(cloud);
                taksP =  Promise.when();
            } else if (action == 'info') {
                //servicesP = awsm.listTasks(cloud);
                tasksP =  Promise.when();
                console.log(cloud);
            } else {
                tasksP =  Promise.when();
            }
            tasksP.then(function(services) {
               // console.log(cloud);
            }).catch(function(err) {
                console.log('error', err);
            });
        }).catch(function(err) {
            console.log('error', err);
        });
}
