import React from 'react';
import ReactDOM from 'react-dom';
import reducer from './reducer';
import thunkMiddleware from 'redux-thunk';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import { App } from './components/App';
import { DatasetsContainer } from './scenes/Datasets';
import { Dataset } from './scenes/Dataset';
import { Build } from './scenes/Build';
import { Status } from './scenes/Status';
import { NotFound } from './scenes/NotFound';
import { Router, Route, IndexRedirect, hashHistory } from 'react-router';

import { fetchPreferences } from './data/preferences/api';
import { setCurrentDataset } from './data/currentDataset/actions';
import { setCurrentAlgorithm } from './data/currentAlgorithm/actions';

const store = createStore(
	reducer,
	applyMiddleware(
		thunkMiddleware // lets us dispatch() functions
	)
);

store.dispatch(fetchPreferences()).then(function(res) {
	store.dispatch(setCurrentDataset(res.preferences.get('Datasets').first()));
	store.dispatch(setCurrentAlgorithm(res.preferences.get('Algorithms').first()));
});

const routes = <Route path='/' component={App}>
	<IndexRedirect to="datasets" />
	<Route path='datasets' component={DatasetsContainer} />
	<Route path='datasets/:id' component={Dataset} />
	<Route path='launchpad' component={Build} />
	<Route path='status' component={Status} />
	<Route path='*' component={NotFound} />
</Route>;

ReactDOM.render(
    <Provider store={store}>
        <Router history={hashHistory}>{routes}</Router>
    </Provider>,
    document.getElementById('app')
);