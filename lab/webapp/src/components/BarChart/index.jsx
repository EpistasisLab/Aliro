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

import c3 from 'c3';

import d3 from 'd3';

// working version
class BarChart extends Component {
  componentDidMount() {
    const { expList,ylist, chartKey, chartColor, min, max } = this.props;
    expList && this.renderChart(expList,ylist, chartKey, chartColor, min, max);
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

  renderChart(expList,ylist, chartKey, chartColor, min, max) {
    // window.console.log('exp list: ');
    // window.console.log('expList: ', expList);
    // print d3 version
    // window.console.log('d3 version: ', d3.version);
    // print c3 version
    // window.console.log('c3 version: ', c3.version);

    // window.console.log('bar chart key: ', chartKey);
    // window.console.log('expList: ', expList);
    // window.console.log('ylist: ', ylist);

    // for each row in expList, get the key value pair

    // const data = expList.map((exp) => 
    // {
     
    //   if (exp[0].includes('class') === false) {
        
    //     window.console.log('exp[0]: ', exp[0]);
    //     exp[0] = `class_${exp[0]}`;
        
    //   }

    // });

    // window.console.log("data:",data)





    // make expList like[['1',0.2],['2',0.3],['3',0.5]]
    // expList = [['1',0.2],['2',0.3],['3',0.5]];

    // // print expList
    // window.console.log('expList: ', expList);

    // make expList [['class_1',0.2],['class_2',0.3],['class_3',0.5]];
    // var testList = expList.map((exp) => {
    //   // add class_ to each element
    //   exp[0] = `class_${exp[0]}`;
    //   return [exp[0], exp[1]];
    // });

    // window.console.log('testList: ', testList);


    // add 'data1' to expList front
    // expList.unshift('data1');

    // print chartKey
    window.console.log('chartKey: ', chartKey);


    // var tempjson 
    // combine expList and ylist
    // {label: ylist[i],val: expList[i]}
    var tempjson = expList.map((exp,i) => {
      return {label: ylist[i], importance: expList[i]}
    });

    console.log('tempjson: ', tempjson);
    // var tempjson = expList.map((exp) => {

    var chart = c3.generate({
      bindto: `.${chartKey}`,
      // data: {
      //     columns: [
              
      //         expList
      //     ],
          

      //     color: function(color, d){
      //       var lst = ['#ffebee', '#ffcdd2', '#ef9a9a', '#e57373', '#ef5350', '#f44336', '#1b5e20', '#388e3c', '#4caf50', '#81c784', '#a5d6a7', '#c8e6c9']
      //       return(lst[d.index]);
      //     },

      //     type: 'bar',
          
      // },

      data: {
        // json: [{label: "<-10", val:0},{label: "<-8",val:0},{label: "<-6",val:3},{label: "<-4",val:1},{label: "<-2",val:15},{label: "<0",val:40},{label: "<2",val:82},{label: "<4",val:68},{label: "<6",val:7},{label: "<8",val:6},{label: "<10",val:3},{label: ">10",val:1}],

        json: tempjson,

        
        keys: {
            x: 'label',
            value: ["importance"],
        },
        

        color: function(color, d){
          
          var lst = ['#ffebee', '#ffcdd2', '#ef9a9a', '#e57373', '#ef5350', '#f44336', '#1b5e20', '#388e3c', '#4caf50', '#81c784', '#a5d6a7', '#c8e6c9']
          // var continouslst = 
          return(lst[d.index]);
        },

        type: 'bar',
        
    },                 
    axis: {
      // x: {
      //   rotated: true,
      //   type: 'category',
      //   tick: { centered: true, color: '#000000'}

      //   }

      
        rotated: true,
        x: {
            type: 'category',
            tick: {
                rotate: 75,
                // multiline: true
                multiline: false
            },
          
        },
        y: {
          tick: {
            count: 3,
            fit: true,
            // max

            format: d3.format(".5f")
            
          }
        }
      // axises and labels color white

    },
    // disable click interaction
    legend: {
      item: { onclick: function () {} }
    },
  
    

    title: {
      text: 'Permutationa Feature Importance',
      color: '#000000 !important'
    },

      
      bar: {
          width: {
              ratio: 0.5 // this makes bar width 50% of length between ticks
          }
          // or
          //width: 100 // this makes bar width 100px
      }
    });

    // if document element has testuser text, then make it unvisiable 


    



  }

  render() {
    return (
      // <div className={`Bar ${this.props.chartKey}`} />

      <div >
        
        <svg className={`Bar ${this.props.chartKey}`} 
        viewBox={`0 0 ${window.innerWidth*0.31} ${window.innerHeight*0.31}`} 
        preserveAspectRatio="xMinYMin meet" >
          
      </svg>
  </div>
    );
  }
}

BarChart.defaultProps = {
  chartColor: '#60B044'
};

export default BarChart;