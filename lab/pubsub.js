require("./env");
var redis = require("redis");
var users = require("./users");
var subscriber, publisher;
if (process.env.REDIS_PORT && process.env.REDIS_HOST) {
    subscriber = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST);
    publisher = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST);
    subscriber.on('subscribe', function(channel, count) {
        console.log('Subscribed to channel: ' + channel);
    });
    subscriber.subscribe('toggledAI');
    subscriber.subscribe('startedExperiment');
    subscriber.subscribe('finishedExperiment');
    subscriber.subscribe('failedExperiment');
} else {
    console.log("No redis server defined, pubsub disabled");
}

function publishToUser(channel, data, req) {
    if(!publisher) { return false; }

    users.returnUserData(req)
        .then((user) => {
            data.userid = user._id;
            publisher.publish(channel, JSON.stringify(data));
        })
        .catch((err) => {
            next(err);
        });
}

module.exports = {
    publisher: publisher,
    subscriber: subscriber,
    publishToUser: publishToUser
};