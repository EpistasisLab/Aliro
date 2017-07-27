import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { socketMiddleware } from './configureSocket';
import { createLogger } from 'redux-logger';
import pennaiApp from '../reducer';

const configureStore = () => {
  const middlewares = [
    thunk, // lets us dispatch() functions
    socketMiddleware
  ];

  // middleware for development environment
  if(process.env.NODE_ENV === 'development') {
    const logger = createLogger({
      collapsed: true,
      stateTransformer: state => state.toJS()
    });

    middlewares.push(logger);
  }

  const store = createStore(
    pennaiApp,
    applyMiddleware(...middlewares)
  );

  return store;
};

export default configureStore;