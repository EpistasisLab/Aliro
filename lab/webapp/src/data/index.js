import { combineReducers } from 'redux';
import preferences from './preferences';
import datasets from './datasets';
import dataset from './datasets/dataset';
import experiments from './experiments';
import machines from './machines';
import builder from './builder';
import recommender from './recommender';

const data = combineReducers({
	preferences,
	datasets,
	dataset,
	experiments,
	machines,
	builder,
	recommender
});

export default data;
