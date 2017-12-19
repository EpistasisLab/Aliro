'use strict';
// launch a forum or a set of forums
//of machine learning experiments
//
// utility functions and modules for interfacing building containers
// and cloud services
var awsm = require('./awsm');
var argv = require('minimist')(process.argv.slice(2));
//the maximum number of forums we can run at once
var action = 'info';
if (argv['_'].length > 0) {
    action = argv['_'][0];
}

//run in the cloud
var doCloud = false
if (argv['c'] || action == 'cloudinit' || action == 'clouddestroy') {
    doCloud = true;
}

//run from share 
var doShared = false
if (argv['s']) {
    doShared = true;
}
//be verbose
var verbose = false;
if (argv['v']) {
    verbose = true;
}
//load experiment data
var exP = awsm.syncFile('experiment.json');
exP.then(function(experiment) {
    //console.log(experiment);
    var randomized = awsm.ranman.retRandomized(experiment);
    //subset the first max_forums
    var forums = randomized.slice(0, experiment.max_forums);
    //get cloud resources
    var cloud = awsm.cloud.handleCloud(experiment, action, doCloud);
    cloud.then(function(c) {
        if (c !== undefined) {
            var cf = c[0].value
            var repos = c[1].value
            for (var i in experiment.services) {
                var service_name = experiment.services[i]['name'];
                if (repos[service_name] !== undefined && repos[service_name]['repositoryUri'] !== undefined)
                    experiment.services[i]['repositoryUri'] = repos[service_name]['repositoryUri'];
                if (repos[experiment.services[i].name] !== undefined) {
                    experiment.services[i].repositoryUri = repos[experiment.services[i].name].repositoryUri;
                }

            }
            var cloudResources = {}
            if (cf !== undefined && cf['StackResources'] !== undefined) {

                var resources = cf['StackResources'];
                for (var i in resources) {
                    var resource = resources[i];
                    var LogicalResourceId = resource['LogicalResourceId']
                    var PhysicalResourceId = resource['PhysicalResourceId']
                    if (resource['ResourceStatus'] == 'CREATE_COMPLETE') {
                        cloudResources[LogicalResourceId] = PhysicalResourceId;
                    } else {
                        cloudResources[LogicalResourceId] = null;
                    }
                }
            }
            experiment.cloudResources = cloudResources;
            var TaskP = awsm.cloud.handleTaskDefinitions(experiment, action);



        }
        //    console.log(forums);
        for (var i in forums) {
            var forum = forums[i];
            var forumName = forum['forumName'];
            var build;
            var options = {};
            forum['action'] = action;
            forum['doShared'] = doShared;
            forum['doCloud'] = doCloud;
            forum['verbose'] = verbose;
            forum['cloudResources'] = cloudResources;
            if (repos !== undefined) {}
            var infP = awsm.build(forum, experiment);
            infP.then(function(finfo) {
                if (finfo) {

                }
            }).catch(function(err) {
                console.log('error', err);
            });



            //}
        }
    }).catch(function(err) {
        console.log('something went wrong')
        console.log(err);
        deferred.reject(new Error(err));
    })
}).catch(function(err) {
    console.log('something went wrong')
    console.log(err);
    deferred.reject(new Error(err));
})
