export const SET_DATASET = 'SET_DATASET';
export const SET_ALGORITHM = 'SET_ALGORITHM';
export const SET_PARAM_VALUE = 'SET_PARAM_VALUE';

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