//launch a set of clusters to execute randomized workloads 
//of machine learning experiments

var awsm = require('./awsm');
// randomizing the order of experiments
var ranman = require('./ranman').retData();
// many forums, one complete list of datasets
var fora = ranman['grouped'];
var all = ranman['datasets'];

// handle arguments
// the default behavior for this script
var argv = require('minimist')(process.argv.slice(2));
var action = 'info';
if (argv['_'] && argv['_'].length > 0) {
    action = argv['_'];
}


// iterate over forums
for (i in fora) {
    var forum = fora[i]['forum'];
    console.log('info for forum=' + forum);
    awsm.handleClusters(forum, function(data) {
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
