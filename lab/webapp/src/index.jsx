import React from 'react';
import { render } from 'react-dom';
import configStore from './config/configStore';
import configSocket from './config/configSocket';
import Root from './components/Root';

const store = configStore();
configSocket(store);

/**
* Root react-redux component - base/root for website, uses helper config files to
* configure the redux store & create socket io server that broadcasts redux actions
* depeneding on respective network event
*
*/
render(
  <Root store={store} />,
  document.getElementById('app')
);
