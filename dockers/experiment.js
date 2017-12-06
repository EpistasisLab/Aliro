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
    var iP, cP, tP;
    var cloudP = awsm.getCloud(forumName);
    cloudP.then(function(finfo) {
        if (finfo['instances'].length == finfo['ccount'] && finfo['ccount'] == finfo['icount']) {
            finfo['settled'] = true;
        } else {
            finfo['settled'] = false;
        }
        if (action == 'info') {
            console.log(finfo)
        }
        if (action == 'stop') {
            if (finfo['instances'].length > 0) {
                iP = awsm.stopInstances(finfo['instances']);
            } else {
                console.log('instances already stopped');
                iP = Promise.when();
            }
            iP.then(function(instances) {
                if (finfo['ccount'] == 0 && settled) {
                    cP = awsm.stopCluster(finfo['forumName']);
                } else {
                    console.log('waiting for counts to settle');
                    cP = Promise.when();
                }
                cP.then(function(cluster) {
                    console.log('done')
                    // console.log('stopped cluster')
                });
            });
        } else if (action == 'start') {
            if (finfo['cstatus'] != 'ACTIVE') {
                cP = awsm.startCluster(finfo['forumName']);
            } else {
                console.log('cluster already running');
                cP = Promise.when();
            }
            cP.then(function(cluster) {
                if (finfo['icount'] == 0) {
                    iP = awsm.startInstances(finfo);
                } else {
                    console.log('instances already running');
                    iP = Promise.when();
                }
                iP.then(function(instances) {
                    //make sure cluster and instances agree on count
                    if (finfo['settled'] && finfo['services'].length == finfo['instances'].length) {
                        // && finfo['tcount'] ==0) {
                        tP = awsm.startTasks(finfo);
                    } else {
                        tP = Promise.when();
                    }
                    tP.then(function(tasks) {
                        console.log('done');
                        console.log(tasks);
                    }).catch(function(err) {
                        console.log('error', err);
                    });
                }).catch(function(err) {
                    console.log('error', err);
                });
            }).catch(function(err) {
                console.log('error', err);
            });



        }
    }).catch(function(err) {
        console.log('error', err);
    });
}