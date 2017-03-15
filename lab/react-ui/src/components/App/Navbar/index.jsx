import React from 'react';
import { Menu } from 'semantic-ui-react';

export class Navbar extends React.Component {
	constructor() {
		super();
		this.state = {activeItem: 'Build'};
		this.handleItemClick = this.handleItemClick.bind(this);
	}

  	handleItemClick(e, { name }) {
  		this.setState({ activeItem: name });
  	}

    render() {
        return <Menu inverted fixed='bottom' widths='3'>
          <Menu.Item 
          	name='Build' 
          	href='/#/' 
          	active={this.state.activeItem === 'Build'} 
          	onClick={this.handleItemClick} 
          />
          <Menu.Item 
          	name='Status' 
          	href='/#/status' 
          	active={this.state.activeItem === 'Status'}
          	onClick={this.handleItemClick} 
          />
          <Menu.Item 
          	name='Config' 
          	active={this.state.activeItem === 'Config'}
          />
        </Menu>;
    }
}