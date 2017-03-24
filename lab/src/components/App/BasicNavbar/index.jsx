import React from 'react';
import MediaQuery from 'react-responsive';
import Draggable from 'react-draggable';
import { Menu, Dropdown, Header, Icon } from 'semantic-ui-react';

String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
}

export class BasicNavbar extends React.Component {
	constructor() {
		super();
		this.state = {activeItem: 'Build'};
		this.handleItemClick = this.handleItemClick.bind(this);
	}

	handleItemClick(e, { name }) {
		this.setState({ activeItem: name });
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
            <MediaQuery minWidth={480}>{item.name.capitalize()}</MediaQuery> 
        </Menu.Item>
      );
  }

  renderDropdown(item) {
    const trigger = (
      <Menu.Item>
        <Icon name={item.icon} />
        <MediaQuery minWidth={480}>
          {item.text.capitalize()} <Icon name='caret down' />
        </MediaQuery>
      </Menu.Item>
    );

    return (
      <Dropdown trigger={trigger} icon={null} >
        <Dropdown.Menu>
          <Dropdown.Item icon='bell' text='Notifications' />
          <Dropdown.Item icon='setting' text='Settings' />
          <Dropdown.Divider />
          <Dropdown.Item icon='sign out' text='Sign Out' />
        </Dropdown.Menu>
      </Dropdown>
    );
  }

    // use the built-in linking with react router
    // remove hashtag
    // clean up code
    render() {
      const menu = {
        header: 'PennAI',
        subheader: 'Your friendly AI assistant',
        items: [{
            type: 'button',
            name: 'datasets',
            path: '/#/',
            icon: 'file text outline'
          },
          {
            type: 'button',
            name: 'launchpad',
            path: '/#/launchpad',
            icon: 'rocket'
          },
          {
            type: 'button',
            name: 'status',
            path: '/#/status',
            icon: 'list'
          },
          {
            type: 'dropdown',
            icon: 'user',
            text: 'Sharon',
            items: []
          }]
      };

        return <Menu inverted color='grey' borderless fixed='top'>
          <Menu.Item header name={menu.header} />
          <MediaQuery minWidth={768}>
            <Menu.Item name={menu.subheader} />
          </MediaQuery>
          <Menu.Menu position='right'>
            {menu.items.map(item =>
              this.renderMenuItem(item)
            )}
          </Menu.Menu>
        </Menu>;
    }
}