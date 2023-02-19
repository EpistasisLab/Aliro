const { Configuration, OpenAIApi } = require('openai');
const express = require('express');
const router = express.Router();
// const OpenAIConfig = require('../models/openai');
const OpenAILog = require('../models/openailog');
const mongoose = require('mongoose');
const _ = require('lodash');
const configuration = new Configuration({
    // organization: process.env.OPENAI_ORG_ID,
    apiKey: process.env.OPENAI_API_KEY,
});

// To start we can use the values from the .env file
// Later we can put this in the database, if needed

if (process.env.DBMONGO_HOST && process.env.DBMONGO_PORT) {
	mongouri="mongodb://"+process.env.DBMONGO_HOST+":"+process.env.DBMONGO_PORT+"/FGLab";
} else if (process.env.MONGODB_URI) {
	mongouri=process.env.MONGODB_URI;
} else {
  	console.log("Error: No MongoDB instance specified");
  	process.exit(1);
}
mongoose.connect(mongouri, { useNewUrlParser: true, useUnifiedTopology: true })
const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Mongoose connected to Database'));

// try {
//     const openai = new OpenAIApi(configuration);
// } catch (err) {
//     console.log(err);
// }
const openai = new OpenAIApi(configuration);

// // Create one config
// router.post('/config', async (req, res) => {
//     // Check if config already exists
//     let existing;
//     try {
//         existing = await OpenAIConfig.find({})
//         if (existing.length > 0) {
//             return res.status(400).json({ message: 'Config already exists' });
//         }
//     } catch (err) {
//         return res.status(500).json({ message: err.message });
//     }

//     const config = new OpenAIConfig({
//         org_id: req.body.org_id,
//         api_key: req.body.api_key
//     });
//     try {
//         const newConfig = await config.save();
//         res.status(201).json(newConfig);
//     } catch (err) {
//         res.status(400).json({ message: err.message });
//     }
// });

// // // Get all configs
// // router.get('/config', async (req, res) => {
// //     try {
// //         const config = await OpenAIConfig.find();
// //         res.json(config);
// //     } catch (err) {
// //         res.status(500).json({ message: err.message });
// //     }
// // });

// // Get one config
// router.get('/config/:id', getConfigById, (req, res) => {
//     res.json(res.config);
// });

// // Update one config
// router.patch('/config/:id', getConfigById, async (req, res) => {
//     if (req.body.org_id != null) {
//         res.config.org_id = req.body.org_id;
//     }
//     if (req.body.api_key != null) {
//         res.config.api_key = req.body.api_key;
//     }
//     try {
//         const updatedConfig = await res.config.save();
//         res.json(updatedConfig);
//     } catch (err) {
//         res.status(400).json({ message: err.message });
//     }
// });

// // Delete one config
// router.delete('/config/:id', getConfigById, async (req, res) => {
//     try {
//         await res.config.remove();
//         res.json({ message: 'Deleted config' });
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// });

// async function getConfigById(req, res, next) {
//     let config;
//     try {
//         config = await OpenAIConfig.findById(req.params.id);
//         if (config == null) {
//             return res.status(404).json({ message: 'Cannot find config' });
//         }
//     } catch (err) {
//         return res.status(500).json({ message: err.message });
//     }

//     res.config = config;
//     next();
// }

// OpenAI API Requests
// get models
router.get('/models', async (req, res) => {
    try {
        let response = await openai.listModels();
        response = response.data;
        console.log(response)
        res.json(response);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// get model by model name
router.get('/models/:model', async (req, res) => {
    if (req.params.model == null) {
        return res.status(400).json({ message: 'No model provided' });
    }
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
    let params = {};

    if (req.body.model != null) {
        params.model = req.body.model;
    } else {
        return res.status(400).json({ message: 'No model provided' });
    }
    if (req.body.prompt != null) {
        params.prompt = req.body.prompt;
    }
    if (req.body.suffix != null) {
        params.suffix = req.body.suffix;
    }
    if (req.body.max_tokens != null) {
        params.max_tokens = req.body.max_tokens;
    }
    if (req.body.temperature != null) {
        params.temperature = req.body.temperature;
    }
    if (req.body.top_p != null) {
        params.top_p = req.body.top_p;
    }
    if (req.body.n != null) {
        params.n = req.body.n;
    }
    if (req.body.stream != null) {
        params.stream = req.body.stream;
    }
    if (req.body.logprobs != null) {
        params.logprobs = req.body.logprobs;
    }
    if (req.body.echo != null) {
        params.echo = req.body.echo;
    }
    if (req.body.stop != null) {
        params.stop = req.body.stop;
    }
    if (req.body.presence_penalty != null) {
        params.presence_penalty = req.body.presence_penalty;
    }
    if (req.body.frequency_penalty != null) {
        params.frequency_penalty = req.body.frequency_penalty;
    }
    if (req.body.best_of != null) {
        params.best_of = req.body.best_of;
    }
    if (req.body.logit_bias != null) {
        params.logit_bias = req.body.logit_bias;
    }
    if (req.body.user != null) {
        params.user = req.body.user;
    }

    let response = await openai.createCompletion(params);
    // response = removeCircularReference(response);
    response = response.data;

    // log the response in the openai collection in mongodb
    console.log(response);

    // TODO: extract this to a separate function for reuse
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

    res.send(response);
});

// send an edit request
router.post('/edits', async (req, res) => {
    let params = {};
    if (req.body.model != null) {
        params.model = req.body.model;
    } else {
        return res.status(400).json({ message: 'No model provided' });
    }
    if (req.body.instruction != null) {
        params.instruction = req.body.instruction;
    } else {
        return res.status(400).json({ message: 'No instruction provided' });
    }
    if (req.body.input != null) {
        params.input = req.body.input;
    }        
    if (req.body.n != null) {
        params.n = req.body.n;
    }
    if (req.body.temperature != null) {
        params.temperature = req.body.temperature;
    }
    if (req.body.top_p != null) {
        params.top_p = req.body.top_p;
    }

    let response = await openai.createEdit(params);
    // response = removeCircularReference(response);
    response = response.data;

    // log the response in the openai collection in mongodb
    console.log(response);

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

    res.send(response);
});

// continue here with Images https://platform.openai.com/docs/api-reference/images



function removeCircularReference(obj) {
    const seen = new WeakSet();
    return _.cloneDeep(obj, (value) => {
        if (typeof value == 'object' && value !== null) {
            if (seen.has(value)) {
                return undefined;
            }
            seen.add(value);
        }
        return value;
    });
}

module.exports = router;