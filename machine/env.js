/* Load configuration variables */

// Local environment
require("dotenv").config({silent: true});

// Docker environment
if (process.env.FGLAB_PORT_5000_TCP_ADDR) {
  process.env.FGLAB_URL = "http://" + process.env.FGLAB_PORT_5000_TCP_ADDR + ":" + process.env.FGLAB_PORT_5000_TCP_PORT;
}
