var FGLAB_URL = 'http://localhost:5080'; // switch to direct db access instead 
var rp = require('request-promise'); // will be unnecessary after switch to db access

var channels = [
	{
		name: 'toggledAI',
		prepareMessage: function(req) {
			return { _id: req.params.id, nextAIState: req.body.ai };
		},
		emitToSockets: function(message, sockets) {
			sockets.forEach(socket => socket.emit('updateAIToggle', message));
		}
	},
	{
		name: 'startedExperiment',
		prepareMessage: function(req) {
			return  { _id: req.params.id  };
		},
		emitToSockets: function(message, sockets) {
			rp(FGLAB_URL + "/api/userexperiments/" + JSON.parse(message)._id)
		  	.then((experiment) => {
		    	sockets.forEach(socket => socket.emit('addExperiment', experiment));
		    })
		    .catch(() => {}); // Ignore failures
		}
	},
	{
		name: 'finishedExperiment',
		prepareMessage: function(req) {
			return  { _id: req.params.id  };
		},
		emitToSockets: function(message, sockets) {
			rp(FGLAB_URL + "/api/userexperiments/" + JSON.parse(message)._id)
		  	.then((experiment) => {
		    	sockets.forEach(socket => socket.emit('updateExperiment', experiment));

		    	rp(FGLAB_URL + "/api/userdatasets/" + JSON.parse(experiment)[0].dataset_id)
				  	.then((dataset) => {
				    	sockets.forEach(socket => socket.emit('updateDataset', dataset));
				    })
				    .catch(() => {}); // Ignore failures
		    })
		    .catch(() => {}); // Ignore failures
		}
	},
	{
		name: 'failedExperiment',
		prepareMessage: function(req) {
			return  { _id: req.params.id  };
		},
		emitToSockets: function(req) {
			rp(FGLAB_URL + "/api/userexperiments/" + JSON.parse(message)._id)
		    .then((experiment) => {
		    	sockets.forEach(socket => socket.emit('updateExperiment', experiment));
		    })
		    .catch(() => {}); // Ignore failures
		}
	}
];

module.exports = channels;