const { Configuration, OpenAIApi } = require('openai');
const express = require('express');
const router = express.Router();
const db = require('../dbgoose').db;
const getConfigById = require('../openaiutils').getConfigById;
const logOpenAIRequest = require('../openaiutils').logOpenAIRequest;
const OpenAIConfig = require('../models/openaiconfig');
const configuration = new Configuration({
    // the organization is not required, so we need to decide if we require it from the user
    // this may become useful for our logs.
    // organization: process.env.OPENAI_ORG_ID,
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

/* 
** OpenAI Config Settings API 
*/
// Create a config
router.post('/config', async (req, res) => {
    // Check if config already exists
    let existing;
    try {
        existing = await OpenAIConfig.find({})
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Config already exists' });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }

    const config = new OpenAIConfig({
        org_id: req.body.org_id,
        api_key: req.body.api_key
    });
    try {
        const newConfig = await config.save();
        res.status(201).json(newConfig);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get all configs
router.get('/config', async (req, res) => {
    try {
        const config = await OpenAIConfig.find();
        res.send(config);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get one config
router.get('/config/:id', getConfigById, (req, res) => {
    res.send(res.config);
});

// Update one config
router.patch('/config/:id', getConfigById, async (req, res) => {
    if (req.body.org_id != null) {
        res.config.org_id = req.body.org_id;
    }
    if (req.body.api_key != null) {
        res.config.api_key = req.body.api_key;
    }
    try {
        const updatedConfig = await res.config.save();
        res.send(updatedConfig);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete one config
router.delete('/config/:id', getConfigById, async (req, res) => {
    try {
        await res.config.remove();
        res.send({ message: 'Deleted config' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/* 
** OpenAI API Requests 
*/
// get models
router.get('/models', async (req, res) => {
    try {
        let response = await openai.listModels();
        response = response.data;
        console.log(response)
        res.send(response);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// get model by model name
router.get('/models/:model', async (req, res) => {
    // Should I let the OpenAI api handle this?
    // if (req.params.model == null) {
    //     return res.status(400).json({ message: 'No model provided' });
    // }
    try {
        let model = await openai.retrieveModel(req.params.model);
        // model = removeCircularReference(model);
        model = model.data;
        res.send(model);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// send a completion request
router.post('/completions', async (req, res) => {
    let params = req.body;
    let response = await openai.createCompletion(params);
    response = response.data;
    // chats should be logged by the client
    // logChats(params, response);
    logOpenAIRequest(req.body, response);
    res.send(response);
});

// send an edit request
router.post('/edits', async (req, res) => {
    let params = req.body;

    let response = await openai.createEdit(params);
    response = response.data;

    // log the response in the openai collection in mongodb
    console.log(response);
    logOpenAIRequest(req.body, response);

    res.send(response);
});

module.exports = router;