/* Load configuration variables */

// Local environment
require("dotenv").config({silent: true});

// Docker environment
if (process.env.MONGO_PORT_27017_TCP_ADDR) {
  process.env.MONGODB_URI = "mongodb://" + process.env.MONGO_PORT_27017_TCP_ADDR + ":" + process.env.MONGO_PORT_27017_TCP_PORT + "/experiments";
}

// Heroku environment
if (process.env.MONGOLAB_URI) {
  process.env.MONGODB_URI = process.env.MONGOLAB_URI;
}

// TODO Assign random valid port if not assigned?
