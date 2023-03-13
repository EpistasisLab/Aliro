const mongoose = require('mongoose');

const chatlogSchema = new mongoose.Schema({
    _chat_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Chat'
    },
    message: {
        type: String,
    },
    message_type: {
        type: String,
    },
    source_code: {
        type: String,
    },
    who: {
        type: String,
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    }
});

module.exports = mongoose.model('Chatlog', chatlogSchema);