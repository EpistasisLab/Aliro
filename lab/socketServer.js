var socket = require('socket.io');
var subscriber = require("./pubsub").subscriber;
var rp = require('request-promise');

function socketServer(server) {
	var io = socket(server);
	var connections = [];

	io.on('connection', socket => {
		connections.push(socket);

		/*socket.on('startExperiment', data => {
			connections.forEach(connectedSocket => {
				connectedSocket.emit('startExperiment', data);
				if(connectedSocket !== socket) {
					connectedSocket.emit('startExperiment', data);
				}
			});
		});*/
	 
		socket.on('disconnect', () => {
			console.log('HERE');
		  var index = connections.indexOf(socket);
		  connections.splice(index, 1);
		});

	});

	if(subscriber) {
		subscriber.on('message', function(channel, message) {

			if(channel === 'toggleAI') {
				connections.forEach(connectedSocket => {
					connectedSocket.emit('toggleAI', message);
				});	
			}

			/*if(channel === 'startExperiment') {
				rp({
					uri: FGLAB_URL + "/api/experiments/" + JSON.parse(message)._id,
		      method: "GET"
		    })
		    .then((body) => {
		    	socket.emit('startExperiment', body);
		    })
		    .catch(() => {}); // Ignore failures
			}*/
		});
	}
};

module.exports = socketServer;

