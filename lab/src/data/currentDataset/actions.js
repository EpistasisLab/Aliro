export const SET_CURRENT_DATASET = 'SET_CURRENT_DATASET';

export const setCurrentDataset = (currentDataset) => {
    return {
        type: SET_CURRENT_DATASET,
        currentDataset
    }
};