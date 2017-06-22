import React from 'react';
import { Provider } from 'react-redux';
import { Router, Route, IndexRedirect, hashHistory } from 'react-router';

import { AppContainer } from '../App';
import DatasetsScene from '../../scenes/DatasetsScene';
import ExperimentsScene from '../../scenes/ExperimentsScene';

import { ResultsContainer } from '../../scenes/Results';
import { BuilderContainer } from '../../scenes/Builder';
import { NotFound } from '../../scenes/NotFound';

function Root({ store }) {
	return (
		<Provider store={store}>
			<Router history={hashHistory}>
				<Route path='/' component={AppContainer}>
					<IndexRedirect to="datasets" />
					<Route path='datasets' component={DatasetsScene} />
					<Route path='experiments' component={ExperimentsScene} />
					<Route path='results/:id' component={ResultsContainer} />
					<Route path='build/:id' component={BuilderContainer} />
					<Route path='build/:id/:exp' component={BuilderContainer} />
					<Route path='*' component={NotFound} />
				</Route>
			</Router>
		</Provider>
	);
}

export default Root;