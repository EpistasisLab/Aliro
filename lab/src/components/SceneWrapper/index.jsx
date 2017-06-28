import React, { Component } from 'react';
import { Header, Button } from 'semantic-ui-react';

// make more robust for many use cases
class SceneHeader extends Component {
	render() {
		const {
			headerContent,
			subheader,
			btnContent,
			btnIcon,
			btnAction,
			children
		} = this.props;
		return (
			<div>
				{headerContent &&
					<Header 
						inverted 
						size="huge" 
						content={headerContent}
						subheader={subheader}
						className="scene-title"
					/>
				}
				{btnContent &&
					<Button 
						inverted 
						color="blue" 
						compact 
						size="small" 
						icon={btnIcon}
						content={btnContent}
						className="scene-btn"
					/>
				}
				{children}
			</div>
		);
	}
}

export default SceneHeader;