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
var doCloud = true;
//if (!argv['c']) {
//    doCloud = false;
//}

//run from share 
var doShared = false
if (argv['p']) {
    doShared = true;
}

//specify a particular task/service/host
var tasks = []
if (argv['t']) {
    tasks = argv['t'].split(',');
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
    //break it down to just the first bit
    var forums = randomized.slice(0, experiment.max_forums);
    //get cloud resources
    //init - create the base resources to run the experiment
    //destroy - delete the base resources created for this experiment
    var cloud = awsm.cloud.handleCloud(experiment, action, doCloud);
    cloud.then(function(cf) {
        var cloudResources = {}
        if (cf !== undefined && cf['StackResources'] !== undefined) {

            var resources = cf['StackResources'];
            for (var i in resources) {
                var resource = resources[i];
                var LogicalResourceId = resource['LogicalResourceId']
                var PhysicalResourceId = resource['PhysicalResourceId']
                cloudResources[LogicalResourceId] = PhysicalResourceId;
            }
        }
        //    console.log(forums);
        for (var i in forums) {
            var forum = forums[i];
            var forumName = forum['forumName'];
            var build;
            var options = {};
            options['action'] = action;
            options['tasks'] = tasks;
            options['shared'] = doShared;
            options['verbose'] = verbose;
            options['cloudResources'] = cloudResources;
            if (doCloud) {
                build = awsm.cloudMan
            } else {
                build = awsm.metalMan
            }
            var infP = build(forum, experiment, options);
            infP.then(function(finfo) {

                if (finfo) {}
            }).catch(function(err) {
                console.log('error', err);
            });



            //}
        }
    });
}).catch(function(err) {
    console.log('something went wrong')
    console.log(err);
    deferred.reject(new Error(err));
})
