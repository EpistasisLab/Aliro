export const REQUEST_PREFERENCES = 'REQUEST_PREFERENCES';
export const RECEIVE_PREFERENCES = 'RECEIVE_PREFERENCES';

export const requestPreferences = () => {
    return {
        type: REQUEST_PREFERENCES
    }
};

export const receivePreferences = (json) => {
    return {
        type: RECEIVE_PREFERENCES,
        preferences: json.first(),
        receivedAt: Date.now()
    }
};
