// const db = require('./dbgoose').db;
const Dataset = require('./models/dataset');
const Execution = require('./models/execution');
const { GridFSBucket } = require('mongodb');
const db = require('./dbgoose');
const path = require("path");
const fs = require('fs');
const { default: mongoose } = require('mongoose');
const Stream = require('stream');
// const { isConstructorDeclaration } = require('typescript');
const mime = require('mime-types');

let laburi;

if (process.env.LAB_HOST && process.env.LAB_PORT) {
    laburi = 'http://' + process.env.LAB_HOST + ':' + process.env.LAB_PORT;
} else if (process.env.LAB_URL) {
    laburi = process.env.LAB_URL;
} else {
    console.log("Error: No AliroServer address specified");
    process.exit(1);
}

async function getDatasetById(datasetId) {
    let dataset;
    try {
        dataset = await Dataset.findById(datasetId);
        if (dataset == null) {
            console.log('Cannot find dataset: ' + datasetId);
        }
    } catch (err) {
        console.log(err.message);
    }
    
    return dataset;
}

async function getExecutionById(req, res, next) {
    let execution;
    try {
        execution = await Execution.findById(req.params.id);
        if (execution == null) {
            return res.status(404).json({ message: 'Cannot find execution: ' + req.params.id });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }

    res.execution = execution;
    next();
}

async function uploadExecFiles(executionId, req) {
    const files = [];

    const gfs = new GridFSBucket(db.db, {
        bucketName: 'fs'
    });

    const uploadedFiles = req.files;

    for (const uploadedFile of uploadedFiles) {
        const fileId = new mongoose.Types.ObjectId();
        const writeStream = gfs.openUploadStreamWithId(fileId,
            uploadedFile.originalname,
            {
                metadata: {
                    execution_id: executionId,
                    contentType: uploadedFile.mimetype
                },
                contentType: 'binary/octet-stream'
            }
        );
        const bufferStream = new Stream.PassThrough();
        bufferStream.end(uploadedFile.buffer);

        bufferStream.pipe(writeStream);

        await new Promise((resolve, reject) => {
            writeStream.on('error', reject);
            writeStream.on('finish', () => {
                console.log('file uploaded to GridFS:' + uploadedFile.originalname);
                files.push({ _id: fileId, filename: uploadedFile.originalname, mimetype: uploadedFile.mimetype });
                resolve();
            });
        });
    }

    return files;
}


module.exports = {
    getDatasetById,
    getExecutionById,
    uploadExecFiles
}