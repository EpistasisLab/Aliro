var FGLAB_URL = 'http://localhost:5080'; // switch to direct db access instead 
var rp = require('request-promise'); // will be unnecessary after switch to db access

var sockets = [];

function socketServer(server) {
	var io = require('socket.io')(server);

	io.on('connection', socket => { 
		console.log('socket.io connection')
		sockets.push(socket);

		socket.on('disconnect', () => {
		  console.log('socket.io disconnect')
		  var index = sockets.indexOf(socket);
		  sockets.splice(index, 1);
		  console.log('socket.io splice')
		});
	});
}

function emitEvent(event, req) {
	console.log(`serverSocket.emitEvent('${event}', '${req}')`)

	switch(event) {
		case 'updateAllAiStatus':
			return rp(FGLAB_URL + "/api/datasets")
		  	.then(datasets => {
		  		datasets.forEach(dataset =>
		  			//sockets.forEach(socket => socket.emit('updateDataset', dataset))
		  			sockets.forEach(socket => socket.emit('updateAIToggle', dataset._id, dataset.ai))
		  		)
		    })
		    .catch((err) => {console.log(`Error: ${err}`)}); // Ignore failures

		case 'aiToggled':
			return sockets.forEach(socket => 
				socket.emit('updateAIToggle', JSON.stringify({ _id: req.params.id, nextAIState: req.body.ai }))
			);
		case 'expStarted':
			return rp(FGLAB_URL + "/api/userexperiments/" + req.params.id)
		  	.then(experiment => {
		    	sockets.forEach(socket => socket.emit('addExperiment', experiment));

		    	rp(FGLAB_URL + "/api/userdatasets/" + JSON.parse(experiment)[0].dataset_id)
				  	.then(dataset => {
				    	sockets.forEach(socket => socket.emit('updateDataset', dataset));
				    })
				    .catch((err) => {console.log(`Error: ${err}`)}); // Ignore failures
		    })
		    .catch((err) => {console.log(`Error: ${err}`)}); // Ignore failures
		case 'expUpdated':
			return rp(FGLAB_URL + "/api/userexperiments/" + req.params.id)
		  	.then(experiment => {
		    	sockets.forEach(socket => socket.emit('updateExperiment', experiment));

		    	rp(FGLAB_URL + "/api/userdatasets/" + JSON.parse(experiment)[0].dataset_id)
				  	.then(dataset => {
				    	sockets.forEach(socket => socket.emit('updateDataset', dataset));
				    })
				    .catch((err) => {console.log(`Error: ${err}`)}); // Ignore failures
		    })
		    .catch(() => {console.log(`Error: ${err}`)}); // Ignore failures
	}
}

module.exports = {
	socketServer: socketServer,
	emitEvent: emitEvent
};

