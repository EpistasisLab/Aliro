import React from 'react';
import MediaQuery from 'react-responsive';
import DeviceWatcher from '../../../../device-watcher';
import { Menu, Dropdown, Icon } from 'semantic-ui-react';
import { Link } from 'react-router';

function BasicNavbar() {
  const userTrigger = (
    <Menu.Item>
      <Icon name="user" />
      <MediaQuery minWidth={DeviceWatcher.breakpoints.MIN_TABLET}>
        User <Icon name="caret down" />
      </MediaQuery>
    </Menu.Item>
  );

  return (
    <Menu inverted color="grey" fixed="top" size="large" borderless>
      <Link to="datasets" className="link"> 
        <Menu.Item header name="PennAI" />
      </Link>
      <MediaQuery minWidth={DeviceWatcher.breakpoints.MAX_MOBILE}>
        <Menu.Item name="Your friendly AI assistant" />
      </MediaQuery>
      <Menu.Menu position="right">
        <Link to="datasets" className="link" activeClassName="active"> 
          <Menu.Item name="Datasets">
            <Icon name="file text outline" />
            <MediaQuery minWidth={DeviceWatcher.breakpoints.MIN_TABLET}>
              Datasets
            </MediaQuery>
          </Menu.Item>
        </Link>
        <Link to="experiments" className="link" activeClassName="active"> 
          <Menu.Item name="Experiments">
            <Icon name="lab" />
            <MediaQuery minWidth={DeviceWatcher.breakpoints.MIN_TABLET}>
              Experiments
            </MediaQuery>
          </Menu.Item>
        </Link>
        <Dropdown trigger={userTrigger} icon={null}>
          <Dropdown.Menu>
            <Dropdown.Item 
              as={Link} 
              to="settings"
              icon="setting" 
              text="Settings" 
            />
            <Dropdown.Item
              icon="sign out" 
              text="Sign out" 
            />
          </Dropdown.Menu>
        </Dropdown>
      </Menu.Menu>
    </Menu>
  );
}

export default BasicNavbar;