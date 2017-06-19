var socket = require('socket.io');
/*var mongoskin = require('mongoskin');
var MongoOplog = require('mongo-oplog');

var oplog = MongoOplog('mongodb://127.0.0.1:27017/local');

oplog.tail();
 
oplog.on('op', data => {
  console.log(data);
});

oplog.on('error', error => {
  console.log(error);
});

var db = mongoskin.db("mongodb://127.0.0.1:27017/local");
var oplog = db.collection('oplog');
var cursor = oplog.find({}, {tailable: true, awaitData: true, numberOfRetries: Number.MAX_VALUE});

cursor.each(function(err, doc) {
	if(err) {
		console.log(err);
	}

	if(doc) {
		console.log(doc);
	}
});*/

function socketServer(server) {
	var io = socket(server);
	var connections = [];

	io.on('connection', socket => {
		connections.push(socket);

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

