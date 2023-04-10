// const db = require('./dbgoose').db;
const Dataset = require('./models/dataset');
const Execution = require('./models/execution');
const { GridFSBucket } = require('mongodb');
const db = require('./dbgoose');
const path = require("path");
const fs = require('fs');
const { default: mongoose } = require('mongoose');
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

async function getDatasetById(req, res, next) {
    if (req.body.dataset_id == null) {
        return
    }
    let dataset;
    try {
        dataset = await Dataset.findById(req.body.dataset_id);
        if (dataset == null) {
            return res.status(404).json({ message: 'Cannot find dataset: ' + req.body.dataset_id });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
    
    res.dataset = dataset;
    next();
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

async function uploadExecFiles(executionId, filepath) {
    const files = [];

    const gfs = new GridFSBucket(db.db, {
        bucketName: 'fs'
    });

    const filenames = await fs.promises.readdir(filepath);

    for (const file of filenames) {
        const filename = path.join(filepath, file);
        const stats = await fs.promises.stat(filename);
        if (!stats.isDirectory()) {
            const fileId = new mongoose.Types.ObjectId();
            const writeStream = gfs.openUploadStreamWithId(fileId,
                file,
                {
                    metadata: {
                        execution_id: executionId,
                        contentType: mime.lookup(file)
                    },
                    contentType: 'binary/octet-stream'
                }
            );
            const readStream = fs.createReadStream(filename);
            readStream.pipe(writeStream);

            await new Promise((resolve, reject) => {
                writeStream.on('error', reject);
                writeStream.on('finish', () => {
                    console.log('file uploaded to GridFS:' + filename);
                    files.push({ _id: fileId, filename: file, mimetype: mime.lookup(file) });
                    resolve();
                });
            });
        }
    }

    console.log('files uploaded to GridFS:' + files);
    return files;
}

module.exports = {
    getDatasetById,
    getExecutionById,
    uploadExecFiles
}