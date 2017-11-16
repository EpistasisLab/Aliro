import React from 'react';
import { render } from 'react-dom';
import configureStore from './config/configureStore';
import configureSocket from './config/configureSocket';
import Root from './components/Root';

const store = configureStore();
configureSocket(store);

render(
  <Root store={store} />,
  document.getElementById('app')
);