import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Header } from 'semantic-ui-react';

class BarChart extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };

  }

  componentDidMount() {

  }
  
  render() {
    return (
      <Header>
        Bar_Chart
      </Header>
    );
  }
}

const mapStateToProps = (state) => ({

});

export { BarChart };
export default connect(mapStateToProps, {})(BarChart);
