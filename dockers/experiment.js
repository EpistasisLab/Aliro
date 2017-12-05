'use strict';
//launch a set of clusters to execute randomized workloads 
//of machine learning experiments
var Promise = require('q');
// cloud functions
var awsm = require('./awsm');
// randomizing the order of experiments
var make = require('./make');
//
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
//parent db to inherit


// iterate over forums
for (var i in forums) {
    var forum = forums[i];
    var forumName = forum['forumName'];
    var cloudP, tasksP, dbP, labP;
    if (['start', 'stop', 'info'].indexOf(action) >= 0) {
        cloudP = awsm.getCloud(forumName, action);
    } else {
        cloudP = Promise.when();
    }
    cloudP.then(function(cloud) {
        if (action == 'start') {
            var hostname = 'dbmongo';
            var tasksP = awsm.startTask(cloud,hostname);
            tasksP.then(function(task) {
                //console.log('task', task);
                var instanceArn = task['tasks'][0]['containerInstanceArn'];
console.log(instanceArn);
                // console.log('i', instanceArn);
                dbP = awsm.getInstanceId(forumName, instanceArn);
                dbP.then(function(data) {
//                    cloud['hosts']['dbmongo'] = cloud['InstanceIps'][cloud['InstanceIds'].indexOf(data['ec2InstanceId'])]
                    labP = awsm.startTask(cloud, 'lab');
                    labP.then(function(task) {
                        var instanceArn = task['tasks'][0]['containerInstanceArn'];
                        labP = awsm.getInstanceId(forumName, instanceArn);
                    });


                }).catch(function(err) {
                    console.log('e', err);
                });

                //console.log(db);
            });

        } else if (action == 'stop') {
            //tasksP = awsm.stopTasks(cloud);
            tasksP = Promise.when();
        } else if (action == 'info') {
            //servicesP = awsm.listTasks(cloud);
            tasksP = Promise.when();
            console.log(cloud);
        }
        tasksP.then(function(services) {}).catch(function(err) {
            console.log('error', err);
        });
    }).catch(function(err) {
        console.log('error', err);
    });
}
