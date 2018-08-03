import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';
import data from '../data';

const configStore = () => {
  const middleware = [thunk];

  if(process.env.NODE_ENV === 'development') {
    const logger = createLogger({ collapsed: true });
    middleware.push(logger);
  }

  return createStore(data, applyMiddleware(...middleware));
};

export default configStore;