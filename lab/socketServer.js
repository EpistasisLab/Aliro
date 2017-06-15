var socket = require('socket.io');
var redis = require('redis');

function socketServer(server) {
	var io = socket(server);
	var connections = [];

	io.on('connection', socket => {
		connections.push(socket);

		socket.on('toggleAI', data => {
			connections.forEach(connectedSocket => {
				if(connectedSocket !== socket) {
					connectedSocket.emit('updateAIToggle', data);
				}
			});
		});
	 
		socket.on('disconnect', () => {
		  var index = connections.indexOf(socket);
		  connections.splice(index, 1);
		});
	});
};

module.exports = socketServer;

