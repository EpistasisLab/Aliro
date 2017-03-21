export const SET_CURRENT_ALGORITHM = 'SET_CURRENT_ALGORITHM';
export const SET_PARAMETER_VALUE = 'SET_PARAMETER_VALUE';

export const setCurrentAlgorithm = (currentAlgorithm) => {
    return {
        type: SET_CURRENT_ALGORITHM,
        currentAlgorithm
    }
};

export const setParameterValue = (param, value) => {
    return {
        type: SET_PARAMETER_VALUE,
        param,
        value
    }
};