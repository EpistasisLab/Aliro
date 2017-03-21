import { combineReducers } from 'redux';
import data from './data/reducer';

const app = combineReducers({
   data
});

export default app;