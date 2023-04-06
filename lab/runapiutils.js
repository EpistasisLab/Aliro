const db = require('./dbgoose').db;
const Dataset = require('./models/dataset');

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

module.exports = {
    getDatasetById,
}