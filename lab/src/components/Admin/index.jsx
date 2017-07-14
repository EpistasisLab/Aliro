import React, { Component } from 'react';
import { connect } from 'react-redux';
//import * as actions from './data/actions';
/*import {
  //getAllAlgorithms
} from './data';*/
import SceneWrapper from '../SceneWrapper';
import Admin from './Admin';

class AdminContainer extends Component {
  componentDidMount() {
    //this.props.fetchAlgorithms();
  }

  render() {
    return (
      <SceneWrapper headerContent="Manage Algorithms">
        <Admin {...this.props} />
      </SceneWrapper> 
    );
  }
}

const mapStateToProps = (state) => ({
  //
});

export default connect(
  mapStateToProps, 
  //actions
)(AdminContainer);