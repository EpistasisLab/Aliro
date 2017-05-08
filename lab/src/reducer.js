import { combineReducers } from 'redux';
import preferences from './data/preferences/reducer';
import datasets from './scenes/Datasets/data/reducer';
import currentDataset from './data/currentDataset/reducer';
import currentAlgorithm from './data/currentAlgorithm/reducer';

const app = combineReducers({
   preferences,
   datasets,
   currentDataset,
   currentAlgorithm
});

export default app;
