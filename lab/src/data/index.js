import { combineReducers } from 'redux';
import preferences from './preferences';
import datasets from './datasets';
import experiments from './experiments';
import machines from './machines';
import builder from './builder';

const data = combineReducers({
	preferences,
	datasets,
	experiments,
	machines,
	builder
});

export default data;