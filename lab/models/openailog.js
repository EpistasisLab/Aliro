const mongoose = require('mongoose');

const openailogSchema = new mongoose.Schema({
    request: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    response: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    requestDate: {
        type: Date,
        required: true,
        default: Date.now
    }
});
    

module.exports = mongoose.model('OpenAILog', openailogSchema);