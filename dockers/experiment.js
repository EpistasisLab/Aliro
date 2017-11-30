var AWS = require('aws-sdk');
var argv = require('minimist')(process.argv.slice(2));
AWS.config.update({
    region: 'us-east-2'
});
var ecs = new AWS.ECS({
    apiVersion: '2014-11-13'
});
var ec2 = new AWS.EC2();

var ranman = require('./ranman').retData();
var fora = ranman['grouped'];
var all = ranman['datasets'];
var action = 'info';
if (argv['_'] && argv['_'].length > 0) {
    action = argv['_'];
}

// format the array returned by randomizer


var makeInstances = function(forum) {
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
        UserData: new Buffer("#!/bin/bash\necho ECS_CLUSTER=c" + forum + " >> /etc/ecs/ecs.config\n").toString('base64')
    };
    ec2.runInstances(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else console.log(data); // successful response
    });
}


var destroyCluster = function(forum) {
    var params = {
        cluster: 'c' + forum,
    };


    ecs.deleteCluster(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else console.log(data); // successful response
    });


}

var makeCluster = function(forum) {
    var params = {
        clusterName: 'c' + forum,
    };


    ecs.createCluster(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else console.log(data); // successful response
    });


}





var getInfo = function(forum, callback) {
    var params = {
        clusters: ['c' + forum]
    };
    ecs.describeClusters(params, function(err, data) {
        if (err) {
            console.log(err, err.stack); // an error occurred
            callback(false);
        } else {
            data['forum'] = forum;
            callback(data);
        }
    });
};
/*

        var params = {
            //    cluster: forum
        };
        ecs.listContainerInstances(params, function(err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else {
                console.log(data); // successful response
            }
        });
 */

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

for (i in fora) {
    var forum = fora[i]['forum'];
    getInfo(forum, function(data) {
        if (data && data['clusters']) {
            for (j in data['clusters']) {
                var cluster = data['clusters'][j]
                if (cluster['status'] && cluster['status'] == 'ACTIVE') {
                    console.log(data);
                    console.log(action);
                    if (action == 'start') {
                        if (cluster['registeredContainerInstancesCount'] >= 2) {
                            startTask(data['forum'], 'pilottaskdefinition:2')
                        } else {
                            makeInstances(data['forum']);
                        }
                    } else if (action == 'stop') {
                        destroyCluster(data['forum']);
                    } else {
                        console.log('dunno');
                    }
                }
            }
        };
    });
}