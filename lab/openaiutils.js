
const OpenAILog = require('./models/openailog');
const OpenAIConfig = require('./models/openaiconfig');7
const db = require('./dbgoose').db;
const Chat = require('./models/chat');
const Chatlog = require('./models/chatlog');


async function getConfigById(req, res, next) {
    let config;
    try {
        config = await OpenAIConfig.findById(req.params.id);
        if (config == null) {
            return res.status(404).json({ message: 'Cannot find config: ' + req.params.id });
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
        // chat = await Chat.findById(req.params.id);
        chat = await Chat.findById(req.params.id).populate('chatlogs');
        if (chat == null) {
            return res.status(404).json({ message: 'Cannot find chat: ' + req.params.id });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }

    res.chat = chat;
    next();
}

async function getChatlogById(req, res, next) {
    let chatlog;
    try {
        chatlog = await Chatlog.findById(req.params.id);
        if (chatlog == null) {
            return res.status(404).json({ message: 'Cannot find chatlog: ' + req.params.id });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }

    res.chatlog = chatlog;
    next();
}

async function getChatsByExperimentId(req, res, next) {
    let chats;
    try {
        // find all chats with this experiment id
        chats = await Chat.find({ experiment_id: req.params.id }).populate('chatlogs');
        if (chats == null) {
            return res.status(404).json({ message: 'Cannot find chats by experiment id: ' + req.params.id });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }

    res.chats = chats;
    next();
}

async function getChatsByDatasetId(req, res, next) {
    let chats;
    try {
        // find all chats with this experiment id
        chats = await Chat.find({ dataset_id: req.params.id }).populate('chatlogs');
        if (chats == null) {
            return res.status(404).json({ message: 'Cannot find chats by dataset id: ' + req.params.id });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }

    res.chats = chats;
    next();
}

module.exports = {
    getConfigById,
    logOpenAIRequest,
    getChatById,
    getChatlogById,
    getChatsByExperimentId,
    getChatsByDatasetId
};