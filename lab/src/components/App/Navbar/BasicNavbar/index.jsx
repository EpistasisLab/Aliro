import React from 'react';
import MediaQuery from 'react-responsive';
import { Menu, Dropdown, Icon } from 'semantic-ui-react';
import { getMenuItems } from '../menuItems.js';

String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
}

export class BasicNavbar extends React.Component {
	constructor() {
		super();
		this.state = {
      menu: getMenuItems({user: 'Test'}), 
      activeItem: 'datasets',
      minBtnNameWidth: 560,
      minSubheaderWidth: 768
    };
		this.handleItemClick = this.handleItemClick.bind(this);
	}

  handleItemClick(e, { name }) {
    this.setState({ activeItem: name });
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
      <Menu.Item
        key={item.name} 
        name={item.name} 
        href={item.path} 
        active={this.state.activeItem === item.name}
        onClick={this.handleItemClick}>
          <Icon name={item.icon} />
          <MediaQuery minWidth={this.state.minBtnNameWidth}>
            {item.name.capitalize()}
          </MediaQuery> 
      </Menu.Item>
    );
  }

  renderDropdown(item) {
    const trigger = (
      <Menu.Item>
        <Icon name={item.icon} />
        <MediaQuery minWidth={this.state.minBtnNameWidth}>
          {item.text.capitalize()} <Icon name='caret down' />
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
        text={item.name.capitalize()}
        href={item.path}
      />;
    } else if(item.type === 'divider') {
      return <Dropdown.Divider />;
    }
  }
}