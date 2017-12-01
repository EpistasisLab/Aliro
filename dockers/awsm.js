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

// make the Instances required to support a forum
exports.startInstances = function(forum) {
    var deferred = Promise.defer();
    var params = {
        MaxCount: 2,
        MinCount: 2,
        ImageId: 'ami-7f735a1a',
        InstanceType: 't2.medium',
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
                Value: forum
            }, {
                Key: 'Name',
                Value: 'i' + forum
            }]
        }, ],
        //set default cluster for fourum
        UserData: new Buffer("#!/bin/bash\necho ECS_CLUSTER=c" + forum + " >> /etc/ecs/ecs.config\n").toString('base64')
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
exports.stopCluster = function(forum) {
    var deferred = Promise.defer();
    var clusterName = 'c' + forum
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
exports.startCluster = function(forum) {
    var deferred = Promise.defer();
    var clusterName = 'c' + forum
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

exports.stopInstances = function(InstanceIds) {
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

var handleInstances = function(forum) {
    var params = {
        Filters: [{
            Name: 'tag:forum',
            Values: [forum]
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
exports.getForum = function(forum, callback) {
    handleCluster(forum).then(function(cluster) {
        handleInstances(forum).then(function(instances) {
            callback({
                cluster,
                instances,
                forum
            });
        }).catch(function(errr) {
            console.log('something went wwrong')
            console.log(errr);
            process.exit();
        });
    }).catch(function(err) {
        console.log('something went wrong')
        console.log(err);
        process.exit();
    });
};
//
var handleCluster = function(forum) {
    var deferred = Promise.defer();
    ecs.describeClusters({
        clusters: ['c' + forum]
    }, (error, data) => {
        if (error) {
            deferred.reject(new Error(error));
            console.error(error);
        } else {
            data['forum'] = forum;
            deferred.resolve(data);

        }
    });
    return deferred.promise;
};


//
var startTask = function(forum, taskDefinition) {
    var params = {
        cluster: 'c' + forum,
        taskDefinition: taskDefinition
    };
    ecs.runTask(params, function(err, data) {
        if (err) {
            console.log(err, err.stack); // an error occurred
            // callback(false);
        } else {
            data['forum'] = forum;
            console.log(data);
            //         callback(data);
        }
    });
}