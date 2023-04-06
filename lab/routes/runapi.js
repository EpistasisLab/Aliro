const express = require('express');
const router = express.Router();
const path = require("path");
const fs = require('fs');
const Machine = require('../models/machine');
const fetch = require('isomorphic-fetch');
const db = require('../dbgoose').db;
const { getDatasetById } = require('../runapiutils');

router.post('/runs', getDatasetById, async (req, res) => {
    if (req.body.src_code == null) {
        return res.status(400).json({ message: 'No src_code provided' });
    }
    if (req.body.dataset_id == null) {
        return res.status(400).json({ message: 'No dataset_id provided' });
    }
    if (req.body.experiment_id == null) {
        return res.status(400).json({ message: 'No experiment_id provided' });
    }

    // console.log('in lab:', res.dataset);

    let request = {
        src_code: req.body.src_code,
        experiment_id: req.body.experiment_id,
        file_id: res.dataset.files[0]._id
    };

    // make folder if not available yet:
    console.log('CODE_RUN_PATH:', process.env.CODE_RUN_PATH);
    let tmppath = path.join(process.env.CODE_RUN_PATH, req.body.experiment_id);
    // make tmp folder if it is not available
    // if (!fs.existsSync(tmppath)) fs.mkdirSync(tmppath, 0744);
    if (!fs.existsSync(tmppath)) fs.mkdirSync(tmppath, { recursive: true });

    // find machines that could handle the project
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
