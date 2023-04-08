const express = require('express');
const router = express.Router();
const path = require("path");
const fs = require('fs');
const Machine = require('../models/machine');
const Execution = require('../models/execution');
const fetch = require('isomorphic-fetch');
// const { gfs } = require('../dbgoose');
const db = require('../dbgoose');
const { GridFSBucket, ObjectID } = require('mongodb');
const { 
    getDatasetById,
    getExecutionById
} = require('../execapiutils');
const { default: mongoose } = require('mongoose');
const { isConstructorDeclaration } = require('typescript');
const mime = require('mime-types');

router.post('/executions/experiment/:id', getDatasetById, async (req, res, next) => {
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

    let request = {
        src_code: req.body.src_code,
        experiment_id: req.params.id
    };

    if (req.body.dataset_id != null) {
        request.dataset_file_id = res.dataset.files[0]._id;
    }

    // create a new execution
    let execution = new Execution({
        _experiment_id: req.params.id,
        _dataset_id: req.body.dataset_id,
        src_code: req.body.src_code,
        status: 'submitted',
        result: null,
        files: []
    });

    try {
        const newExecution = await execution.save();
        request.execution_id = newExecution._id;
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }

    // make folder if not available yet:
    let tmppath = path.join(process.env.CODE_RUN_PATH, request.execution_id.toString());
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
        console.error(err);
        return res.status(500).json({ message: err.message });
    }
});

router.post('/executions/:id/files', getExecutionById, async (req, res, next) => {
    const executionId = res.execution._id;
    const uploadedFile = [];

    const gfs = new GridFSBucket(db.db, {
		bucketName: 'fs'
	});
	console.log('----------------:gfs:', gfs)

    console.log('gfs:', gfs);

    // iterate over the directory and get the filenames of all files
    fs.readdir(req.body.file_path, (err, files) => {
        if (err) {
            console.error(err);
            res.status(500).json({ message: err.message });
        }
        files.forEach(file => {
            const filePath = path.join(req.body.file_path, file);
            fs.stat(filePath, (err, stats) => {
                if (err) {
                    console.error(err);
                    // res.status(500).json({ message: err.message });
                } else {
                    if (!stats.isDirectory()) {
                        console.log('file:', file);
                        const writeStream = gfs.openUploadStreamWithId(new mongoose.Types.ObjectId(),
                            file,
                            {
                                metadata: {
                                    execution_id: executionId,
                                    contentType: mime.lookup(file)
                                },
                                contentType: 'binary/octet-stream'
                            }
                        );
                        const readStream = fs.createReadStream(filePath);
                        readStream.pipe(writeStream);
                        writeStream.on('error', (err) => {
                            console.error(err);
                            // res.status(500).json({ message: err.message });
                        });
                        writeStream.on('finish', () => {
                            console.log('file uploaded to GridFS');
                            uploadedFile.push(file);
                        });
                    }
                }
            });
        });
    });

    res.status(200).json({ message: 'File uploaded to GridFS', files: uploadedFile });
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
