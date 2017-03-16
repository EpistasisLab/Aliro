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

// import { initialPreferences } from './scenes/Build/initialValues.js';
import { fetchPreferences, setCurrentDataset, setCurrentAlgorithm, setPreferences } from './scenes/Build/actions';

const store = createStore(
	reducer,
	applyMiddleware(
		thunkMiddleware // lets us dispatch() functions
	)
);

// store.dispatch(setPreferences(initialPreferences));
store.dispatch(fetchPreferences()).then(function() {
	store.dispatch(setCurrentDataset(store.getState().preferences.get('items').get('Datasets').first()));
	store.dispatch(setCurrentAlgorithm(store.getState().preferences.get('items').get('Algorithms').first()));
});

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