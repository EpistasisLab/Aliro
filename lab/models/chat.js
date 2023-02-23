const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    _dataset_id: {
        type: mongoose.Schema.Types.ObjectId,
    },
    _experiment_id: {
        type: mongoose.Schema.Types.ObjectId,
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    }
});

module.exports = mongoose.model('Chat', chatSchema);