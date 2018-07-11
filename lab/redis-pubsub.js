var redis = require("redis");
var channels = require("./redis-channels");
var users = require("./users");
var getSockets = require("./socketServer").getSockets;

var subscriber, publisher, channelsByName = {};
if (process.env.REDIS_PORT && process.env.REDIS_HOST) {
  subscriber = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST);
  publisher = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST);

  subscriber.on('subscribe', function(channel, count) {
    console.log('Subscribed to channel: ' + channel);
  });

  channels.forEach(function(channel) {
    subscriber.subscribe(channel.name);
    channelsByName[channel.name] = channel;
  });

  subscriber.on('message', function(channel, message) {
  	emitTo(channel, message);
  });

} else {
    console.log("No redis server defined, pubsub disabled");
}

function publishTo(channel, req) {
	if(!publisher) { console.log('Publisher disabled'); }

	if(channelsByName[channel]) {
		var message = channelsByName[channel].prepareMessage(req);
		users.returnUserData(req)
      .then((user) => {
          // temp allows pennai to emit events to all sockets by not setting userid
          if(user.username !== 'pennai') { message.userid = user._id; } 
          
          //message.userid = user._id;
          publisher.publish(channel, JSON.stringify(message));
      })
      .catch(() => { console.log('User not found'); });
	} else {
		console.log('Channel does not exist: ' + channel);
	}
}

function emitTo(channel, message) {
	if(!subscriber) { console.log('Subscriber disabled'); }

	var userid = JSON.parse(message).userid;
	if(channelsByName[channel]) {
		if(userid) {
			var userSockets = getSockets().map((socket) => {
				if(socket.client.userid === userid) { return socket; }
			});

			channelsByName[channel].emitToSockets(message, userSockets);
		} else {
      // if no userid defined, emit to all sockets
      var allSockets = getSockets();
      channelsByName[channel].emitToSockets(message, allSockets);
    }
	} else {
		console.log('Channel does not exist: ' + channel);
	}
}

module.exports = {
  publishTo: publishTo
};