import { combineReducers } from 'redux-immutable';
import preferences from './components/App/data';
import datasets from './components/Datasets/data';
import experiments from './components/Experiments/data';
import results from './scenes/Results/data';
import builder from './scenes/Builder/data';

const app = combineReducers({
   preferences,
   datasets,
   experiments,
   results,
   builder
});

export default app;
