import React from 'react';
import { render } from 'react-dom';
import configStore from './config/configStore';
import configSocket from './config/configSocket';
import Root from './components/Root';

const store = configStore();
configSocket(store);

render(
  <Root store={store} />,
  document.getElementById('app')
);