require("./env");
var redis = require("redis");
var subscriber, publisher
if (process.env.REDIS_PORT && process.env.REDIS_HOST) {
    subscriber = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST);
    publisher = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST);
    subscriber.on('subscribe', function(channel, count) {
        console.log('Subscribed to channel: ' + channel);
    });
    subscriber.subscribe('toggleAI');
    subscriber.subscribe('finishExperiment');
} else {
    console.log("No redis server defined, pubsub disabled");
}

module.exports = {
    publisher: publisher,
    subscriber: subscriber
};