import { combineReducers } from 'redux-immutable';
import preferences from './components/App/data';
import datasets from './components/Datasets/data';
import experiments from './components/Experiments/data';
import results from './components/Results/data';
import builder from './components/Builder/data';

const app = combineReducers({
   preferences,
   datasets,
   experiments,
   results,
   builder
});

export default app;
