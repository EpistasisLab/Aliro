import React, { Component } from 'react';
import { Checkbox, Dropdown, Icon } from 'semantic-ui-react';

class DatasetActions extends Component {
	constructor(props) {
		super(props);

		this.onToggleAI = this.onToggleAI.bind(this);
	}

	onToggleAI() {
		const { toggleAI, dataset } = this.props;
		toggleAI(dataset.get('_id'), this.getNextAIState(dataset.get('ai')));
	}

	getIsTogglingAI() {
		const isTogglingAI = this.props.dataset.get('isTogglingAI');
		return isTogglingAI;
	}

	getShouldDisplayAIToggle() {
		const hasMetadata = this.props.dataset.get('has_metadata');
		return hasMetadata;
	}

	getIsAIChecked() {
		const aiState = this.props.dataset.get('ai');
		return !aiState ? false : true;
	}

	getNextAIState() {
		const aiState = this.props.dataset.get('ai');
		return !aiState ? 'requested' : false;
	}

	getAILabelText() {
		const aiState = this.props.dataset.get('ai');
		return aiState ? 'AI on' : aiState === 'requested' ? 'AI requested' : 'AI off';  
	}

	getAILabelClass() {
		const aiState = this.props.dataset.get('ai');
		return `ai-label ${aiState ? 'on' : 'off' }`;
	}

	getAIToggleClass() {
		const aiState = this.props.dataset.get('ai');
		return aiState === 'requested' ? 'ai-switch requested' : 'ai-switch';
	}

	getDropdownIcon() {
		return <Icon inverted color='grey' size='large' name='caret down' />;
	}

	render() {
		const { 
			dataset,
			isTogglingAI
		} = this.props;

		return (
			<span>
				{this.getShouldDisplayAIToggle() &&
					<span>
						<span className={this.getAILabelClass()}>
							{this.getAILabelText()}
						</span>
						<Checkbox
							toggle 
							checked={this.getIsAIChecked()}
							className={this.getAIToggleClass()}
							onChange={this.onToggleAI}
							disabled={this.getIsTogglingAI()}
						/>
					</span>	
				}
				<Dropdown pointing='top right' icon={this.getDropdownIcon()}>
					<Dropdown.Menu>
						<Dropdown.Item icon='file' text='Replace file' />
						<Dropdown.Item icon='trash' text='Delete' />
					</Dropdown.Menu>
				</Dropdown>
			</span>
		);
	}
}

export default DatasetActions;