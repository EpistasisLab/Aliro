var AWS = require('aws-sdk');
AWS.config.update({
    region: 'us-east-2'
});
var Promise = require('q');
//launching containers and clusters
var ecs = new AWS.ECS({
    apiVersion: '2014-11-13'
});
//launching instances that belong to clusters
var ec2 = new AWS.EC2();
//our default image
var ImageId = 'ami-7f735a1a';
//our default instance
var InstanceType = 't2.medium';
//
//
// make the Instances required to support a forum
var startInstances = function(cinfo) {
var services = cinfo['hosts'];
    var count = 0;
    for (i in services) {
        var service = services[i];
        if (service['num'] !== undefined) {
            count = count + service['num'];
        } else {
            count++
        }

    }
    var deferred = Promise.defer();
    var params = {
        MaxCount: count,
        MinCount: count,
        ImageId: ImageId,
        InstanceType: InstanceType,
        IamInstanceProfile: {
            Name: "ecsInstanceRole"
        },
        SecurityGroups: [
            'ssh', 'backend'
        ],
        TagSpecifications: [{
            ResourceType: 'instance',
            Tags: [{
                Key: 'forum',
                Value: cinfo['forumName']
            }, {
                Key: 'Name',
                Value: 'i' + cinfo['forumName']
            }]
        }, ],
        //set default cluster for fourum
        UserData: new Buffer("#!/bin/bash\necho ECS_CLUSTER=c" + cinfo['forumName'] + " >> /etc/ecs/ecs.config\n").toString('base64')
    };
    ec2.runInstances(params, (error, data) => {
        if (error) {
            deferred.reject(new Error(error));
            console.error(error);
        } else {
            //        data['forum'] = forum;
            deferred.resolve(data);
        }
    });
    return deferred.promise;
}


//shut down the cluster
var stopCluster = function(forumName) {
    var deferred = Promise.defer();
    var clusterName = 'c' + forumName
    console.log('stopping ' + clusterName);
    var params = {
        cluster: clusterName,
    };
    ecs.deleteCluster(params, (error, data) => {
        if (error) {
            deferred.reject(new Error(error));
            console.error(error);
        } else {
            //       data['forum'] = forum;
            deferred.resolve(data);
        }
    });
    return deferred.promise;
}

//
var startCluster = function(forumName) {
    var deferred = Promise.defer();
    var clusterName = 'c' + forumName
    console.log("starting " + clusterName)
    var params = {
        clusterName: clusterName,
    };
    ecs.createCluster(params, (error, data) => {
        if (error) {
            deferred.reject(new Error(error));
            console.error(error);
        } else {
            //            data['forum'] = forum;
            deferred.resolve(data);
        }
    });
    return deferred.promise;
}

var stopInstances = function(InstanceIds) {
    var deferred = Promise.defer();
    ec2.terminateInstances({
        InstanceIds: InstanceIds
    }, (error, data) => {
        if (error) {
            deferred.reject(new Error(error));
            console.error(error);
        } else {
            //console.log('err');
            //            data['forum'] = forum;
            deferred.resolve(data);
        }
    });
    return deferred.promise;
};

var getInstances = function(forumName) {
    var params = {
        Filters: [{
            Name: 'tag:forum',
            Values: [forumName]
        }]
    };
    var deferred = Promise.defer();
    ec2.describeInstances(params, (error, data) => {
        if (error) {
            deferred.reject(new Error(error));
            //console.error(error);
        } else {
            //console.log('err');
            //            data['forum'] = forum;
            deferred.resolve(data);
        }
    });
    return deferred.promise;
};
//
var getContainerInstances = function(forumName) {
    var deferred = Promise.defer();
    ecs.listTasks({
        cluster: 'c' + forumName
    }, (error, data) => {
        if (error) {
            deferred.reject(new Error(error));
            console.error(error);
        } else {
            data['forumName'] = forumName;
            deferred.resolve(data);

        }
    });
    return deferred.promise;
};

//
exports.stopTasks = function(forumName) {
    var deferred = Promise.defer();
    ecs.stopTask({
        cluster: 'c' + forumName
    }, (error, data) => {
        if (error) {
            deferred.reject(new Error(error));
            console.error(error);
        } else {
            data['forumName'] = forumName;
            deferred.resolve(data);

        }
    });
    return deferred.promise;
};

exports.listTasks = function(forumName) {
    var deferred = Promise.defer();
    ecs.listTasks({
        cluster: 'c' + forumName
    }, (error, data) => {
        if (error) {
            deferred.reject(new Error(error));
            console.error(error);
        } else {
            data['forumName'] = forumName;
            deferred.resolve(data);

        }
    });
    return deferred.promise;
};

var getCluster = function(forumName) {
    var deferred = Promise.defer();
    ecs.describeClusters({
        clusters: ['c' + forumName]
    }, (error, data) => {
        if (error) {
            deferred.reject(new Error(error));
            console.error(error);
        } else {
            data['forumName'] = forumName;
            deferred.resolve(data);

        }
    });
    return deferred.promise;
};


//
exports.startTasks = function(forumName,cloud) {
    var taskP = Promise.when();
//console.log('s',services);
//console.log('c',cloud);
    return taskP
}
exports.stopServices = function(forumName) {
    return Promise.when();
}

var startService = function(forumName, count, taskDefinition) {
    var deferred = Promise.defer();
    var params = {
        cluster: 'c' + forumName,
        taskDefinition: taskDefinition
    };
    ecs.runTask(params, function(err, data) {
        if (err) {
            deferred.reject(new Error(err));
            console.error(err);
        } else {
            deferred.resolve(data);
        }
    });
    return deferred.promise;
}


exports.getCloud = function(forumName, action) {
    var deferred = Promise.defer();
    getCluster(forumName).then(function(cluster) {
        getInstances(forumName).then(function(instances) {
            var cinfo = parseForum(forumName, cluster, instances);
            if (action == 'info') {
                deferred.resolve(cinfo);
                //Start up the resources
            } else if (action == 'start') {
                console.log('starting cluster for ' + forumName);
                var cpromise;
                var ipromise;
                if (cinfo['cstatus'] == 'ACTIVE') {
                    console.log(forumName + ' cluster already running')
                    cpromise = Promise.when();
                } else {
                    cpromise = startCluster(forumName)
                }
                cpromise.then(function(cluster) {
                    console.log('starting instances for ' + forumName);
                    if (cinfo['InstanceIds'].length > 0) {
                        console.log(forumName + ' instances already running')
                        ipromise = Promise.when();
                    } else {
//console.log(cinfo);
console.log(cinfo);
                        ipromise = startInstances(cinfo)
                    }
                    ipromise.then(function(instances) {

                        deferred.resolve(cluster, instances);
                    }).catch(function(err) {
                        deferred.reject(new Error(err));
                        console.log('something went wrong')
                        error.log(err);
                        //           process.exit();
                    });
                }).catch(function(err) {
                    console.log('something went wwrong')
                    deferred.reject(new Error(err));
                    error.log(err);
                    //            process.exit();
                });
                //Stop the resources
            } else if (action == 'stop') {
                var ipromise;
                var cpromise;
                if (cinfo['InstanceIds'].length > 0) {
                    console.log('stopping' + cinfo['InstanceIds'])
                    ipromise = stopInstances(cinfo['InstanceIds'])
                } else {
                    ipromise = Promise.when();
                }
                ipromise.then(function(instances) {
                    console.log('stopping cluster for ' + forumName);
                    if (cinfo['cstatus'] == 'ACTIVE') {
                        if (cinfo['InstanceIds'].length == 0) {
                            cpromise = stopCluster(forumName);
                        } else {
                            console.log(forumName + ' has active instances');
                            cpromise = Promise.when();
                        }
                    } else {
                        console.log('no running cluster  ' + forumName)
                        cpromise = Promise.when();
                    }
                    cpromise.then(function(cluster) {
                        deferred.resolve(instances, cluster);
                    }).catch(function(err) {
                        console.log('something went wwwrong')
                        deferred.reject(new Error(err));
                        error.log(err);
                        //            process.exit();
                    });
                }).catch(function(err) {
                    console.log('something went wwwwrong')
                    deferred.reject(new Error(err));
                    error.log(err);
                    //            process.exit();
                });
            }

        }).catch(function(err) {
            console.log('something went wwwwwrong')
            deferred.reject(new Error(err));
            error.log(err);
        });
    }).catch(function(err) {
        console.log('something went wwwwwwrong')
        deferred.reject(new Error(err));
        error.log(err);
    });
    return deferred.promise;
}





var parseForum = function(forumName, cluster, instances) {

    /*      
     Parse cluster data and store interesting things along with instance stats
    */
    var cinfo = {
        //cluster status
        forumName: forumName,
        cstatus: null,
        //cluster name
        cname: null,
        //registered instances according to cluster
        ccount: 0,
        //
        InstanceIds: [],
        InstanceIps: [],
        istatus: null,
        //list the required hosts
        hosts: [{
                name: 'dbmongo'
            }, {
                name: 'lab'
            }, {
                name: 'paix01'
            }],
        //instance count according to ec2
        icount: 0,
        //
    }
    if (cluster['clusters'] && cluster['clusters'].length > 0) {
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
                        var PrivateIpAddress = instance['PrivateIpAddress']
                        var tags = instance['Tags']
                        for (var m in tags) {
                            var tag = tags[m];
                            if (tag['Key'] == 'forum' && tag['Value'] == forumName && InstanceId.substr(0, 2) == 'i-') {
                                cinfo['InstanceIds'].push(InstanceId);
                                cinfo['InstanceIps'].push(PrivateIpAddress);
                            }

                        }
                    }
                }
            }
        }
    }
    return (cinfo);
}
