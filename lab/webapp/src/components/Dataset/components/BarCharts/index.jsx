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
    const { dataPreview, valByRowObj, tempKey, keys } = this.props;
    let margin = { top: 10, right: 30, bottom: 50, left: 70 },
        width = 460 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    let chartInnerHTML = "";
    //let valByRowObj = this.getDataValByRow();
    if(document.getElementById("test_bar_chart_" + tempKey)) {
      chartInnerHTML = document.getElementById("test_bar_chart_" + tempKey).innerHTML;
    };



    var data = [
      { year: "2006", redDelicious: "10", mcintosh: "15", oranges: "9", pears: "6" },
      { year: "2007", redDelicious: "12", mcintosh: "18", oranges: "9", pears: "4" }
    ];

    // var datatest = d3.stack()(["redDelicious", "mcintosh", "oranges", "pears"].map(function(fruit) {
    //   return data.map(function(d) {
    //     return {y: +d[fruit]};
    //   });
    // }));

    var datatest = d3.stack().keys(keys)(dataPreview.data);

    window.console.log('data stuff', datatest);

    if(chartInnerHTML === "") {
      width = 460 - margin.left - margin.right;
      let data_sorted = valByRowObj[tempKey].sort(d3.ascending);

      let classCountObj = {};
      let tempData = [];

      data_sorted.forEach(val => {
        classCountObj[val] = classCountObj[val] ? ++classCountObj[val] : 1;
      })
      //tempData.push(classCountObj);
      let testSet = [... new Set(valByRowObj[tempKey])];

      testSet.forEach(tempKey => tempData.push({
        entry: {
          testKey: tempKey,
          testValue: classCountObj[tempKey]
        }
      }));

      let svg = d3.select("#test_bar_chart_" + tempKey)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .style("background-color", "blue")
        .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");

      // x - axis
      let xStuff = d3.scaleBand()
        .range([0, width])
        .domain(testSet)
        .padding(0.2);

      svg.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(xStuff));

      // y - axis
      let yStuff = d3.scaleLinear()
        .domain([0, d3.max(tempData, (d) => d.entry.testValue)])
        .range([height, 0]);

      svg.append('g')
        .call(d3.axisLeft(yStuff));

      svg.selectAll("rect")
        .data(tempData).enter()
        .append("rect").merge(svg)
        .style("stroke", "gray")
        .style("fill", "black")
        .attr("x", (d, t, s, a) => {
          //window.console.log('x stuff', d);
          return xStuff(d.entry.testKey);
        })
        .attr("y", (d, t, s) => {
          window.console.log('y0 stuff', d.y0);
          window.console.log('y stuff', d);
          //return yStuff(d.entry.testKey);
          return yStuff(d.entry.testValue);
        })
        .attr('height', (d) => {
          return height - yStuff(d.entry.testValue);
        })
        .attr('width', xStuff.bandwidth())
        .on("mouseover", function(){d3.select(this).style("fill", "red");})
        .on("mouseout", function(){d3.select(this).style("fill", "black");});
    }
  }

  render() {
    const { dataPreview, valByRowObj, tempKey } = this.props;
    return (
      <div>
        <Header>
          Bar_Chart
        </Header>
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
