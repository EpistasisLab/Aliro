import React, { Component } from 'react';
import c3 from 'c3';

class Gauge extends Component {
  componentDidMount() {
    const { value, chartKey, chartColor } = this.props;
    this.renderChart(value, chartKey, chartColor);
  }

  renderChart(value, chartKey, chartColor) {
    c3.generate({
      bindto: `.${chartKey}`,
      data: {
        columns: [
          ['data', value]
        ],
        type: 'gauge',
        //onclick: function (d, i) { console.log("onclick", d, i); },
        //onmouseover: function (d, i) { console.log("onmouseover", d, i); },
        //onmouseout: function (d, i) { console.log("onmouseout", d, i); }
      },
      gauge: {
        label: {
          format: function(value) {
            return value.toFixed(2);
          },
          show: true
        },
        min: 0.5, 
        max: 1.0
      },
      color: {
        pattern: [chartColor], // the three color levels for the percentage values.
        threshold: {
          unit: 'value', // percentage is default
          max: 200, // 100 is default
          values: [30, 60, 90, 100]
        }
      },
      interaction: {
        enabled: false
      }
    });
  }

  render() {
    return (
      <div className={`gauge ${this.props.chartKey}`} />
    );
  }
}

Gauge.defaultProps = {
  chartColor: '#60B044'
};

export default Gauge;