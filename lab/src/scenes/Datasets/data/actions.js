export const REQUEST_DATASETS = 'REQUEST_DATASETS';
export const RECEIVE_DATASETS = 'RECEIVE_DATASETS';
export const REQUEST_AI_TOGGLE = 'REQUEST_AI_TOGGLE';
export const RECEIVE_AI_TOGGLE = 'RECEIVE_AI_TOGGLE';

export const DATASETS_REQUEST = 'DATASETS_REQUEST';
export const DATASETS_SUCCESS = 'DATASETS_SUCCESS';
export const DATASETS_FAILURE = 'DATASETS_FAILURE';

export const FETCH_DATASETS = 'FETCH_DATASETS';

export const fetchDatasets = (status, json, error) => {
    return {
        type: FETCH_DATASETS,
        datasets: json || [],
        receivedAt: Date.now(),
        status,
        error
    }
};

export const requestDatasets = () => {
    return {
        type: REQUEST_DATASETS
    }
};

export const receiveDatasets = (json) => {
    return {
        type: RECEIVE_DATASETS,
        datasets: json,
        receivedAt: Date.now()
    }
};

export const requestAIToggle = (datasetId) => {
    return {
        type: REQUEST_AI_TOGGLE,
        datasetId
    }
};

export const receiveAIToggle = (datasetId, aiState) => {
    return {
        type: RECEIVE_AI_TOGGLE,
        receivedAt: Date.now(),
        datasetId,
        aiState
    }
};