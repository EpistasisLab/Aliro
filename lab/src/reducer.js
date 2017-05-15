import { combineReducers } from 'redux';
import preferences from './components/App/data';
import datasets from './scenes/Datasets/data';
import experiments from './scenes/Experiments/data';
import builder from './scenes/Builder/data';

const app = combineReducers({
   preferences,
   datasets,
   experiments,
   builder
});

export default app;