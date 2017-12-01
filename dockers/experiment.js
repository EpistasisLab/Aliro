'use strict';
var Promise = require('q');
//launch a set of clusters to execute randomized workloads 
//of machine learning experiments

var awsm = require('./awsm');
// randomizing the order of experiments
var ranman = require('./ranman').retData();
// many forums, one complete list of datasets
var fora = ranman['grouped'];
var all = ranman['datasets'];

// handle arguments
// the default behavior for this script
var argv = require('minimist')(process.argv.slice(2));
var action = 'info';
if (argv['_'] && argv['_'].length > 0) {
    action = argv['_'];
}

// something to hold promises
// iterate over forums
for (var i in fora) {
    awsm.getForum(fora[i]['forum'], function(data) {
        var instances = data['instances']
        var cluster = data['cluster']
        if (action == 'info') {
            //console.log(instances);
        }
        var forum = data['forum']
        var doStartCluster, doStopCluster, doStartInstances, doStopInstances, doStartTasks, doStopTasks, doStopInstances;
        var InstanceIds = [];
        if (cluster['clusters'].length > 0) {
            for (var j in cluster['clusters']) {
                var c = cluster['clusters'][j];
                if (c['status']) {
                    console.log(forum, c['status']);
                    if (c['status'] == 'ACTIVE') {
                        doStopCluster = true;
                        if (c['registeredContainerInstancesCount'] >= 2) {
                            doStartTasks = true;
                        } else {
                            doStartInstances = true;
                        }
                    } else if (c['status'] == 'INACTIVE') {
                        doStartCluster = true;
                    }
                }
            }
        } else {
            doStartCluster = true;
            console.log('no cluster found');
        }
        if (instances && instances['Reservations']) {
            var reservations = instances['Reservations'];
            for (var k in reservations) {
                if (reservations[k]['Instances']) {
                    var instances = reservations[k]['Instances']
                    for (var l in instances) {
                        var instance = instances[l];
                        var InstanceId = instance['InstanceId']
                        var tags = instance['Tags']
                        //make sure the tags match
                        for (var m in tags) {
                            var tag = tags[m];
                            if (tag['Key'] == 'forum' && tag['Value'] == forum && InstanceId.substr(0, 2) == 'i-') {
                                doStopInstances = true;
                                InstanceIds.push(InstanceId);
                            }
                        }



                    }
                }
            }

        }


        if (action == 'start') {
            if (doStartTasks) {
                awsm.startTasks(forum)
            }
            if (doStartCluster) {
                awsm.startCluster(forum);
            }
            if (doStartInstances) {
                awsm.startInstances(forum);
            };
        } else if (action == 'stop') {
            if (doStopTasks) {
                console.log('stopping tasks for ' + forum);
                //awsm.destroyCluster(data);
            };
            if (doStopCluster) {
                console.log('stopping cluster ' + forum);
                awsm.stopCluster(forum);
            };
            if (doStopInstances && InstanceIds.length > 0) {
                console.log('stopping instances' + forum + InstanceIds);
                awsm.stopInstances(InstanceIds, forum);
            };
        }
    })
}
