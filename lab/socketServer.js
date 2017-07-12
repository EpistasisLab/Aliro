var FGLAB_URL = 'http://localhost:5080';

var socket = require('socket.io');
var subscriber = require("./pubsub").subscriber;
var rp = require('request-promise');

function socketServer(server) {
	var io = socket(server);
	var connections = [];

	require('socketio-auth')(io, {
	  authenticate: function (socket, data, callback) {
	    socket.client.userid = data.userid;
	    connections.push(socket);
	 
	   	return callback(null, true);
	  }
	});

	io.on('connection', socket => {
	 
		socket.on('disconnect', () => {
		  var index = connections.indexOf(socket);
		  connections.splice(index, 1);
		});

	});

	if(subscriber) {
		subscriber.on('message', function(channel, message) {
			var msg = JSON.parse(message);

			var userSockets = [];
			if(msg.userid) {
				connections.forEach(function(connectedSocket) {
					if(connectedSocket.client.userid === msg.userid) {
						userSockets.push(connectedSocket);
					}
				});
			}

			if(channel === 'toggledAI') {
				userSockets.forEach(connectedSocket => {
					connectedSocket.emit('updateAIToggle', message);
				});	
			}

			if(channel === 'startedExperiment') {
				rp({
					uri: FGLAB_URL + "/api/userexperiments/" + JSON.parse(message)._id,
		      method: "GET"
		    })
		    .then((body) => {
		    	userSockets.forEach(connectedSocket => {
		    		if(connectedSocket !== socket) {
							connectedSocket.emit('addExperiment', body);
						}
					});
		    })
		    .catch(() => {}); // Ignore failures
			}

			if(channel === 'finishedExperiment') {
				// call api directly from file to get information
				rp({
					uri: FGLAB_URL + "/api/userexperiments/" + JSON.parse(message)._id,
		      method: "GET"
		    })
		    .then((body) => {
		    	userSockets.forEach(connectedSocket => {
						connectedSocket.emit('updateExperiment', body);
					});

		    	rp({
						uri: FGLAB_URL + "/api/userdatasets/" + JSON.parse(body)[0].dataset_id,
			      method: "GET"
			    }).then((body) => {
		    		userSockets.forEach(connectedSocket => {
							connectedSocket.emit('updateDataset', body);
						});
		   		})
		    	.catch(() => {}); // Ignore failures
		    })
		    .catch(() => {}); // Ignore failures
			}

			if(channel === 'failedExperiment') {
				// call api directly from file to get information
				rp({
					uri: FGLAB_URL + "/api/userexperiments/" + JSON.parse(message)._id,
		      method: "GET"
		    })
		    .then((body) => {
		    	userSockets.forEach(connectedSocket => {
						connectedSocket.emit('updateExperiment', body);
					});
		    })
		    .catch(() => {}); // Ignore failures
			}
		});
	}
};

module.exports = socketServer;

