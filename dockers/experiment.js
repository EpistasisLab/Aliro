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
    action = argv['_'];
}

// iterate over forums
for (var i in forums) {
    awsm.getForum(forums[i]['forum'], function(data) {
        var forum = data['forum']
        var instances = data['instances']
        var cluster = data['cluster']
        var cinfo = {
            cstatus: null,
            cname: null,
            //registered instances according to cluster
            ccount: 0,
            //
            InstanceIds: [],
            istatus: null,
            //instance count according to ec2
            icount: 0,
            //
        }
        if (cluster['clusters'].length > 0) {
            for (var j in cluster['clusters']) {
                var c = cluster['clusters'][j];
                cinfo['cstatus'] = c['status'];
                cinfo['ccount'] = c['registeredContainerInstancesCount'];
                cinfo['cname'] = c['clusterName'];
            }
        }
        if (instances && instances['Reservations']) {
            var reservations = instances['Reservations'];
            for (var k in reservations) {
                if (reservations[k]['Instances']) {
                    var instances = reservations[k]['Instances']
                    for (var l in instances) {
                        var instance = instances[l];
                        if (instance['State']['Code'] == 16) {
                            cinfo['istatus'] = 'ACTIVE';
                            cinfo['icount']++;
                            var InstanceId = instance['InstanceId']
                            var tags = instance['Tags']
                            for (var m in tags) {
                                var tag = tags[m];
                                if (tag['Key'] == 'forum' && tag['Value'] == forum && InstanceId.substr(0, 2) == 'i-') {
                                    cinfo['InstanceIds'].push(InstanceId);
                                }

                            }
                        }
                    }
                }
            }
        }


        //Start up the resources
        if (action == 'start') {
            var cpromise;
            var ipromise;
            if (cinfo['cstatus'] == 'ACTIVE') {
                console.log(forum + 'already runnging')
                cpromise = Promise.when();
            } else {
                cpromise = awsm.startCluster(forum)
            }
            cpromise.then(function(cluster) {
                if (cinfo['InstanceIds'].length > 0) {
                    ipromise = Promise.when();
                } else {
                    ipromise = awsm.startInstances(forum)
                }
                ipromise.then(function(instances) {}).catch(function(err) {
                    console.log('something went wrong')
                    error.log(err);
                    //           process.exit();
                });
            }).catch(function(err) {
                console.log('something went wwrong')
                error.log(err);
                //            process.exit();
            });


            //Stop the resources
        } else if (action == 'stop') {
            var ipromise;
            var cpromise;
            if (cinfo['InstanceIds'].length > 0) {
                console.log('stopping' + cinfo['InstanceIds'])
                ipromise = awsm.stopInstances(cinfo['InstanceIds'])
            } else {
                ipromise = Promise.when();
            }
            ipromise.then(function(instances) {
                if (cinfo['cstatus'] == 'ACTIVE' && cinfo['InstanceIds'].length == 0) {
                    cpromise = awsm.stopCluster(forum);
                } else {
                    cpromise = Promise.when();
                }
                cpromise.then(function(cluster) {}).catch(function(err) {
                    console.log('something went wwwrong')
                    error.log(err);
                    //            process.exit();
                });
            }).catch(function(err) {
                console.log('something went wwwwrong')
                error.log(err);
                //            process.exit();
            });



        } else if (action == 'info') {
            console.log(cinfo);
        }
    })
}