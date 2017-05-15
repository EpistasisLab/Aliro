import React from 'react';
import ReactDOM from 'react-dom';
import reducer from './reducer';
import thunkMiddleware from 'redux-thunk';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import { AppContainer } from './components/App';
import { DatasetsContainer } from './scenes/Datasets';
import { ExperimentsContainer } from './scenes/Experiments';
import { Dataset } from './scenes/Dataset';
import { BuilderContainer } from './scenes/Builder';
import { Status } from './scenes/Status';
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
	<Route path='datasets/:id' component={Dataset} />
	<Route path='experiments' component={ExperimentsContainer} />
	<Route path='build/:id' component={BuilderContainer} />
	<Route path='status' component={Status} />
	<Route path='*' component={NotFound} />
</Route>;

ReactDOM.render(
    <Provider store={store}>
        <Router history={hashHistory}>{routes}</Router>
    </Provider>,
    document.getElementById('app')
);