var FGLAB_URL = 'http://localhost:5080';

var redis = require("redis");
var socket = require('socket.io-client')('http://localhost:5080');
var rp = require('request-promise');
var sub = redis.createClient(), 
		pub = redis.createClient();

sub.on('subscribe', function(channel, count) {
	console.log('Subscribed to channel: ' + channel);
});

sub.on('message', function(channel, message) {
	if(channel === 'startExperiment') {
		rp({
			uri: FGLAB_URL + "/api/experiments/" + JSON.parse(message)._id,
      method: "GET"
    })
    .then((body) => {
    	socket.emit('startExperiment', body);
    })
    .catch(() => {}); // Ignore failures
	}
});

sub.subscribe('startExperiment');
//sub.subscribe('dataset');


module.exports.pub = pub;