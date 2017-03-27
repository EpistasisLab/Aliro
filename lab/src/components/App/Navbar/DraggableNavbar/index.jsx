import React from 'react';
import Draggable from 'react-draggable';
import { Menu, Dropdown, Icon } from 'semantic-ui-react';
import { getMenuItems } from '../menuItems.js';

String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
}

export class DraggableNavbar extends React.Component {
	constructor() {
		super();
		this.state = {
      menu: getMenuItems({user: 'Test'}), 
      activeItem: 'datasets'
    };
		this.handleItemClick = this.handleItemClick.bind(this);
	}

  handleItemClick(e, { name }) {
    this.setState({ activeItem: name });
  }

  render() {
    return <div className='navbar'>
      <Draggable>
        <Menu inverted color='teal' size='large' vertical>
          <Menu.Item header name={this.state.menu.header} />
          <Menu.Item name={this.state.menu.subheader} />
          {this.state.menu.items.map(item =>
            this.renderMenuItem(item)
          )}
        </Menu>
      </Draggable>
    </div>;
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
          <Icon name={item.icon} /> {item.name.capitalize()}
      </Menu.Item>
    );
  }

  renderDropdown(item) {
    return (
      <Dropdown item text={item.text}>
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