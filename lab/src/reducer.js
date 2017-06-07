import { combineReducers } from 'redux';
//import { combineReducers } from 'redux-immutable';
import preferences from './components/App/data';
import datasets from './scenes/Datasets/data';
import experiments from './scenes/Experiments/data';
import results from './scenes/Results/data';
import builder from './scenes/Builder/data';

const app = combineReducers({
   preferences,
   datasets,
   results,
   experiments,
   builder
});

export default app;
