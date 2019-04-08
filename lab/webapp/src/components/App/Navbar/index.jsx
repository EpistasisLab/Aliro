import React from 'react';
import MediaQuery from 'react-responsive';
import DeviceWatcher from '../../../utils/device-watcher';
import { Menu, Dropdown, Icon } from 'semantic-ui-react';
import { Link } from 'react-router';

function Navbar({ preferences }) {
  const getUserTrigger = () => {
    return (
      <Menu.Item>
        <Icon name="user" />
        <MediaQuery minWidth={DeviceWatcher.breakpoints.MIN_TABLET}>
          {preferences.username} <Icon name="caret down" />
        </MediaQuery>
      </Menu.Item>
    );
  };

  return (
    <Menu inverted color="grey" fixed="top" size="large" borderless>
      <Link to="datasets" className="link">
        <Menu.Item header name="PennAI" />
      </Link>
      <MediaQuery minWidth={DeviceWatcher.breakpoints.MAX_MOBILE}>
        <Menu.Item name="Your friendly AI assistant" />
      </MediaQuery>
      {preferences &&
        <Menu.Menu position="right">
          <Link to="datasets" className="link" activeClassName="active">
            <Menu.Item name="Datasets">
              <Icon name="file text outline" />
              <MediaQuery minWidth={DeviceWatcher.breakpoints.MIN_TABLET}>
                {'Datasets'}
              </MediaQuery>
            </Menu.Item>
          </Link>
          <Link to="experiments" className="link" activeClassName="active">
            <Menu.Item name="Experiments">
              <Icon name="lab" />
              <MediaQuery minWidth={DeviceWatcher.breakpoints.MIN_TABLET}>
                {'Experiments'}
              </MediaQuery>
            </Menu.Item>
          </Link>
          <Link to="admin" className="link" activeClassName="active">
            <Menu.Item name="Admin">
              <Icon name="wrench" />
              <MediaQuery minWidth={DeviceWatcher.breakpoints.MIN_TABLET}>
                {'Admin'}
              </MediaQuery>
            </Menu.Item>
          </Link>
          <Menu.Item>
            <Icon name="user" />
            <MediaQuery minWidth={DeviceWatcher.breakpoints.MIN_TABLET}>
              {preferences.username}
            </MediaQuery>
          </Menu.Item>
        </Menu.Menu>
      }
    </Menu>
  );
}

export default Navbar;
