var socket = require('socket.io');
var auth = require('socketio-auth');

var connections = [];

function socketServer(server) {
	var io = socket(server);

	auth(io, {
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
}

function getSockets() {
	return connections;
}

module.exports = {
	socketServer: socketServer,
	getSockets: getSockets
};

