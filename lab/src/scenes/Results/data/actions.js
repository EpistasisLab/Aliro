export const REQUEST_RESULTS = 'REQUEST_RESULTS';
export const RECEIVE_RESULTS = 'RECEIVE_RESULTS';

export const requestResults = () => {
    return {
        type: REQUEST_RESULTS
    }
};

export const receiveResults = (json) => {
    return {
        type: RECEIVE_RESULTS,
        results: json,
        receivedAt: Date.now()
    }
};