'use strict';
var fs = require('fs');
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
var InstanceType = 'm4.large';
//
//
// make the Instances required to support a forum
var startInstances = function(cinfo) {
    var services = cinfo['services'];
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


//get container info
exports.getInstanceId = function(forumName,arn) {
    var deferred = Promise.defer();
    var clusterName = 'c' + forumName
    var params = {
        cluster: clusterName,
        containerInstances: [arn]
    };
    ecs.describeContainerInstances(params, (error, data) => {
        if (error) {
            deferred.reject(new Error(error));
            console.error(error);
        } else {
            //       data['forum'] = forum;
            deferred.resolve(data['containerInstances'][0]);
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
exports.startTask = function(cloud,host) {
console.log('starting ', host);
console.log('cloud ', cloud);
var extraHosts = []
for (var i in cloud['services']) {
var hostname = cloud['services'][i]['name']
var ipAddress = cloud['Instances'][i]['PrivateIpAddress'];
extraHosts.push({hostname,ipAddress});
}
    var makevars = getMakevars();
    var deferred = Promise.defer();
    var params = {
        'taskDefinition':  host,
         'cluster': cloud['cname'],
         'overrides': { 
         "containerOverrides": [ 
          { 
            "environment": makevars,
            "name": host,
          },
          ],
          },
//          'placementConstraints': [
//              {
//              type: 'distinctInstance'
//           }],
          }
//if(extraHosts.length > 0){
//       params["overrides"]["containerOverrides"][0]['extraHosts'] = extraHosts;
//console.log('p',params);
//}

        ecs.startTask(params, function(err, data) {
            if (err) {
                deferred.reject(new Error(err));
                console.error(err);
           } else {
               console.log(data);
               deferred.resolve(data);
           }
        });
        

    return deferred.promise;
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
                    if (cinfo['Instances'].length > 0) {
                        console.log(forumName + ' instances already running')
                        ipromise = Promise.when();
                    } else {
                        //console.log(cinfo);
                        //console.log(cinfo);
                        ipromise = startInstances(cinfo)
                    }
                    ipromise.then(function(instances) {
for(i in cinfo['instances']) {
instanceId = cinfo['instances'][i]['instanceId']
console.log(instanceId);
}

                        // deferred.resolve(cluster, instances);
                        deferred.resolve(cinfo);
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
                if (cinfo['Instances'] !== undefined) {
                    var InstanceIds = [];
for(i in cinfo['Instances']) {
console.log(cinfo['Instances'][i]['InstanceId'])
InstanceIds.push(cinfo['Instances'][i]['InstanceId'])
}
console.log('i',InstanceIds);
if(InstanceIds.length > 0) {
                    ipromise = stopInstances(InstanceIds)
} else {
                    ipromise = Promise.when();
}
                } else {
                    ipromise = Promise.when();
                }
                ipromise.then(function(instances) {
                    console.log('stopping cluster for ' + forumName);
                    if (cinfo['cstatus'] == 'ACTIVE') {
                        if (cinfo['Instances'] !== undefined) {
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
                        deferred.resolve(cinfo);
                        //        deferred.resolve(instances, cluster);
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
        Instances: [],
        istatus: null,
        //list the required hosts
        hosts: {},
        services: [{name:'dbmongo'},{name:'lab'},{name:'paix01'}],
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
                        var PublicIpAddress = instance['PublicIpAddress']
                        var tags = instance['Tags']
                        for (var m in tags) {
                            var tag = tags[m];
                            if (tag['Key'] == 'forum' && tag['Value'] == forumName && InstanceId.substr(0, 2) == 'i-') {
                                cinfo['Instances'][l] = {InstanceId,PrivateIpAddress,PublicIpAddress };
                            }

                        }
                    }
                }
            }
        }
    }
    return (cinfo);
}



var getMakevars = function() {
    var makevars =[] 
    var fileBuffer = fs.readFileSync('Makevars');
    var vars_string = fileBuffer.toString();
    var vars_lines = vars_string.split("\n");
    for (var i in vars_lines) {
        var line = vars_lines[i]
        var spliteded = line.split(':=');
        var name = spliteded[0];
        var val = spliteded[1];
        if (name && val) {
            makevars.push({'name':name,'value':val});
        }
    }
   return makevars;
}

