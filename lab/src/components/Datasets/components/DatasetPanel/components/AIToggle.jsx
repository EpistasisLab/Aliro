import React from 'react';
import { Checkbox } from 'semantic-ui-react';

export class AIToggle extends React.Component {
	render() {
		const { 
			aiState,
			toggleAI,
			isToggling
		} = this.props;

		const nextState = (() => {
			return !aiState ? 'requested' : false;
		})();

		const isChecked = (() => {
			return !aiState ? false : true;
		})();

		const labelText = (() => {
			switch(aiState) {
				case false:
					return 'AI off';
				case 'requested':
					return 'AI requested';
				case true:
					return 'AI on';		
			}
		})();

		const labelClass = `ai-label ${aiState ? 'on' : 'off' }`;

		const toggleClass = aiState === 'requested' ? 'ai-switch requested' : 'ai-switch';
		return (
			<span>
				<span className={labelClass}>
					{labelText}
				</span>
				<Checkbox
					toggle 
					checked={isChecked}
					className={toggleClass}
					onChange={() => toggleAI(nextState)}
					disabled={isToggling}
				/>
			</span>
		);
	}
}