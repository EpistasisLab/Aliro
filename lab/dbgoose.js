const mongoose = require('mongoose');

if (process.env.DBMONGO_HOST && process.env.DBMONGO_PORT) {
	mongouri="mongodb://"+process.env.DBMONGO_HOST+":"+process.env.DBMONGO_PORT+"/FGLab";
} else if (process.env.MONGODB_URI) {
	mongouri=process.env.MONGODB_URI;
} else {
  	console.log("Error: No MongoDB instance specified");
  	process.exit(1);
}
mongoose.connect(mongouri, { useNewUrlParser: true, useUnifiedTopology: true })
const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Mongoose connected to Database'));

module.exports = db;