import pennaiApp from '../reducer';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import logger from 'redux-logger';

const configureStore = () => {
	const store = createStore(
		pennaiApp,
		applyMiddleware(
			thunkMiddleware, // lets us dispatch() functions
			logger
		)
	);

	return store;
};

export default configureStore;