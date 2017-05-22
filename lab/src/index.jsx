import React from 'react';
import ReactDOM from 'react-dom';
import reducer from './reducer';
import thunkMiddleware from 'redux-thunk';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import { AppContainer } from './components/App';
import { DatasetsContainer } from './scenes/Datasets';
import { ExperimentsContainer } from './scenes/Experiments';
import { ResultsContainer } from './scenes/Results';
import { BuilderContainer } from './scenes/Builder';
import { NotFound } from './scenes/NotFound';
import { Router, Route, IndexRedirect, hashHistory } from 'react-router';

const store = createStore(
	reducer,
	applyMiddleware(
		thunkMiddleware // lets us dispatch() functions
	)
);

const routes = <Route path='/' component={AppContainer}>
	<IndexRedirect to="datasets" />
	<Route path='datasets' component={DatasetsContainer} />
	<Route path='experiments' component={ExperimentsContainer} />
	<Route path='results/:id' component={ResultsContainer} />
	<Route path='build/:id' component={BuilderContainer} />
	<Route path='*' component={NotFound} />
</Route>;

ReactDOM.render(
    <Provider store={store}>
        <Router history={hashHistory}>{routes}</Router>
    </Provider>,
    document.getElementById('app')
);