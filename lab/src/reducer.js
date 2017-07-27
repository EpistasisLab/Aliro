import { combineReducers } from 'redux-immutable';
import preferences from './components/App/data';
import datasets from './components/Datasets/data';
import experiments from './components/Experiments/data';
import builder from './components/Builder/data';
import results from './components/Results/data';

const app = combineReducers({
  preferences,
  datasets,
  experiments,
  builder,
  results
});

export default app;