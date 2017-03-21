import { combineReducers } from 'redux';
import preferences from './preferences/reducer';
import currentDataset from './currentDataset/reducer';
import currentAlgorithm from './currentAlgorithm/reducer';

const data = combineReducers({
   preferences,
   currentDataset,
   currentAlgorithm
});

export default data;