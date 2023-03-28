const { Configuration, OpenAIApi } = require('openai');
const express = require('express');
const router = express.Router();
const db = require('../dbgoose').db;
const { getConfigById, logOpenAIRequest } = require('../openaiutils');
const OpenAIConfig = require('../models/openaiconfig');

let openai;
let configuration;

// const configuration = new Configuration({
//     // the organization is not required, so we need to decide if we require it from the user
//     // this may become useful for our logs.
//     // organization: process.env.OPENAI_ORG_ID,
//     apiKey: process.env.OPENAI_API_KEY,
// });
// const openai = new OpenAIApi(configuration);

/* 
** OpenAI Config Settings API 
*/
// Create a config
router.post('/configs', async (req, res) => {
    // Check if config already exists
    let existing;
    try {
        existing = await OpenAIConfig.find({})
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Config already exists', config_id: existing[0]._id });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }

    if (req.body.api_key == null) {
        return res.status(400).json({ message: 'No api key provided' });
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
router.get('/configs', async (req, res) => {
    try {
        const config = await OpenAIConfig.find();
        res.send(config);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get one config
router.get('/configs/:id', getConfigById, (req, res) => {
    res.send(res.config);
});

// Update one config
router.patch('/configs/:id', getConfigById, async (req, res) => {
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
router.delete('/configs/:id', getConfigById, async (req, res) => {
    try {
        await res.config.remove();
        res.send({ message: 'Deleted config: ' + req.params.id });
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

// chat completions to use gpt 3.5 turbo models
router.post('/chat/completions', async (req, res) => {
    let params = req.body;
    let response = await openai.createChatCompletion(params);
    response = response.data;
    // chats should be logged by the client
    // logChats(params, response);
    logOpenAIRequest(req.body, response);
    res.send(response);
});

// It is likely that we don't need this GET
// The POST below can handle checking and opening the connection.
// get openai connections
// router.get('/connections', async (req, res) => {
//     try {
//         let response = await openai.listModels();
//         response = { 'connected': true };
//         res.send(response);
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// });

// make a connection to openai
router.post('/connections', async (req, res) => {
    try {
        // get the api key from the db
        let config = await OpenAIConfig.find({});
        // check if config is empty
        // check that we have an api key
        if (config.length == 0 || config[0]['api_key'] == null) {
            return res.status(400).json({ message: 'No api key available' });
        }
        // set the api key
        configuration = new Configuration({
            apiKey: config[0]['api_key']
        });
        // configuration.apiKey = config.api_key;
        // check if we have the org_id
        if (config[0]['org_id'] != null) {
            org_id = config[0]['org_id'];
            // set the organization id
            configuration.organization = org_id;
        }
        
        // open the connection
        // openai = new OpenAIApi(configuration, (err) => {
        //     if (err) {
        //         return res.status(400).json({ message: 'Connection failed' });
        //     }
        // });
        openai = new OpenAIApi(configuration);
        // test the connection
        let response = await openai.listModels();
        if (response == null) {
            return res.status(400).json({ message: 'Connection failed' });
        }
        response = { connected: true };
        res.send(response);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;