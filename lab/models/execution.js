const mongoose = require('mongoose');

const executionSchema = new mongoose.Schema({
  src_code: {
    type: String,
    required: true
  },
  _experiment_id: {
    type: mongoose.Schema.Types.ObjectId,
  },
  _dataset_id: {
    type: mongoose.Schema.Types.ObjectId,
  },
  status: {
    type: String,
  },
  result: {
    type: String,
  },
  files: [{
    _id: {
      type: mongoose.Schema.Types.ObjectId,
    },
    filename: {
      type: String,
    },
    mimetype: {
      type: String,
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
  }]
});

module.exports = mongoose.model('Execution', executionSchema);
