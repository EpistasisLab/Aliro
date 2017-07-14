import React from 'react';
import Draggable from 'react-draggable';
import { Menu, Dropdown, Icon } from 'semantic-ui-react';
import { getMenuItems } from '../menuItems.js';

export class DraggableNavbar extends React.Component {
  constructor() {
    super();
    this.state = {
      menu: getMenuItems({user: 'Test'}), 
      activeItem: 'Datasets'
    };
    this.handleItemClick = this.handleItemClick.bind(this);
  }

  handleItemClick(e, { name }) {
    this.setState({ activeItem: name });
  }

  render() {
    return (
      <div className='navbar'>
        <Draggable>
          <Menu inverted color='teal' size='large' vertical>
            <Menu.Item header name={this.state.menu.header} />
            <Menu.Item name={this.state.menu.subheader} />
            {this.state.menu.items.map(item =>
              this.renderMenuItem(item)
            )}
          </Menu>
        </Draggable>
      </div>
    );
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
        onClick={this.handleItemClick}
      >
        <Icon name={item.icon} /> {item.name}
      </Menu.Item>
    );
  }

  renderDropdown(item) {
    return (
      <Dropdown item text={item.text} key={item.icon}>
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
      return (
        <Dropdown.Item
          key={item.name} 
          icon={item.icon} 
          text={item.name}
          href={item.path}
        />
      );
    } else if(item.type === 'divider') {
      //return <Dropdown.Divider />;
    }
  }
}
