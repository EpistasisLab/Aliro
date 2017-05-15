import React from 'react';
import { Checkbox } from 'semantic-ui-react';

export class AIToggle extends React.Component {
	render() {
		const { isOn } = this.props;
		const labelClass = `ai-label ${isOn ? 'on' : 'off' }`;
		return (
			<span>
				<span className={labelClass}>
					AI {isOn ? 'on' : 'off' }
				</span>
				<Checkbox
					toggle 
					checked={isOn}
					className='ai-switch'
				/>
			</span>
		);
	}
}