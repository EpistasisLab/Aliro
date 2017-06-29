var socket = require('socket.io');

function socketServer(server) {
	var io = socket(server);
	var connections = [];

	io.on('connection', socket => {
		connections.push(socket);

		socket.on('startExperiment', data => {
			connections.forEach(connectedSocket => {
				connectedSocket.emit('startExperiment', data);
				/*if(connectedSocket !== socket) {
					connectedSocket.emit('startExperiment', data);
				}*/
			});
		});

		socket.on('toggleAI', data => {
			connections.forEach(connectedSocket => {
				if(connectedSocket !== socket) {
					connectedSocket.emit('toggleAI', data);
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

