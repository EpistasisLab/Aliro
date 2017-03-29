import { combineReducers } from 'redux';
import preferences from './preferences/reducer';
import datasets from './datasets/reducer';
import currentDataset from './currentDataset/reducer';
import currentAlgorithm from './currentAlgorithm/reducer';

const data = combineReducers({
   preferences,
   datasets,
   currentDataset,
   currentAlgorithm
});

export default data;