var awsm = require('./awsm');
var grouped = require('./ranman').retData();

var all;
// format the array returned by randomizer
// todo: clean up this mess
for (i in grouped) {
    if (grouped[i]['forum'] == 'all') {
        all = grouped[i]['datasets'];
        delete(grouped[i]);
    }
}
var grouped = grouped.slice(0,3)
for (i in grouped) {
var forum = grouped[i]['forum'];
var num_hosts = 2;
//console.log('creating stack to process group ' + forum)


//var stack = awsm.makeStack(forum,num_hosts,function(data) {
//var stack = awsm.rmStack(forum,function(data) {
var stack = awsm.grokStack(forum,function(data) {
console.log('f',forum)
console.log('d',data);
});
}
