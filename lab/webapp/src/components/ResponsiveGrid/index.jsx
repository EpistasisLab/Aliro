/* ~This file is part of the Aliro library~

Copyright (C) 2023 Epistasis Lab, 
Center for Artificial Intelligence Research and Education (CAIRE),
Department of Computational Biomedicine (CBM),
Cedars-Sinai Medical Center.

Aliro is maintained by:
    - Hyunjun Choi (hyunjun.choi@cshs.org)
    - Miguel Hernandez (miguel.e.hernandez@cshs.org)
    - Nick Matsumoto (nicholas.matsumoto@cshs.org)
    - Jay Moran (jay.moran@cshs.org)
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

(Autogenerated header, do not modify)

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
    console.log("updateWindowDimensions", window.innerWidth, window.innerHeight)
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



