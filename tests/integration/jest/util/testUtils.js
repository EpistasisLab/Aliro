
var os = require("os");


export const EXPECTED_MACHINE_ALGO_COUNT = 6; // number of algorithms registered with a machine instance
export const MIN_EXPECTED_LAB_ALGO_COUNT = 10; // min number of algorithms registered with in the server
export const MIN_EXPECTED_DATASET_COUNT = 4; // min number of datasets registered with the lab server, more may be added w. tests

export const DATASET_PATH = '/appsrc/data/datasets/test/integration'  // datasets for testing
export const NUM_AI_RECS = 1
//export const NUM_AI_RECS = os.environ['AI_NUMRECOMMEND']
export const JEST_TIMEOUT = 50000

// hacky delay
export const delay = (ms) => {
   ms += new Date().getTime();
   while (new Date() < ms){}
};

