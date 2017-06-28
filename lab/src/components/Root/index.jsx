import React from 'react';
import { Provider } from 'react-redux';
import { Router, Route, IndexRedirect, hashHistory } from 'react-router';

import App from '../App';
import Datasets from '../Datasets';
import Experiments from '../Experiments';
import Results from '../Results';
import Builder from '../Builder';
import NotFound from '../NotFound';

function Root({ store }) {
	return (
		<Provider store={store}>
			<Router history={hashHistory} onUpdate={() => window.scrollTo(0, 0)}>
				<Route path='/' component={App}>
					<IndexRedirect to="datasets" />
					<Route path='datasets' component={Datasets} />
					<Route path='experiments' component={Experiments} />
					<Route path='builder' component={Builder} />
					<Route path='results/:id' component={Results} />
					<Route path='*' component={NotFound} />
				</Route>
			</Router>
		</Provider>
	);
}

export default Root;