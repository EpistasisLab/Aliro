export const REQUEST_DATASETS = 'REQUEST_DATASETS';
export const RECEIVE_DATASETS = 'RECEIVE_DATASETS';

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