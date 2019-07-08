import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Header } from 'semantic-ui-react';
import * as d3 from "d3";

class BoxPlot extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  this.createBoxPlot = this.createBoxPlot.bind(this);
  }

  componentDidMount() {
    this.createBoxPlot();
  }

  componentDidUpdate(prevProps, prevState) {
    //this.createBarGraph();
  }

  // from - https://www.d3-graph-gallery.com/graph/boxplot_basic.html
  createBoxPlot(){
    const { dataPreview, valByRowObj, tempKey } = this.props;
    let margin = { top: 5, right: 180, bottom: 25, left: 150 },
        width = 850 - margin.left - margin.right,
        height = 255 - margin.top - margin.bottom;
    //let valByRowObj = this.getDataValByRow();
    let dataKeys;
    if(dataPreview) {
      let dataStuff = dataPreview.data;
      // grab dataset columns names from first entry
      dataKeys = Object.keys(dataStuff[0]);
    }

    let svg = d3.select("#test_box_plot_" + tempKey)
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .style("background-color", "aliceblue")
    .append("g")
      .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
    // get stats
    let data_sorted = valByRowObj[tempKey].sort(d3.ascending);
    let q1 = d3.quantile(data_sorted, .25);
    let median = d3.quantile(data_sorted, .5);
    let q3 = d3.quantile(data_sorted, .75);
    let interQuantileRange = q3 - q1;
    let min = q1 - 1.5 * interQuantileRange;
    let max = q1 + 1.5 * interQuantileRange;

    let minData = Math.min(...data_sorted);
    let maxData = Math.max(...data_sorted);

    /*
    * -------------------- BOX PLOT --------------------
    */
    // TODO: learn min/max in boxplots & verify validity
    //min = minData;
    //max = maxData;
    /*
    * -------------------- BOX PLOT --------------------
    */

    // color scale
    let myColor = d3.scaleSequential()
      .interpolator(d3.interpolateInferno)
      .domain([min, max]);

    // Y scale
    let y = d3.scaleBand()
      .range([height, 0])
      .domain([tempKey])
      .paddingInner(1)
      .paddingOuter(.5)
    svg.append("g")
      .call(d3.axisLeft(y).tickSize(0))
      .select(".domain").remove()
    // X scale
    let x = d3.scaleLinear()
      .domain([min, max])
      .range([0, width]);
    svg.append("g").call(d3.axisBottom(x))
       .attr("transform", "translate(0," + (height) + ")");
    // box features
    let center = 150;
    width = 100;
    // main vertical line
    svg.append("line")
      .attr("y1", center)
      .attr("y2", center)
      .attr("x1", x(min) )
      .attr("x2", x(max) )
      .attr("stroke", "black");

    // Show the box
    svg.append("rect")
      .attr("x", x(q1))
      .attr("y", center - width/2 )
      .attr("height",  width)
      .attr("width", (x(q3)-x(q1)) )
      .attr("stroke", "black")
      .style("fill", "#69b3a2")
      //.on("mouseover", function(){d3.select(this).style("fill", "yellow");})
      //.on("mouseout", function(){d3.select(this).style("fill", "#69b3a2");});

    // show median, min and max horizontal lines
    svg.selectAll("toto")
    .data([min, median, max])
    .enter()
    .append("line")
      .attr("y1", center-width/2)
      .attr("y2", center+width/2)
      .attr("x1", function(d){ return(x(d))} )
      .attr("x2", function(d){ return(x(d))} )
      .attr("stroke", "black");

    // tool tip
    let tooltip = d3.select("#test_box_plot_" + tempKey)
    .append("div")
      .style("opacity", 0)
      .style("font-size", "16px");

    let mouseover = function(d) {
      tooltip
        .transition()
        .duration(200)
        .style("opacity", 1)
      tooltip
        .html(`<span style='color:white'>data: ${d}</span>`)
        .style("left", (d3.mouse(this)[0]+30) + "px")
        .style("top", (d3.mouse(this)[1]+30) + "px")
    }
    let mouseleave = function(d) {
      tooltip
        .transition()
        .duration(200)
        .style("opacity", 0)
    }
    //window.console.log('sorted data for', tempKey);
    window.console.log(data_sorted);
    // points with jitter
    let jitterWidth = 50;
    svg.selectAll("indPoints")
      .data(data_sorted)
      .enter()
      .append("circle")
        .attr("cy", function(d){
          //window.console.log('y data', d);
          return(center - jitterWidth/2 + Math.random()*jitterWidth)
        })
        .attr("cx", function(d){
          //window.console.log('x data', d);
          return(x(d))
        })
        .attr("r", 3)
        .style("fill", function(d){ return(myColor(d)) })
        .attr("stroke", "black")
        .on("mouseover", mouseover)
        .on("mouseleave", mouseleave)
  }

  render() {
    const { dataPreview, valByRowObj, tempKey } = this.props;
    return (
      <div>
        <Header style={{color: "aliceblue"}}>
          Box_Plot with Jitter for: {tempKey}
        </Header>
        <div id={"test_box_plot_" + tempKey}>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({

});

export { BoxPlot };
export default connect(mapStateToProps, {})(BoxPlot);
