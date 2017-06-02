export const REQUEST_EXPERIMENT = 'REQUEST_EXPERIMENT';
export const RECEIVE_EXPERIMENT = 'RECEIVE_EXPERIMENT';
export const SET_EXPERIMENT = 'SET_EXPERIMENT';
export const REQUEST_DATASET = 'REQUEST_DATASET';
export const RECEIVE_DATASET = 'RECEIVE_DATASET';
export const SET_DATASET = 'SET_DATASET';
export const SET_ALGORITHM = 'SET_ALGORITHM';
export const SET_PARAM_VALUE = 'SET_PARAM_VALUE';
export const RESET_PARAMS = 'RESET_PARAMS';

export const requestExperiment = () => {
    return {
        type: REQUEST_EXPERIMENT
    }
};

export const receiveExperiment = (json) => {
    return {
        type: RECEIVE_EXPERIMENT,
        experiment: json.first(),
        receivedAt: Date.now()
    }
};

export const setExperiment = (experiment) => {
    return {
        type: SET_EXPERIMENT,
        experiment
    }
};

export const requestDataset = () => {
    return {
        type: REQUEST_DATASET
    }
};

export const receiveDataset = (json) => {
    return {
        type: RECEIVE_DATASET,
        dataset: json.first(),
        receivedAt: Date.now()
    }
};

export const setDataset = (dataset) => {
    return {
        type: SET_DATASET,
        dataset
    }
};

export const setAlgorithm = (algorithm) => {
    return {
        type: SET_ALGORITHM,
        algorithm
    }
};

export const setParamValue = (param, value) => {
    return {
        type: SET_PARAM_VALUE,
        param,
        value
    }
};

export const resetParams = () => {
    return {
        type: RESET_PARAMS
    }
};