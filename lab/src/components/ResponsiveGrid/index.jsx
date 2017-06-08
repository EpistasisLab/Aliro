import React, { Component } from 'react';
import { Grid } from 'semantic-ui-react';

class ResponsiveGrid extends Component {
	static getBreakpoints() {
		return {
			MAX_MOBILE: 480,
			MIN_TABLET: 768,
			MAX_TABLET: 1024,
			MAX_DESKTOP: 1224,
			MAX_LGSCREEN: 1824
		};
	}

	constructor(props) {
		super(props);
		this.state = {
			width: window.innerWidth, 
			height: window.innerHeight
		};

		this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
	}

	componentDidMount() {
		this.updateWindowDimensions();
 		window.addEventListener('resize', this.updateWindowDimensions.bind(this));
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.updateWindowDimensions.bind(this));
	}

	updateWindowDimensions() {
		this.setState({ width: window.innerWidth, height: window.innerHeight });
	}

	calcCols() {
	 	const { width, height } = this.state;
	 	const { mobile, tablet, desktop, lgscreen } = this.props;
	 	const breakpoints = this.constructor.getBreakpoints();

		if(width < breakpoints.MIN_TABLET) { 
			return mobile; 
		} else if(width < breakpoints.MAX_TABLET) { 
			return tablet; 
		} else if(width < breakpoints.MAX_DESKTOP) { 
			return desktop; 
		} else { 
			return lgscreen;
		}
	}

	render() {
		return (
			<Grid stretched columns={this.calcCols()}>
				{this.props.children}
			</Grid>
		);
	}
}

export default ResponsiveGrid;