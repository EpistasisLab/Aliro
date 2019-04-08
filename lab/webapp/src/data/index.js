import { combineReducers } from 'redux';
import preferences from './preferences';
import datasets from './datasets';
import dataset from './datasets/dataset';
import experiments from './experiments';
import machines from './machines';
import builder from './builder';

const data = combineReducers({
	preferences,
	datasets,
	dataset,
	experiments,
	machines,
	builder
});

export default data;
