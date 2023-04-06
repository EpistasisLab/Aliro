const db = require('./dbgoose').db;
const Dataset = require('./models/dataset');

async function getDatasetById(req, res, next) {
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
    getDatasetById
}