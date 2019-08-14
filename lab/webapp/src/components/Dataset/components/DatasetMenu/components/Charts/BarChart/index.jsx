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

  // adapted from https://bl.ocks.org/d3noob/bdf28027e0ce70bd132edc64f1dd7ea4
  createBarGraph(){
    const { dataPreview, valByRowObj, depCol, cleanKey } = this.props;
    let margin = { top: 10, right: 30, bottom: 20, left: 40 },
        width = 400 - margin.left - margin.right,
        height = 200 - margin.top - margin.bottom;

    let chartInnerHTML = "";
    //let valByRowObj = this.getDataValByRow();
    if(document.getElementById("test_bar_chart_" + depCol)) {
      chartInnerHTML = document.getElementById("test_bar_chart_" + depCol).innerHTML;
    };

    if(chartInnerHTML === "") {
      width = 460 - margin.left - margin.right;
      let data_sorted = valByRowObj[depCol].sort(d3.ascending);

      let classCountObj = {};
      let chartData = [];

      data_sorted.forEach(val => {
        classCountObj[val] = classCountObj[val] ? ++classCountObj[val] : 1;
      })
      //chartData.push(classCountObj);
      let testSet = [... new Set(valByRowObj[depCol])].sort();

      /**---- *************** ----**** ---- Color stuff here ----****---- *************** ----**/
      // for every entry in testSet, map keys to color
      let colorObjList = [];
      testSet.forEach((depVal, i) => {
        // use https://github.com/d3/d3-scale-chromatic#schemePaired for 12 colors
        // to select unique color per class in dataset
        let colorString;
        if(i < 12) {
          colorString = d3.schemePaired[i];
        } else {
          // if more than 12 classes in dataset use sequential color range
          // https://github.com/d3/d3-scale-chromatic#sequential-multi-hue

          // given num between 0 & 1 get color value
          let normI = i / depColSet.length; // normalize index
          colorString = d3.interpolateSinebow(normI);
        }
        colorObjList.push({[depVal]: colorString});
      })
      //window.console.log('colorobjlist', colorObjList);
      /**---- *************** ----****---- *************** ----****---- *************** ----**/


      testSet.forEach(tKey => chartData.push({
        entry: {
          testKey: tKey,
          testValue: classCountObj[tKey]
        }
      }));

      let svg = d3.select("#test_bar_chart_" + cleanKey)
        .append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");

      // x - axis
      let xStuff = d3.scaleBand()
        .range([0, width])
        .domain(testSet)
        .padding(0.2);

      // y - axis
      let yStuff = d3.scaleLinear()
        .domain([0, d3.max(chartData, (d) => d.entry.testValue)])
        .range([height, 0]);

      svg.append('g')
        .style("color", "white")
        .call(d3.axisLeft(yStuff));

      svg.selectAll("rect")
        .data(chartData).enter()
        .append("rect").merge(svg)
        .style("stroke", "gray")
        .style("fill", (d, i) => {
          //window.console.log('colorobjlist', d);
          let colorString = colorObjList[i][d.entry.testKey];
          return colorString;
        })
        .attr("x", (d, t, s, a) => {
          //window.console.log('x stuff', d);
          return xStuff(d.entry.testKey);
        })
        .attr("y", (d, t, s) => {
          //window.console.log('y stuff', d);
          //return yStuff(d.entry.testKey);
          return yStuff(d.entry.testValue);
        })
        .attr('height', (d) => {
          return height - yStuff(d.entry.testValue);
        })
        .attr('width', xStuff.bandwidth())
        .on("mouseover", () => { tooltip.style("display", null); }) // tooltip functions
        .on("mouseout", function() {
          window.setTimeout(() => tooltip.style("display", "none"), 3500);
         })
        .on("mousemove", function(d) {
          let xPosition = d3.mouse(this)[0] - 15;
          let yPosition = d3.mouse(this)[1] - 25; //+ stackedY(d[1] - d[0])
          tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
          tooltip.select("text").text(d.entry.testValue);
          //window.setTimeout(() => tooltip.style("display", "none"), 2500);
        });


      // append x axis after making bars so axis line is above bars
      svg.append('g')
        .attr('transform', `translate(0, ${height})`)
        .style("color", "white")
        .call(d3.axisBottom(xStuff));

      // tooltip element
      let tooltip = svg.append("g")
        .attr("class", "tooltip")
        .style("display", "none");

      tooltip.append("rect")
        .attr("width", 30)
        .attr("height", 20)
        .attr("fill", "white")
        .style("opacity", 0.5);

      tooltip.append("text")
        .attr("x", 15)
        .attr("dy", "1.2em")
        .style("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("font-weight", "bold");
    }
  }

  render() {
    const { cleanKey } = this.props;
    return (
      <div id={"test_bar_chart_" + cleanKey} style={{position:'relative', left:'-60px'}}/>
    );
  }
}

const mapStateToProps = (state) => ({

});

export { BarChart };
export default connect(mapStateToProps, {})(BarChart);
