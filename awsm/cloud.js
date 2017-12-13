'use strict';
var fs = require('fs');
var awsm = require('./');
var AWS = require('aws-sdk');
AWS.config.update({
    region: 'us-east-2'
});
var Q = require('q');
//launching containers and clusters
var ecs = new AWS.ECS({
    apiVersion: '2014-11-13'
});
//launching instances that belong to clusters
var ec2 = new AWS.EC2();
var ecr = new AWS.ECR();
var efs = new AWS.EFS();
var cloudformation = new AWS.CloudFormation();
var dryrun = false;


exports.handleCloud = function(experiment, action, doCloud) {
    if (!doCloud) {
        return Q.when();
    } else {
        var deferred = Q.defer();
        //create top level cloudformation stack
        if (action == 'init') {
            var params = {
                StackName: 'PennAI',
                /* required */
                //  OnFailure: 'DELETE',
                TemplateBody: JSON.stringify(experiment.cloudBase)
            };
            cloudformation.createStack(params, function(err, data) {
                if (err) deferred.reject(err); // an error occurred
                else deferred.resolve(data); // successful response
            });
        } else if (action == 'destroy') {
            var params = {
                StackName: 'PennAI',
                /* required */
            };
            cloudformation.deleteStack(params, function(err, data) {
                if (err) deferred.reject(err); // an error occurred
                else deferred.resolve(data); // successful response
            });
        } else {
            var params = {
                StackName: 'PennAI',
                /* required */
            };
            cloudformation.describeStackResources(params, function(err, data) {
                if (err) deferred.reject(err); // an error occurred
                else deferred.resolve(data); // successful response
            });
        }
    }
    return deferred.promise

}



//create repository
var handleRepos = function(experiment, action) {
    var deferred = Q.defer();
    var params = {};
    var promise_array = []
    ecr.describeRepositories(params, (error, data) => {
        if (error) {
            if (error['code']) {
                console.log('no ecs instances because ' + error['code']);
                deferred.resolve([]);
            } else {
                deferred.reject(new Error(error));
                console.error(error);
            }
        } else {
            var repos = {};
            if (data['repositories'] !== undefined) {
                var services = experiment.services;
                for (var j in data['repositories']) {
                    repos[data['repositories'][j]['repositoryName']] = data['repositories'][j];
                }
            }
            for (var i in services) {
                var service = services[i];
                if (repos[service.name] !== undefined && action == 'delete') {
                    promise_array.push(deleteRepo(service));
                } else if (action == 'create') {
                    promise_array.push(createRepo(service));
                }
            }
        }
    });
    if (action == 'create' || action == 'delete') {
        return (deferred.resolve(Q.allSettled(promise_array)));
    } else {
        return (deferred.promise);
    }
}






var deleteRepo = function(service) {
    console.log('deleting repo');
    var deferred = Q.defer();
    var params = {
        force: true,
        repositoryName: service['name'],
    }
    ecr.deleteRepository(params, (error, data) => {
        if (error) {
            if (error['code']) {
                console.log('could not delete repo because ' + error['code']);
                deferred.resolve([]);
            } else {
                deferred.reject(new Error(error));
            }
        } else {
            deferred.resolve(data);
        }
    });
    return deferred.promise
}


var createRepo = function(service) {
    console.log('creating repo');
    var deferred = Q.defer();
    var params = {
        repositoryName: service['name'],
    }
    ecr.createRepository(params, (error, data) => {
        if (error) {
            if (error['code']) {
                console.log('could not create repo because ' + error['code']);
                deferred.resolve([]);
            } else {
                deferred.reject(new Error(error));
            }
        } else {
            deferred.resolve(data);
        }
    });



}




//ECS (not EC2) container info
var getEcsInstances = function(forumName) {
    console.log('getting ECS instances');
    var deferred = Q.defer();
    var clusterName = 'c' + forumName
    var params = {
        cluster: clusterName,
    };
    ecs.listContainerInstances(params, (error, data) => {
        if (error) {
            if (error['code']) {
                console.log('no ecs instances because ' + error['code']);
                deferred.resolve([]);
            } else {
                deferred.reject(new Error(error));
                console.error(error);
            }
        } else {
            if (data['containerInstanceArns'] && data['containerInstanceArns'].length > 0) {
                var containerInstances = data['containerInstanceArns'];
                var descP = describeEcsInstances(forumName, containerInstances);
            } else {
                var descP = Q.when()
            }
            descP.then(function(description) {
                deferred.resolve(description);
            }).catch(function(err) {
                console.log('something went wrong')
                deferred.reject(new Error(err));
            })
        }
    });
    return deferred.promise;
}



//get container info
var describeEcsInstances = function(forumName, containerInstances) {
    var deferred = Q.defer();
    var clusterName = 'c' + forumName
    var params = {
        cluster: clusterName,
        containerInstances: containerInstances
    };
    ecs.describeContainerInstances(params, (error, data) => {
        if (error) {
            if (error['code']) {
                console.log('no container instances because' + error['code']);
                deferred.resolve([]);
            } else {
                deferred.reject(new Error(error));
                console.error(error);
            }

        } else {
            deferred.resolve(data['containerInstances']);
        }
    });
    return deferred.promise;
}



//get container info
var getTasks = function(forumName) {
    console.log('getting tasks');
    var deferred = Q.defer();
    var clusterName = 'c' + forumName
    var params = {
        cluster: clusterName,
    };
    ecs.listTasks(params, (error, data) => {
        if (error) {
            if (error['code']) {
                console.log('no tasks because ' + error['code']);
                deferred.resolve([]);
            } else {
                deferred.reject(new Error(error));
                console.error(error);
            }

        } else {
            if (data['taskArns'].length > 0) {
                var descP = describeTasks(forumName, data['taskArns'])
            } else {
                var descP = Q.when();
            }
            descP.then(function(description) {
                if (description !== undefined) {
                    deferred.resolve(description['tasks']);
                } else {
                    deferred.resolve([]);
                }
            }).catch(function(err) {
                console.log('something went wrong')
                deferred.reject(new Error(err));
            })
        }
    });
    return deferred.promise;
}
//get container info
var startTask = function(params) {
    var deferred = Q.defer();
    ecs.startTask(params, (error, data) => {
        if (error) {
            if (error['code']) {
                console.log('no tasks because' + error['code']);
                deferred.resolve([]);
            } else {
                deferred.reject(new Error(error));
                console.error(error);
            }
        } else {
            deferred.resolve(data);
        }
    });
    return deferred.promise;
}
var describeTasks = function(forumName, tasks) {
    var deferred = Q.defer();
    var clusterName = 'c' + forumName
    var params = {
        cluster: clusterName,
        tasks: tasks,
    };
    ecs.describeTasks(params, (error, data) => {
        if (error) {
            if (error['code']) {
                console.log('no clusters because' + error['code']);
                deferred.resolve([]);
            } else {
                deferred.reject(new Error(error));
                console.error(error);
            }

        } else {
            deferred.resolve(data);
        }
    });
    return deferred.promise;
}

//these cost money
var getEc2Instances = function(forumName) {
    console.log('getting EC2 instances');
    var params = {
        Filters: [{
            Name: 'tag:forum',
            Values: [forumName]
        }]
    };
    var deferred = Q.defer();
    ec2.describeInstances(params, (error, data) => {
        if (error) {
            if (error['code']) {
                console.log('no instances because ' + error['code']);
                deferred.resolve([]);
            } else {
                deferred.reject(new Error(error));
            }
        } else {
            var instances = [];
            if (data['Reservations']) {
                for (var i in data['Reservations']) {
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

//TODO: DELETE THIS HORRIBLE IDEA
var getMakevars = function(services) {
    var makevars = []
    var hosts = {}
    for (var i in services) {
        var service = services[i];
        hosts[service['name']] = service.instance['PrivateDnsName']

    }
    var fileBuffer = fs.readFileSync('./dockers/Makevars');
    var vars_string = fileBuffer.toString();
    var vars_lines = vars_string.split("\n");
    for (var i in vars_lines) {
        var line = vars_lines[i]
        var spliteded = line.split(':=');
        var name = spliteded[0];
        var val = spliteded[1];
        if (name.substr(-5) == '_HOST') {
            val = hosts[val];
        }
        if (name && val) {
            makevars.push({
                'name': name,
                'value': val
            });
        }
    }
    return makevars;
}
var formatCloud = function(experiment, forumName, cluster, iinstances, cinstances, tasks, cloudResources) {
    //cinstances accorinding to ECS
    var cinfo = {
        forumName: forumName,
        //everything is everything
        settled: false,
        //cluster status
        cstatus: null,
        //cluster name
        cname: null,
        //registered instances according to cluster
        ccount: 0,
        //tasks
        tcount: 0,
        //instance count according to ec2
        icount: 0,
        //InstanceIds
        instances: [],
        istatus: null,
        //list the required hosts
        hosts: {},
        services: experiment.services,
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
    for (var i in tasks) {
        var task = tasks[i];
        if (task['lastStatus'] == 'RUNNING') {
            cinfo['tcount']++
        }
    }
    var arns = {};
    for (var i in cinstances) {
        var cinstance = cinstances[i];
        var containerInstanceArn = cinstance['containerInstanceArn']
        var containerInstanceId = cinstance['ec2InstanceId']
        arns[containerInstanceId] = containerInstanceArn;
    }
    for (var i in iinstances) {
        var iinstance = iinstances[i];
        if (iinstance['State'] && iinstance['State']['Code'] == 16) {
            cinfo['istatus'] = 'ACTIVE';
            cinfo['icount']++;
            var InstanceId = iinstance['InstanceId']
            var containerInstanceArn = arns[iinstance['InstanceId']];
            var PrivateIpAddress = iinstance['PrivateIpAddress']
            var PublicIpAddress = iinstance['PublicIpAddress']
            var PrivateDnsName = iinstance['PrivateDnsName']
            var tags = iinstance['Tags']
            var tagsmatch = false;
            for (var m in tags) {
                var tag = tags[m];
                if (tag['Key'] == 'forum' && tag['Value'] == forumName && InstanceId.substr(0, 2) == 'i-') {
                    tagsmatch = true;
                }

            }
            if (tagsmatch) {
                cinfo['instances'].push({
                    containerInstanceArn,
                    InstanceId,
                    PrivateIpAddress,
                    PublicIpAddress,
                    PrivateDnsName
                });
            }
        }
    }
    if (cinfo['services'].length == cinfo['instances'].length && cinfo['ccount'] == cinfo['icount'] && cinfo['tcount'] == 0) {
        for (var i in cinfo['services']) {
            cinfo['services'][i]['instance'] = cinfo['instances'][i];
        }
        cinfo['makevars'] = getMakevars(cinfo['services']);
        var datasets = experiment['datasets'].join()
        cinfo['makevars'].push({
            name: 'forumName',
            value: forumName
        });
        cinfo['makevars'].push({
            name: 'datasets',
            value: datasets
        });
    }
    return (cinfo);
}

//shut down the cluster
var stopCluster = function(forumName) {
    var deferred = Q.defer();
    var clusterName = 'c' + forumName
    console.log('stopping ' + clusterName);
    var params = {
        cluster: clusterName,
    };
    if (dryrun) {
        deferred.resolve([]);
    } else {
        ecs.deleteCluster(params, (error, data) => {
            if (error) {
                if (error['code']) {
                    console.log('no clusters because ' + error['code']);
                    deferred.resolve([]);
                } else {
                    deferred.reject(new Error(error));
                    console.error(error);
                }

            } else {
                //       data['forum'] = forum;
                deferred.resolve(data);
            }
        });
    }
    return deferred.promise;
}
//
var startCluster = function(forumName) {
    var deferred = Q.defer();
    var clusterName = 'c' + forumName
    console.log("starting " + clusterName)
    var params = {
        clusterName: clusterName,
    };
    if (dryrun) {
        deferred.resolve([]);
    } else {
        ecs.createCluster(params, (error, data) => {
            if (error) {
                deferred.reject(new Error(error));
                console.error(error);
            } else {
                deferred.resolve(data);
            }
        });
    }
    return deferred.promise;
}

//
var stopInstances = function(instances) {
    var InstanceIds = [];
    for (var i in instances) {
        InstanceIds.push(instances[i]['InstanceId']);
    }
    var deferred = Q.defer();
    if (dryrun) {
        deferred.resolve([]);
    } else {
        ec2.terminateInstances({
            InstanceIds: InstanceIds
        }, (error, data) => {
            if (error) {
                deferred.reject(new Error(error));
                console.error(error);
            } else {
                deferred.resolve(data);
            }
        });
    }
    return deferred.promise;
};

// make the Instances required to support a forum
var addInstances = function(cinfo, service_name, count) {
    var deferred = Q.defer();
    var services = cinfo['services'];
    var params = {
        MaxCount: count,
        MinCount: count,
        ImageId: "ami-58f5db3d",
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
                Key: 'servicename',
                Value: service_name
            }, {
                Key: 'Name',
                Value: 'i' + cinfo['forumName']
            }]
        }, ],
        //set default cluster for fourum
        UserData: new Buffer("#!/bin/bash\necho ECS_CLUSTER=c" + cinfo['forumName'] + " >> /etc/ecs/ecs.config\n").toString('base64')
    };
    if (dryrun) {
        deferred.resolve([]);
    } else {
        ec2.runInstances(params, (error, data) => {
            if (error) {
                deferred.reject(new Error(error));
                console.error(error);
            } else {



                var promise_array = Array();
                for (var i = 0; i < count; i++) {
                    var hostname = task + '_' + i;
                    if (tasks.length == 0 || tasks.indexOf(hostname) >= 0) {
                        if (cinfo['services'][i]['instance'] !== undefined) {
                            var instanceId = cinfo['services'][i]['instance']['containerInstanceArn'];
                        } else {
                            var instanceId = cinfo['instances'][i]['containerInstanceArn'];
                        }
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
                        promise_array[i] = startTask(params);
                    }
                }
                //   return Promise.allSettled(promise_array);



                //        data['forum'] = forum;
                //            deferred.resolve(data);
            }
        });
    }
    return deferred.promise;
}

// make the Instances required to support a forum
var startInstances = function(cinfo) {
    var deferred = Q.defer();
    var services = cinfo['services'];
    var count = 0;
    for (var i in services) {
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
        ImageId: "ami-58f5db3d",
        InstanceType: "m4.large",
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
    if (dryrun) {
        deferred.resolve([]);
    } else {
        ec2.runInstances(params, (error, data) => {
            if (error) {
                deferred.reject(new Error(error));
                console.error(error);
            } else {
                //        data['forum'] = forum;
                deferred.resolve(data);
            }
        });
    }
    return deferred.promise;
}

var startTasks = function(cinfo) {
    console.log('starting tasks');
    var promise_array = Array(cinfo['services'].length)
    for (var i in cinfo['services']) {
        var hostname = cinfo['services'][i]['name'];
        if (cinfo['services'][i]['instance'] !== undefined) {
            var instanceId = cinfo['services'][i]['instance']['containerInstanceArn'];
        } else {
            var instanceId = cinfo['instances'][i]['containerInstanceArn'];
        }
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
        promise_array[i] = startTask(params);
    }
    return Q.allSettled(promise_array);




}


//get all cloud resources for a forum
exports.build = function(forum, experiment, options, cloudResources) {
    var action = options['action']
    var forumName = forum['forumName'];
    console.log('getting cloud');
    var getCluster = function(forumName) {
        var deferred = Q.defer();
        ecs.describeClusters({
            clusters: ['c' + forumName]
        }, (error, data) => {
            if (error) {
                if (error['code']) {
                    console.log('no clusters because ' + error['code']);
                    deferred.resolve([]);
                } else {
                    deferred.reject(new Error(error));
                    console.error(error);
                }
            } else {
                deferred.resolve(data);

            }
        });
        return deferred.promise;
    };






    var deferred = Q.defer();
    getCluster(forumName).then(function(cluster) {
        getEc2Instances(forumName).then(function(ec2instances) {
            getEcsInstances(forumName).then(function(ecsinstances) {
                getTasks(forumName).then(function(tasks) {
                    var cinfo = formatCloud(experiment, forumName, cluster, ec2instances, ecsinstances, tasks, cloudResources);
                    manageCloud(cinfo, action);
                    deferred.resolve(cinfo);

                }).catch(function(err) {
                    console.log('something went wrong')
                    deferred.reject(new Error(err));
                })

            }).catch(function(err) {
                console.log('something went wrong')
                deferred.reject(new Error(err));
            })


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

var manageCloud = function(finfo, action) {
    if (finfo['instances'].length == finfo['ccount'] && finfo['ccount'] == finfo['icount']) {
        finfo['settled'] = true;
    } else {
        finfo['settled'] = false;
    }
    if (action == 'info') {
        //    syncForum(finfo);
        console.log(finfo)
    }
    if (action == 'stop') {
        if (finfo['instances'].length > 0) {
            var iP = stopInstances(finfo['instances']);
        } else {
            console.log('instances already stopped');
            var iP = Q.when();
        }
        iP.then(function(instances) {
            if (finfo['ccount'] == 0 && finfo['settled']) {
                var cP = stopCluster(finfo['forumName']);
            } else {
                console.log('waiting for counts to settle');
                var cP = Q.when();
            }
            cP.then(function(cluster) {
                console.log('done')
                // console.log('stopped cluster')
            }).catch(function(err) {
                console.log('error', err);
            });
        });
    } else if (action == 'start') {
        if (finfo['cstatus'] != 'ACTIVE') {
            var cP = startCluster(finfo['forumName']);
        } else {
            console.log('cluster already running');
            var cP = Q.when();
        }
        cP.then(function(cluster) {
            if (finfo['icount'] == 0) {
                var iP = startInstances(finfo);
            } else {
                console.log('instances already running');
                var iP = Q.when();
            }
            iP.then(function(instances) {
                //make sure cluster and instances agree on count
                if (finfo['settled'] && finfo['services'].length == finfo['instances'].length) {
                    // && finfo['tcount'] ==0) {
                    var tP = startTasks(finfo);
                } else {
                    var tP = Q.when();
                }
                tP.then(function(tasks) {
                    console.log('done');
                    syncForum(finfo)
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
}