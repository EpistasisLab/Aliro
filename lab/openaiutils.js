
const OpenAILog = require('./models/openailog');
const OpenAIConfig = require('./models/openaiconfig');7
const db = require('./dbgoose').db;
const Chat = require('./models/chat');


async function getConfigById(req, res, next) {
    let config;
    try {
        config = await OpenAIConfig.findById(req.params.id);
        if (config == null) {
            return res.status(404).json({ message: 'Cannot find config' });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }

    res.config = config;
    next();
}

async function logOpenAIRequest(params, response) {
    const openailog = new OpenAILog({
        request: params,
        response: response
    });
    try {
        const newLog = await openailog.save();
        console.log('openai log saved');
    } catch (err) {
        console.log('error: openai log not saved');
    }
    // call our API to log the request to our server here.
}

async function getChatById(req, res, next) {
    let chat;
    try {
        chat = await Chat.findById(req.params.id);
        if (chat == null) {
            return res.status(404).json({ message: 'Cannot find chat' });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }

    res.chat = chat;
    next();
}

module.exports = {
    getConfigById,
    logOpenAIRequest,
    getChatById
};