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