import React from 'react';
import ReactDOM from 'react-dom';
import {createStore} from 'redux';
import {Provider} from 'react-redux';
import reducer from './reducer';
import { App } from './components/App';

import { setDatasets, setAlgorithms, setCurrentAlgorithm } from './actions';
import { initialDatasets, initialAlgorithms } from './initialValues.js';

const store = createStore(reducer);
store.dispatch(setDatasets(initialDatasets));
store.dispatch(setAlgorithms(initialAlgorithms));
store.dispatch(setCurrentAlgorithm(store.getState().algorithms.first()));

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('app')
);