var redis = require("redis");
var subscriber = redis.createClient(); 
var publisher = redis.createClient();

subscriber.on('subscribe', function(channel, count) {
	console.log('Subscribed to channel: ' + channel);
});

subscriber.subscribe('toggleAI');
subscriber.subscribe('startExperiment');

module.exports = {
	publisher: publisher,
	subscriber: subscriber
};