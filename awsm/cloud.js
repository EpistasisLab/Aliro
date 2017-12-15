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
    if (!doCloud && action !== 'push') {
        return Q.when();
    } else {
        var reposP = handleRepos(experiment, action);
        var cfP = Q.defer();
        //create top level cloudformation stack
        if (action == 'cloudinit') {
            console.log('creating cloud stack');
            var params = {
                StackName: 'PennAI',
                /* required */
                //  OnFailure: 'DELETE',
                TemplateBody: JSON.stringify(experiment.aws.stacks.base)
            };
            cloudformation.createStack(params, function(err, data) {
                if (err) console.log(err); // an error occurred
                else cfP.resolve(data); // successful response
            });
        } else if (action == 'clouddestroy') {
            console.log('destroying cloud stack');
            var params = {
                StackName: 'PennAI',
                /* required */
            };
            cloudformation.deleteStack(params, function(err, data) {
                if (err) cfP.reject(err); // an error occurred
                else cfP.resolve(data); // successful response
            });
        } else {
            var params = {
                StackName: 'PennAI',
                /* required */
            };
            cloudformation.describeStackResources(params, function(err, data) {
                if (err) {
                    if (err['code'] && err['code'] == 'ValidationError') {
                        cfP.resolve([]);
                    } else {
                        cfP.reject(err); // an error occurred
                    }
                } else {
                    cfP.resolve(data); // successful response
                }
            });
        }
        return Q.allSettled([cfP.promise, reposP]);
    }


}



//create repositories
var handleRepos = function(experiment, action) {
    var deferred = Q.defer();
    var params = {};
    var promise_array = []
    ecr.describeRepositories(params, (error, data) => {
        if (error) {
            if (error['code']) {
                console.log('no repos because ' + error['code']);
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
                if (repos[service.name] !== undefined && action == 'clouddestroy') {
                    promise_array.push(deleteRepo(service));
                } else if (action == 'cloudinit') {
                    promise_array.push(createRepo(service));
                }
            }
            deferred.resolve(repos);
        }
    });
    return (deferred.promise);
}

//delete a container repo
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
                console.log('no starttasks because' + error['code']);
            }
            console.log(error);
            deferred.reject(new Error(error));
            console.error(error);
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

var setHosts = function(services) {
    var hosts = {}
    for (var i in services) {
        var service = services[i];
        hosts[service['name']] = service.instance['PrivateDnsName']
        /*
                if (name.substr(-5) == '_HOST') {
                    val = hosts[val];
                }
                if (name && val) {
                    makevars.push({
                        'name': name,
                        'value': val
                    });
                }
        */
    }
    return hosts;
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
        ImageId: experiment.aws.ImageId,
        InstanceType: experiment.aws.InstanceType,
        KeyName: experiment.aws.KeyName,
        services: experiment.services,
        makevars: [],
        //
    }
    for (var i in cloudResources) {
        cinfo[i] = cloudResources[i];
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
        for (var i in experiment.global) {
            var name = i;
            var value = experiment.global[i];
            if (name && value) {

                cinfo['makevars'].push({
                    name: name,
                    value: value
                });


            }
        }
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
var stopCluster = function(cinfo) {
    var forumName = cinfo['forumName'];
    var deferred = Q.defer();
    var clusterName = 'c' + forumName
    console.log('stopping ' + clusterName);
    var params = {
        cluster: clusterName,
    };
    if (dryrun) {
        deferred.resolve([]);
    } else {
        console.log('delete')
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
var startCluster = function(cinfo) {
    var forumName = cinfo['forumName'];
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
                if (error['code']) {
                    console.log('can not create cluster because ' + error['code']);
                    deferred.resolve([]);
                } else {
                    console.error(error);
                    deferred.reject(new Error(error));
                };
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
var startInstances = function(cinfo) {
    var services = cinfo['services'];
    var promise_array = Array(services.length);
    for (var i in services) {
        //build instance request
        var deferred = Q.defer();
        promise_array[i] = deferred;
        var service = services[i];
        if (service['num'] !== undefined) {
            console.log(service);
            var count = service['num'];
        } else {
            var count = 1;
        }
        var name = service['name']

        var params = {
            MaxCount: count,
            MinCount: count,
            ImageId: cinfo['ImageId'],
            SecurityGroupIds: [cinfo['SecurityGroup']],
            SubnetId: cinfo['Subnet'],
            InstanceType: cinfo['InstanceType'],
            KeyName: cinfo['KeyName'],
            IamInstanceProfile: {
                Name: "ecsInstanceRole"
            },
            TagSpecifications: [{
                ResourceType: 'instance',
                Tags: [{
                    Key: 'forum',
                    Value: cinfo['forumName']
                }, {
                    Key: 'Name',
                    Value: 'i' + cinfo['forumName']
                }, {
                    Key: 'service',
                    Value: name
                }]
            }],
            //set default cluster for fourum
            UserData: new Buffer("#!/bin/bash\necho ECS_CLUSTER=c" + cinfo['forumName'] + " >> /etc/ecs/ecs.config\n").toString('base64')
        };
        if (dryrun) {
            deferred.resolve([]);
        } else {
            ec2.runInstances(params, (error, data) => {
                if (error) {
                    deferred.reject(new Error(error));
                    //console.error(error);
                    console.log(params);
                } else {
                    //        data['forum'] = forum;
                    deferred.resolve(data);
                }
            });
        }
    }
    return Q.allSettled(promise_array);
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
        console.log(cinfo);
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
        console.log({
            params
        });
        promise_array[i] = startTask(params);
    }
    return Q.allSettled(promise_array);




}


//get all cloud resources for a forum
exports.build = function(forum, experiment) {
    var action = forum.action;
    var cloudResources = forum['cloudResources'];
    var forumName = forum['forumName']
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
                    //            console.log(cloudResources);
                    //merge cloud data
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

var manageCloud = function(cinfo, action) {
    //things are settled when ec2 and ecs counts are the same
    if (cinfo['instances'].length == cinfo['ccount'] && cinfo['ccount'] == cinfo['icount']) {
        cinfo['settled'] = true;
    } else {
        cinfo['settled'] = false;
    }
    if (action == 'info') {
        console.log({
            cinfo
        })
    }
    if (action == 'stop') {
        if (cinfo['instances'].length > 0) {
            var iP = stopInstances(cinfo['instances']);
        } else {
            console.log('instances already stopped');
            var iP = Q.when();
        }
        iP.then(function(instances) {
            if (cinfo['ccount'] == 0 && cinfo['settled']) {
                var cP = stopCluster(cinfo);
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
        if (cinfo['cstatus'] != 'ACTIVE') {
            var cP = startCluster(cinfo);
        } else {
            console.log('cluster already running');
            var cP = Q.when();
        }
        cP.then(function(cluster) {
            if (cinfo['icount'] == 0) {
                var iP = startInstances(cinfo);
            } else {
                console.log('instances already running');
                var iP = Q.when();
            }
            iP.then(function(instances) {
                //make sure cluster and instances agree on count
                if (cinfo['settled'] && cinfo['services'].length == cinfo['instances'].length) {
                    // && cinfo['tcount'] ==0) {
                    var tP = startTasks(cinfo);
                } else {
                    var tP = Q.when();
                }
                tP.then(function(tasks) {
                    console.log('done');
                    // syncForum(cinfo)
                    //console.log(tasks);
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