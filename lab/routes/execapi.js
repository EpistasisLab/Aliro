const express = require('express');
const router = express.Router();
const path = require("path");
const fs = require('fs');
const Machine = require('../models/machine');
const Execution = require('../models/execution');
const fetch = require('isomorphic-fetch');
const { 
    getDatasetById,
    getExecutionById,
    uploadExecFiles
} = require('../execapiutils');

router.post('/executions', async (req, res, next) => {
    if (req.body.src_code == null) {
        return res.status(400).json({ message: 'No src_code provided' });
    }

    // This should not be needed in the code run. The client should take the
    // execution_id returned by this enpoint and write it to the next chatlog.
    // // this will be the chatlog_id of the chatlog that is requesting this run.
    // // the next chatlog will be the one with the results of this run. The client
    // // will need to save the execution_id returned by this endpoint in the next
    // // chatlog.
    // if (req.body.chatlog_id != null) {
    //     return res.status(400).json({ message: 'no chatlog_id provided' });
    // }

    // create a new execution
    let execution = new Execution({
        src_code: req.body.src_code,
        status: 'submitted',
        result: null,
        files: []
    });

    if (req.body.dataset_file_id != null) {
        execution._dataset_file_id = req.body.dataset_file_id;
    } else if (req.body.dataset_id != null) {
        execution._dataset_id = req.body.dataset_id;
        let dataset = await getDatasetById(req.body.dataset_id);
        if (dataset != null) {
            execution._dataset_file_id = dataset.files[0]._id;
        }
    }

    if (req.body.experiment_id != null) {
        execution._experiment_id = req.body.experiment_id;
    }

    try {
        const newExecution = await execution.save();
        execution._id = newExecution._id;
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }

    // make folder if not available yet:
    // let tmppath = path.join(process.env.CODE_RUN_PATH, request.execution_id.toString());
    let tmppath = path.join(process.env.CODE_RUN_PATH, execution._id.toString());
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
        let result = await fetch(machines[0].address + '/code/run', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(execution)
        });
        result = await result.json();

        // update the execution status
        execution.status = result.exec_results.status;
        execution.result = result.exec_results.result;

        // add any generated files in tmppath to the execution.files array
        const files = await uploadExecFiles(execution._id, tmppath);
        execution.files = files;

        const updatedExecution = await execution.save();

        // delete the tmp folder
        fs.rm(tmppath, { recursive: true }, (err) => {
            if (err) {
                console.error(err);
            } else {
                console.log(tmppath + ' folder deleted');
            }
        });

        res.send(execution);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: err.message });
    }
});

router.get('/executions/:id', getExecutionById, async (req, res, next) => {
    res.send(res.execution);
});

router.patch('/executions/:id', getExecutionById, async (req, res, next) => {
    if (req.body.status != null) {
        res.execution.status = req.body.status;
    }
    if (req.body.result != null) {  
        res.execution.result = req.body.result;
    }
    if (req.body.files != null) {
        res.execution.files = req.body.files;
    }
    try {
        const updatedExecution = await res.execution.save();
        res.json(updatedExecution);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
