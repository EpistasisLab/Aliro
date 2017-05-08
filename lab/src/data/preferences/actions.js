export const REQUEST_PREFERENCES = 'REQUEST_PREFERENCES';
export const RECEIVE_PREFERENCES = 'RECEIVE_PREFERENCES';

export const requestPreferences = () => {
    return {
        type: REQUEST_PREFERENCES
    }
};

export const receivePreferences = (json) => {
console.log(JSON.stringify(json.first()));
    return {
        type: RECEIVE_PREFERENCES,
        preferences: json.first(), // change this when preferences route is fixed
        receivedAt: Date.now()
    }
};
