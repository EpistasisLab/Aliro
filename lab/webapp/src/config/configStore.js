import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';
import data from '../data';


/**
* Helps redux app create redux app store with middleware, in this case the
* library 'thunk' to help with async calls and a logging library; these
* '...provides a third-party extension point between dispatching an action,
* and the moment it reaches the reducer'
* --- taken from: https://redux.js.org/advanced/middleware
* essentially, intercepts default redux behavior and allows things such as logging
* or asynchronous actions without having to make special accommodations
*/
const configStore = () => {
  const middleware = [thunk];

  if(process.env.NODE_ENV === 'development') {
    const logger = createLogger({ collapsed: true });
    middleware.push(logger);
  }

  return createStore(data, applyMiddleware(...middleware));
};

export default configStore;
