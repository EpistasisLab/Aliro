import { combineReducers } from 'redux-immutable';
import preferences from './components/App/data';
import datasets from './components/Datasets/data';
import experiments from './components/Experiments/data';
import builder from './components/Builder/data';
import results from './components/Results/data';
import machines from './data/machines';

const app = combineReducers({
  preferences,
  datasets,
  experiments,
  builder,
  results,
  machines
});

export default app;