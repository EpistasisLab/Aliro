import React from 'react';
import MediaQuery from 'react-responsive';
import { Menu, Dropdown, Icon } from 'semantic-ui-react';
import { getMenuItems } from '../menuItems.js';
import { Link } from 'react-router';

export class BasicNavbar extends React.Component {
	constructor() {
		super();
		this.state = {
      menu: getMenuItems({user: 'Test'}),
      minBtnNameWidth: 560,
      minSubheaderWidth: 768
    };
	}

  render() {
    return <Menu inverted color='teal' fixed='top' size='large' borderless>
      <Menu.Item header name={this.state.menu.header} />
      <MediaQuery minWidth={this.state.minSubheaderWidth}>
        <Menu.Item name={this.state.menu.subheader} />
      </MediaQuery>
      <Menu.Menu position='right'>
        {this.state.menu.items.map(item =>
          this.renderMenuItem(item)
        )}
      </Menu.Menu>
    </Menu>;
  }

  renderMenuItem(item) {
    if(item.type === 'button') {
      return this.renderButton(item);
    } else if(item.type === 'dropdown') {
      return this.renderDropdown(item);
    }
  }

  renderButton(item) {
    return (
      <Link to={item.path} className='link' activeClassName='active'>
        <Menu.Item
          key={item.name}
          name={item.name}>
            <Icon name={item.icon} />
            <MediaQuery minWidth={this.state.minBtnNameWidth}>
              {item.name}
            </MediaQuery>
        </Menu.Item>
      </Link>
    );
  }

  renderDropdown(item) {
    const trigger = (
      <Menu.Item>
        <Icon name={item.icon} />
        <MediaQuery minWidth={this.state.minBtnNameWidth}>
          {item.text} <Icon name='caret down' />
        </MediaQuery>
      </Menu.Item>
    );

    return (
      <Dropdown trigger={trigger} icon={null}>
        <Dropdown.Menu>
          {item.items.map(item =>
            this.renderDropdownItem(item)
          )}
        </Dropdown.Menu>
      </Dropdown>
    );
  }

  renderDropdownItem(item) {
    if(item.type === 'button') {
      return <Dropdown.Item
        key={item.name} 
        icon={item.icon} 
        text={item.name}
        href={item.path}
      />;
    } else if(item.type === 'divider') {
      return <Dropdown.Divider />;
    }
  }
}