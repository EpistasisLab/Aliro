import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Header } from 'semantic-ui-react';
import * as d3 from "d3";

class BarChart extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  this.createBarGraph = this.createBarGraph.bind(this);
  }

  componentDidMount() {
    this.createBarGraph();
  }

  componentDidUpdate(prevProps, prevState) {
    //this.createBarGraph();
  }

  // adapted from https://bl.ocks.org/d3noob/bdf28027e0ce70bd132edc64f1dd7ea4
  createBarGraph(){
    const { dep_col, dataPreview, valByRowObj, tempKey, keys } = this.props;
    let margin = { top: 10, right: 30, bottom: 50, left: 70 },
        width = 460 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    let chartInnerHTML = "";
    //let valByRowObj = this.getDataValByRow();
    if(document.getElementById("test_bar_chart_" + tempKey)) {
      chartInnerHTML = document.getElementById("test_bar_chart_" + tempKey).innerHTML;
    };

    var dataStackTest = d3.stack().keys([tempKey, dep_col])(dataPreview.data);

    //window.console.log('data stuff', dataStackTest);

    if(chartInnerHTML === "") {
      width = 460 - margin.left - margin.right;
      let data_sorted = valByRowObj[tempKey].sort(d3.ascending);

      let classCountObj = {};
      let tempCountObj = {};
      let proportionObj = {};
      let propObj = [];
      let tempData = [];
      data_sorted.forEach(val => {
        classCountObj[val] = classCountObj[val] ? ++classCountObj[val] : 1;
      })
      //tempData.push(classCountObj);
      let testSet = [... new Set(valByRowObj[tempKey])];
      let depColSet = [... new Set(valByRowObj[dep_col])]
      // count proportion of given column name/key with dataset dependent_col
      testSet.forEach(tKey => {
        tempCountObj[tKey] = [];
        dataPreview.data.forEach(entry => {
          if(entry[tempKey] === tKey) {
            tempCountObj[tKey].push(entry[dep_col])
          }
        })
      });
      // unqiue counts of each class occurance per value in given column name/key
      Object.entries(tempCountObj).forEach((entry, index) => {
        proportionObj[entry[0]] = [];
        let tempObj = {};
        depColSet.forEach(depVal => {
          tempObj.column_name = entry[0];
          let tempLen = entry[1].filter(x => x === depVal).length;
          //proportionObj[entry[0]].push({[depVal]: tempLen})
          tempObj[depVal] = tempLen;
          proportionObj[entry[0]].push(tempLen);
        })
        propObj.push(tempObj);
      })
      window.console.log('temp thing', propObj);
      let stackedData = [];

      testSet.forEach(tKey => {
        tempData.push({
          entry: {
            testKey: tKey,
            testValue: classCountObj[tKey],
            proportion: proportionObj[tKey]
          }
        })
      });

      depColSet.forEach(classKey => {
        let tempObj = {"class": classKey};
        testSet.forEach(tKey => {
          tempObj[tKey] = proportionObj[tKey][classKey];
        })
        stackedData.push(tempObj);
      })

      window.console.log('stackedData', stackedData);
      let svg = d3.select("#test_bar_chart_" + tempKey)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .style("background-color", "tan")
        .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");

      // color stuff
      let color = d3.scaleOrdinal()
        .domain(testSet)
        .range(['#e41a1c','#377eb8','#4daf4a']);

      // x - axis
      let xStuff = d3.scaleBand()
        .range([0, width])
        .domain(testSet)
        .padding(0.2);

      svg.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(xStuff));

      // y - axis
      //.domain([0, d3.max(dataStackTest, (d) => d[1])])
      let yStuff = d3.scaleLinear()
        .domain([0, d3.max(tempData, (d) => d.entry.testValue)])
        .range([height, 0]);

      svg.append('g')
        .call(d3.axisLeft(yStuff));

      // svg.append("g")
      //   .data(dataStackTest)
      //   .enter()
      //   .append("g")
      //     .attr("fill", d => {return color(d.key)})
      //     .selectAll("rect")
      //     .data(d => { return d })
      //   .enter()
      //   .append("rect").merge(svg)
      //   .style("stroke", "gray")
      //   .style("fill", "black")
      //   .attr("x", (d, t, s, a) => {
      //     window.console.log('x stuff', d);
      //     return xStuff(d.key);
      //   })
      //   .attr("y", (d, t, s) => {
      //     //window.console.log('y0 stuff', d.y0);
      //     window.console.log('y stuff', d);
      //     //return yStuff(d.entry.testKey);
      //     return yStuff(d[1]);
      //   })
      //   .attr('height', (d) => {
      //     return yStuff(d[0]) - yStuff(d[1]);
      //     //return height - yStuff(d[1]);
      //   })
      //   .attr('width', xStuff.bandwidth())
      //   .on("mouseover", function(){d3.select(this).style("fill", "red");})
      //   .on("mouseout", function(){d3.select(this).style("fill", "black");});

/* -------------------------------------this one works-------------------*/

      svg.selectAll("rect")
        .data(tempData).enter()
        .append("g")
        .append("rect").merge(svg)
        .style("stroke", "gray")
        .attr("fill", (d) => { return color(d.entry.testKey) })
        .attr("x", (d, t, s, a) => {
          //window.console.log('x stuff', d);
          return xStuff(d.entry.testKey);
        })
        .attr("y", (d, t, s) => {
          // window.console.log('y stuff 0', yStuff(d.entry.proportion[0][0]));
          // window.console.log('y stuff 1', yStuff(d.entry.proportion[1][1]));
          return yStuff(d.entry.testValue);
          //return yStuff(d.entry.proportion[0][0]);
        })
        .attr('height', (d) => {
          return height - yStuff(d.entry.testValue);
        })
        .attr('width', xStuff.bandwidth())


      // let rectTest = svg.selectAll("g").data(tempData);
      //
      // rectTest.selectAll("rect").data(d => {
      //   window.console.log('d stuff', d);
      //   return d;
      // }).enter().append("rect").merge(svg);
      //
      // rectTest.style("stroke", "gray")
      // .attr("fill", (d) => { return color(d.entry.testKey) })
      // .attr("x", (d, t, s, a) => {
      //   window.console.log('x stuff', d);
      //   return xStuff(d.entry.testKey);
      // })
      // .attr("y", (d, t, s) => {
      //   window.console.log('y stuff', d);
      //   let tempClassKeys = [... depColSet];
      //   // window.console.log('y stuff 0', yStuff(d.entry.proportion[0][0]));
      //   // window.console.log('y stuff 1', yStuff(d.entry.proportion[1][1]));
      //   //return yStuff(d.entry.testKey);
      //   tempClassKeys.pop()
      //   return yStuff(d.entry.proportion[0][tempClassKeys.pop()]);
      // })
      // .attr('height', (d) => {
      //   let tempClassKeys = [... depColSet];
      //   return yStuff(d.entry.proportion[1][1]) - yStuff(d.entry.proportion[0][0]) ;
      // })
      // .attr('width', xStuff.bandwidth())

     }
  }

  render() {
    const { dataPreview, valByRowObj, tempKey } = this.props;
    return (
      <div>
        <div id={"test_bar_chart_" + tempKey}>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({

});

export { BarChart };
export default connect(mapStateToProps, {})(BarChart);
