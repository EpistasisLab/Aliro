import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { socketMiddleware } from './configureSocket';
import { createLogger } from 'redux-logger';
import pennaiApp from '../reducer';

// create dev env for logging
const configureStore = () => {
  const store = createStore(
    pennaiApp,
    applyMiddleware(
      thunk, // lets us dispatch() functions
      socketMiddleware,
      createLogger({
        collapsed: true,
        stateTransformer: state => state.toJS()
      })
    )
  );

  return store;
};

export default configureStore;