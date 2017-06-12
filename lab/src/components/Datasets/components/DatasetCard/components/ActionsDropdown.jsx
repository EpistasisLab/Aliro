import React from 'react';
import { Dropdown, Icon } from 'semantic-ui-react';

export class ActionsDropdown extends React.Component {
	render() {
		const dropdownIcon = (
			<Icon inverted color='grey' size='large' name='caret down' />
		);
		return (
			<Dropdown pointing='top right' icon={dropdownIcon}>
				<Dropdown.Menu>
					<Dropdown.Item icon='file' text='Replace file' />
					<Dropdown.Item icon='trash' text='Delete' />
				</Dropdown.Menu>
			</Dropdown>
		);
	}
}