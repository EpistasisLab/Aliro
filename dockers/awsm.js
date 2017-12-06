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


//shut down the cluster
exports.stopCluster = function(forumName) {
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
exports.startCluster = function(forumName) {
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


//get container info
exports.getInstanceId = function(forumName, arn) {
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
            //console.log(data);
            deferred.resolve(data['containerInstances'][0]);
        }
    });
    return deferred.promise;
}



//
exports.stopInstances = function(instances) {
    var InstanceIds = [];
    for (var i in instances) {
        InstanceIds.push(instances[i]['InstanceId']);
    }
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

// make the Instances required to support a forum
exports.startInstances = function(cinfo) {
    var deferred = Promise.defer();
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

//
exports.startTasks = function(cinfo) {
    var deferred = Promise.defer();
    var promise_array = Array(cinfo['services'].length)
    var extraHosts = []
    for (var i in cinfo['services']) {
        var hostname = cinfo['services'][i]['name'];
        var ipAddress = cinfo['instances'][i]['PrivateIpAddress'];
        extraHosts.push({
            hostname,
            ipAddress
        });
    }
    for (var i in cinfo['services']) {
        var hostname = cinfo['services'][i]['name'];
        var ipAddress = cinfo['instances'][i]['PrivateIpAddress'];
        var instanceId = cinfo['instances'][i]['InstanceId'];
        var params = {
            'containerInstances': [instanceId],
            'taskDefinition': hostname,
            'cluster': cinfo['cname'],
            'overrides': {
                'containerOverrides': [{
                    'environment': cinfo['makevars'],
                    'name': hostname,
                }, ],
            },
        }
        //if(extraHosts.length > 0){
        //       params["overrides"]["containerOverrides"][0]['extraHosts'] = extraHosts;
        //console.log('p',params);
        //}

        //console.log(params);

        promise_array[i] = startTask(params);
    }
    return Promise.allSettled(promise_array);

}




var startTask = function(params) {
    var deferred = Promise.defer();
    var deferred = Promise.defer();
    ecs.startTask(params, (error, data) => {
        if (error) {
            deferred.reject(new Error(error));
            console.error(error);
        } else {
            deferred.resolve(data);
        }
    });
    return deferred.promise;

}


exports.getCloud = function(forumName) {
    var getCluster = function(forumName) {
        var deferred = Promise.defer();
        ecs.describeClusters({
            clusters: ['c' + forumName]
        }, (error, data) => {
            if (error) {
                if (error['code']) {
                    console.log('no clusters because' + error['code']);
                    deferred.resolve([]);
                } else {
                    deferred.reject(new Error(error));
                    console.error(error);
                }
            } else {
                data['forumName'] = forumName;
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
                if (error['code']) {
                    console.log('no instances because' + error['code']);
                    deferred.resolve([]);
                } else {
                    deferred.reject(new Error(error));
                }
            } else {
                var instances = [];
                if (data['Reservations']) {
                    for (i in data['Reservations']) {
                        var Instances = data['Reservations'][i]['Instances']
                        for (var j in Instances) {
                            instances.push(Instances[j]);
                        }
                        //nstances[i] = instance;
                    }
                }
                //describeInstances
                if (instances.length > 0) {
                    deferred.resolve(instances);
                } else {
                    deferred.resolve(data);
                }
            }
        });
        return deferred.promise;
    };

    var getMakevars = function() {
        var makevars = []
        var fileBuffer = fs.readFileSync('Makevars');
        var vars_string = fileBuffer.toString();
        var vars_lines = vars_string.split("\n");
        for (var i in vars_lines) {
            var line = vars_lines[i]
            var spliteded = line.split(':=');
            var name = spliteded[0];
            var val = spliteded[1];
            if (name && val) {
                makevars.push({
                    'name': name,
                    'value': val
                });
            }
        }
        return makevars;
    }
    var formatCloud = function(forumName, cluster, instances) {
        /*      
         Parse cluster data and store interesting things along with instance stats
        */
        var cinfo = {
            forumName: forumName,
            settled: false,
            //cluster status
            cstatus: null,
            //cluster name
            cname: null,
            //registered instances according to cluster
            ccount: 0,
            //InstanceIds
            instances: [],
            istatus: null,
            //list the required hosts
            hosts: {},
            services: [{
                name: 'dbmongo'
            }, {
                name: 'lab'
            }, {
                name: 'paix01'
            }],
            //instance count according to ec2
            icount: 0,
            makevars: null,
            //
        }
        if (cluster['clusters'] && cluster['clusters'].length > 0) {
            for (var i in cluster['clusters']) {
                var c = cluster['clusters'][i];
                cinfo['cstatus'] = c['status'];
                cinfo['ccount'] = c['registeredContainerInstancesCount'];
                cinfo['cname'] = c['clusterName'];
            }
        }
        //console.log(instances);
        for (var i in instances) {
            var instance = instances[i];
            if (instance['State']['Code'] == 16) {
                cinfo['istatus'] = 'ACTIVE';
                cinfo['icount']++;
                var InstanceId = instance['InstanceId']
                var PrivateIpAddress = instance['PrivateIpAddress']
                var PublicIpAddress = instance['PublicIpAddress']
                var tags = instance['Tags']
                var tagsmatch = false;
                for (var m in tags) {
                    var tag = tags[m];
                    if (tag['Key'] == 'forum' && tag['Value'] == forumName && InstanceId.substr(0, 2) == 'i-') {
                        tagsmatch = true;
                    }

                }
                if (tagsmatch) {
                    cinfo['instances'].push({
                        InstanceId,
                        PrivateIpAddress,
                        PublicIpAddress
                    });
                }
            }
        }
        return (cinfo);
    }
    var deferred = Promise.defer();
    getCluster(forumName).then(function(cluster) {
        getInstances(forumName).then(function(instances) {
            var cinfo = formatCloud(forumName, cluster, instances);
            cinfo['makevars'] = getMakevars();
            deferred.resolve(cinfo);
        }).catch(function(err) {
            console.log('something went wrong')
            deferred.reject(new Error(err));
        });
    }).catch(function(err) {
        console.log('something went wrong')
        deferred.reject(new Error(err));
    });
    return deferred.promise;
}
