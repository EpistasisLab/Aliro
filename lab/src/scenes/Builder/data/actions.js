export const SET_CURRENT_DATASET = 'SET_CURRENT_DATASET';
export const SET_CURRENT_ALGORITHM = 'SET_CURRENT_ALGORITHM';
export const SET_PARAM_VALUE = 'SET_PARAM_VALUE';
export const RESET_PARAMS = 'RESET_PARAMS';

export const setCurrentDataset = (currentDataset) => {
    return {
        type: SET_CURRENT_DATASET,
        currentDataset
    }
};

export const setCurrentAlgorithm = (currentAlgorithm) => {
    return {
        type: SET_CURRENT_ALGORITHM,
        currentAlgorithm
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