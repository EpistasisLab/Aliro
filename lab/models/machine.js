const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  command: {
    type: String,
  },
  cwd: {
    type: String,
  },
  args: {
    type: [String],
  },
  options: {
    type: String,
  },
  capacity: {
    type: String,
  },
  results: {
    type: String,
  }
});

const osSchema = new mongoose.Schema({
  type: {
    type: String,
  },
  platform: {
    type: String,
  },
  arch: {
    type: String,
  },
  release: {
    type: String,
  }
});

const cpuSchema = new mongoose.Schema({
  type: {
    type: String,
  }
});

const gpuSchema = new mongoose.Schema({
  type: {
    type: String,
  }
});

const machineSchema = new mongoose.Schema({
  address: {
    type: String,
  },
  hostname: {
    type: String,
  },
  os: osSchema,
  cpus: [cpuSchema],
  mem: {
    type: String,
  },
  gpus: [gpuSchema],
  projects: {
    type: Map,
    of: projectSchema,
  }
});

module.exports = mongoose.model('Machine', machineSchema);
