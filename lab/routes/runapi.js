const express = require('express');
const router = express.Router();
const path = require("path");
const fs = require('fs');
const Machine = require('../models/machine');
const fetch = require('isomorphic-fetch');
const db = require('../dbgoose').db;
const { 
    getDatasetById,
} = require('../runapiutils');


router.post('/runs/experiment/:id', getDatasetById, async (req, res, next) => {
    if (req.body.src_code == null) {
        return res.status(400).json({ message: 'No src_code provided' });
    }

    let request = {
        src_code: req.body.src_code,
        experiment_id: req.params.id
    };

    if (req.body.dataset_id != null) {
        request.dataset_file_id = res.dataset.files[0]._id;
    }

    // make folder if not available yet:
    let tmppath = path.join(process.env.CODE_RUN_PATH, req.params.id);
    // make tmp folder if it is not available
    if (!fs.existsSync(tmppath)) fs.mkdirSync(tmppath, { recursive: true });

    // find machines that could handle the project
    // this may need revision, submitting experiments checks the machine capacity
    // but the capacity is tied to each algorithm. Not sure how to handle this yet.
    let machines;
    try {
        machines = await Machine.find({}, { address: 1 });
        if (machines.length == 0) {
            return res.status(400).json({ message: 'No machines available' });
        }
        // call the machine api
        result = await fetch(machines[0].address + '/code/run', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(request)
        });
        result = await result.json();
        console.log('result:', result);
        res.send(result);
    }
    catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

module.exports = router;
