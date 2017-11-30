var grouped = require('./ranman').retData();
var AWS = require('aws-sdk');
AWS.config.update({
    region: 'us-east-2'
});
var ecs = new AWS.ECS({
    apiVersion: '2014-11-13'
});



var all;
// format the array returned by randomizer
// todo: clean up this mess
for (i in grouped) {
    if (grouped[i]['forum'] == 'all') {
        all = grouped[i]['datasets'];
        delete(grouped[i]);
    }
}
var grouped = grouped.slice(0, 3)
for (i in grouped) {
    var forum = grouped[i]['forum'];
    var num_hosts = 2;



    var params = {
      clusters: [forum]
    };
    ecs.describeClusters(params, function(err, data) {
      if (err) console.log(err, err.stack); // an error occurred
      else     console.log(data);           // successful response
    });

    /*
    var params = {
        cluster: forum
    };
    ecs.listContainerInstances(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else console.log(data); // successful response
    });
    /*
    var params = {
      clusterName: forum,
    };


    ecs.createCluster(params, function(err, data) {
      if (err) console.log(err, err.stack); // an error occurred
      else     console.log(data);           // successful response
    });


    /*
 var params = {
  cluster: forum, 
  taskDefinition: "pilottaskdefinition:2"
 };
 ecs.runTask(params, function(err, data) {
   if (err) console.log(err, err.stack); // an error occurred
   else     console.log(data);           // successful response
 });
   */
    //var stack = awsm.makeStack(forum,num_hosts,function(data) {
    //var stack = rmStack(forum,function(data) {
    //var stack = awsm.grokStack(forum,function(data) {
    //console.log('f',forum)
    //console.log('d',data);
    //});
}
