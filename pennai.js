'use strict';
// launch a forum or a set of forums
//of machine learning experiments
//
// utility functions and modules for interfacing building containers
// and cloud services
var awsm = require('./awsm');
var argv = require('minimist')(process.argv.slice(2));
//the maximum number of forums we can run at once
var num_forums = 3;
var set_size = 10;
var action = 'info';
if (argv['_'].length > 0) {
    action = argv['_'][0];
}

//run in the cloud
var doCloud = true;
if (!argv['c']) {
    doCloud = false;
    //only one forum at a time on metal
    num_forums = 1;
}

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
    //randomize the order of datasets and split them into groups of set_size
    var randomized = awsm.ranman.retRandomized(experiment);
    var forums = randomized.slice(0, num_forums);
    var cloud = awsm.cloud.handleCloud(experiment, action);


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
        if (doCloud) {
            build = awsm.cloudMan
        } else {
            build = awsm.metalMan
        }
        var infP = build(forum, experiment, options);
        infP.then(function(finfo) {
            if (finfo) {
                //                console.log(finfo);
                //console.log(finfo);
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
