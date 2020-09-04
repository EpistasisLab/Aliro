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
import c3 from 'c3';

class GaugeAll extends Component {
  componentDidMount() {
    const { expList, chartKey, chartColor, min, max } = this.props;
    expList && this.renderChart(expList, chartKey, chartColor, min, max);
  }
/*
colors: {
  'test_score': '#0072b2',  ---- light blue
  'train_score': '#f0e442'  ---- light yellow
  '#55D6BE' ----- light sea green
}

use anonymous function to 'disable' interaction
look here - https://github.com/c3js/c3/issues/493#issuecomment-456686654
*/

  renderChart(expList, chartKey, chartColor, min, max) {
    //window.console.log('exp list: ', expList);
    let tempIndex = 0;
    c3.generate({
      bindto: `.${chartKey}`,
      data: {
        onclick: () => {},
        columns: expList,
        color: function (color, data) {
          tempIndex++;
          switch (tempIndex % 2) {
            case 0:
              return '#55d6be'; // sea foam green
              break;
            case 1:
              return '#7D5BA6'; // purple
              break;
            default:
              return color;
          }
        },
        type: 'gauge',
      },
      legend: {
        item: { onclick: () => {} }
      },
      gauge: {
        label: {
          format: function(value) {
            // don't return anything to 'disable' floating label
            // - they get cut off & are difficult to read when they overlap
            // TODO: try to override styling
            // let retVal;
            // value ? retVal = value.toFixed(2) : retVal = value;
            return;
          },
          show: true
        },
        min: min,
        max: max
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

GaugeAll.defaultProps = {
  chartColor: '#60B044'
};

export default GaugeAll;
