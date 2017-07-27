import React, { Component } from 'react';
import { connect } from 'react-redux';
//import * as actions from './data/actions';
/*import {
  //getAllAlgorithms
} from './data';*/
import SceneHeader from '../SceneHeader';
import Admin from './Admin';

class AdminContainer extends Component {
  componentDidMount() {
    //this.props.fetchAlgorithms();
  }

  render() {
    return (
      <div>
        <SceneHeader header="Manage Algorithms" />
        <Admin {...this.props} />
      </div>
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