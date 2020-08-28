/* This file is part of the PennAI library.

Copyright (C) 2017 Epistasis Lab, University of Pennsylvania

PennAI is maintained by:
    - Heather Williams (hwilli@upenn.edu)
    - Weixuan Fu (weixuanf@pennmedicine.upenn.edu)
    - William La Cava (lacava@upenn.edu)
    - and many other generous open source contributors

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.

*/
import React, { Component } from 'react';
import { Grid } from 'semantic-ui-react';

class ResponsiveGrid extends Component {
  static getBreakpoints() {
    return {
      MAX_MOBILE: 480,
      MIN_TABLET: 768,
      MAX_TABLET: 1024,
      MAX_DESKTOP: 1374,
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
    window.addEventListener('resize', this.updateWindowDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
  }

  updateWindowDimensions() {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  }

  calcCols() {
    const { width } = this.state;
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