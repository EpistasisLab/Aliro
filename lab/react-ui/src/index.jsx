import React from 'react';
import ReactDOM from 'react-dom';
import thunkMiddleware from 'redux-thunk';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import reducer from './scenes/Build/reducer';
import { App } from './components/App';
import { Build } from './scenes/Build';
import { Status } from './scenes/Status';
import { Router, Route, hashHistory } from 'react-router';

import { setDatasets, setAlgorithms, setCurrentAlgorithm, setCurrentDataset, fetchAlgorithms } from './scenes/Build/actions';
import { initialDatasets, initialAlgorithms } from './scenes/Build/initialValues.js';

const store = createStore(
	reducer,
	applyMiddleware(
		thunkMiddleware // lets us dispatch() functions
	)
);
store.dispatch(setDatasets(initialDatasets));
store.dispatch(setAlgorithms(initialAlgorithms));
store.dispatch(setCurrentAlgorithm(store.getState().algorithms.get('items').first()));
store.dispatch(setCurrentDataset(store.getState().datasets.get('items').first()));
store.dispatch(fetchAlgorithms()).then(() =>
  console.log(store.getState())
);

const routes = <Route component={App}>
	<Route path='/' component={Build} />
	<Router path='/status' component={Status} />
</Route>;

ReactDOM.render(
    <Provider store={store}>
        <Router history={hashHistory}>{routes}</Router>
    </Provider>,
    document.getElementById('app')
);