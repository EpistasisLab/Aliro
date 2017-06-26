import React from 'react';
import MediaQuery from 'react-responsive';
import { BasicNavbar } from './BasicNavbar';
import { DraggableNavbar } from './DraggableNavbar';

// add tests for this and hook up with username
// use the built-in linking with react router
// remove hashtag
// make sure it resizes nicely/smoothly
class Navbar extends React.Component {
	render() {
		return <span>
			<MediaQuery maxWidth={1824}>
				<BasicNavbar />
			</MediaQuery>
			<MediaQuery minWidth={1825}>
				<BasicNavbar />
			</MediaQuery>
		</span>;
	}
}

export default Navbar;