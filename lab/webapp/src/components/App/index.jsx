/* ~This file is part of the PennAI library~

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
import { connect } from 'react-redux';
import * as actions from 'data/preferences/actions';
import Navbar from './Navbar';
import FetchError from '../FetchError';
import { Container, Loader } from 'semantic-ui-react';


/**
* Main menu bar of website - parent component of navbar
*/
class App extends Component {
  /**
  * react lifecycle method, when component is done loading, after it is mounted in
  * DOM, use preferences action creator, fetchPreferences, to request retrieval of
  * user preferences - user info and available machine learning algorithms
  */
  componentDidMount() {
    this.props.fetchPreferences();
  }

  render() {
    const { preferences, fetchPreferences, children } = this.props;

    if(preferences.isFetching) {
      return (
        <Loader active inverted size="large" content="Retrieving your preferences..." />
      );
    }

    if(preferences.error) {
      return (
        <FetchError
          message={preferences.error}
          onRetry={() => fetchPreferences()}
        />
      );
    }

    return (
      <Container fluid className="app pennai">
        <Navbar preferences={preferences.data} />
        {children}
      </Container>
    );
  }
}

const mapStateToProps = (state) => ({
  preferences: state.preferences
});

export { App };
export default connect(mapStateToProps, actions)(App);
