const mongoose = require('mongoose');

const openaiconfigSchema = new mongoose.Schema({
    org_id: {
        type: String,
    },
    api_key: {
        type: String,
        required: true
    },
});

module.exports = mongoose.model('OpenAIConfig', openaiconfigSchema);
