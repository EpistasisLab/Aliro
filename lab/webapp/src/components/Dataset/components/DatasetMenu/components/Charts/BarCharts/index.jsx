import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Header } from 'semantic-ui-react';
import * as d3 from "d3";
import Plot from 'react-plotly.js';

class BarCharts extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };

    this.createStackedData = this.createStackedData.bind(this);
    this.createBarGraph = this.createBarGraph.bind(this);
    // upper limit/max number of unique values for making chart
    this.chartCutoff = 40;
  }

  componentDidMount() {
    this.createBarGraph();
  }

  createStackedData() {
    const { depCol, dataPreview, valByRowObj, colKey, } = this.props;
    let givenColSet = [... new Set(valByRowObj[colKey])];
    let depColSet = [... new Set(valByRowObj[depCol])].sort();
    let columnValueObj = {}; // key: unique value in dataset given colKey, val: list of all depCol values for given colKey
    let proportionObj = {}; // key: unique value in dataset given colKey, val: # of values per unique value in depCol
    let proportionObjList = [];
    let plotlyData = [];

    // for every entry in depColSet, map keys to color
    let colorObj = {};
    depColSet.forEach((depVal, i) => {
      let colorString;
      if(i < 12) {
        colorString = d3.schemePaired[i];
      } else {
        let normI = i / depColSet.length; // normalize index
        colorString = d3.interpolateSinebow(normI);
      }
      colorObj[depVal] = colorString;
    })
    // in order to create a stacked bar chart need proportion of data per categorical
    // feature for count of each dependent column value

    // First step is to consolidate values of a given categorical feature:
    // for every unique value of given colKey in dataset, collect all matches
    // by looping over entire dataset and keep track of dependent column
    // values for each given categorical feature
    givenColSet.forEach(tKey => {
      columnValueObj[tKey] = [];
      dataPreview.data.forEach(entry => {
        if(entry[colKey] === tKey) {
          columnValueObj[tKey].push(entry[depCol])
        }
      })
    });

    // Next step is to calculate proportion of depedent column values:
    // unqiue counts of each class occurance per value in given column name/key
    // results in list of objects -
    // ex: [ {0: 21, 1: 6, cat: "a"}, {0: 22, 1: 5, cat: "b"} ... ]
    // for this example depCol is 'target_class' which can be '0' or '1'
    // and colKey is 'cat' which can be 'a', 'b' ...
    Object.entries(columnValueObj).forEach((entry, index) => {
      // entry[0] is column key - entry[1] is list of all values for column key
      proportionObj[entry[0]] = []; // init obj key with empty list
      let tempObj = {};
      depColSet.forEach(depVal => {
        tempObj[colKey] = entry[0];
        // calculate count of depedent column for given column key
        // use array filter to create temp list and use that list's length
        let tempLen = entry[1].filter(x => {
          let parsedX = parseFloat(x);
          if(!isNaN(parsedX)) {
            return parsedX === depVal;
          } else {
            return x === depVal;
          }
        }).length;
        //proportionObj[entry[0]].push({[depVal]: tempLen})
        tempObj[depVal] = tempLen;
        proportionObj[entry[0]].push(tempLen);
      })
      proportionObjList.push(tempObj);
    })

    depColSet.forEach((depVal, i) => {
      // plotly stuff - based on stacked bar chart example from here
      // https://plot.ly/javascript/bar-charts/
      let yData = [];
      proportionObjList.forEach(tEntry => yData.push(tEntry[depVal]));
      plotlyData.push({
        name: depVal,
        type: 'bar',
        x: givenColSet,
        y: yData,
        marker: {
          color: colorObj[depVal]
        }
      })
    })
    //window.console.log('plotlyData', plotlyData);

    return plotlyData;

  }

  // adapted from https://bl.ocks.org/d3noob/bdf28027e0ce70bd132edc64f1dd7ea4
  // and also using https://www.d3-graph-gallery.com/graph/barplot_stacked_basicWide.html
  // as examples
  createBarGraph(){
    const { depCol, dataPreview, valByRowObj, colKey, cleanKey } = this.props;
    let margin = { top: 10, right: 65, bottom: 50, left: 35 },
        width = 600 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;

    let chartInnerHTML = "";
    // check DOM to see if graphic already exists
    if(document.getElementById("stacked_bar_charts_" + cleanKey)) {
      chartInnerHTML = document.getElementById("stacked_bar_charts_" + cleanKey).innerHTML;
    };
    // only attempt to create graphic once
    if(chartInnerHTML === "") {
      // need to do a bit of processing

      let columnValueObj = {}; // key: unique value in dataset given colKey, val: list of all depCol values for given colKey
      let proportionObj = {}; // key: unique value in dataset given colKey, val: # of values per unique value in depCol
      let proportionObjList = [];
      // find unique values for the given column key as well as dependent column
      let givenColSet = [... new Set(valByRowObj[colKey])];
      let depColSet = [... new Set(valByRowObj[depCol])].sort();

      let plotlyData = [];
      /**---- *************** ----**** ---- Color stuff here ----****---- ***/
      // for every entry in depColSet, map keys to color
      let colorObjList = [];
      depColSet.forEach((depVal, i) => {
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
      /**---- *************** ----****---- *************** ----****---- ***/

      // if number of unique values for given chart exceeds cutoff value
      if(givenColSet.length > this.chartCutoff) {
        this.setState({chartCutoff: true});
        return;
      }

      // in order to create a stacked bar chart need proportion of data per categorical
      // feature for count of each dependent column value

      // First step is to consolidate values of a given categorical feature:
      // for every unique value of given colKey in dataset, collect all matches
      // by looping over entire dataset and keep track of dependent column
      // values for each given categorical feature
      givenColSet.forEach(tKey => {
        columnValueObj[tKey] = [];
        dataPreview.data.forEach(entry => {
          if(entry[colKey] === tKey) {
            columnValueObj[tKey].push(entry[depCol])
          }
        })
      });

      // Next step is to calculate proportion of depedent column values:
      // unqiue counts of each class occurance per value in given column name/key
      // results in list of objects -
      // ex: [ {0: 21, 1: 6, cat: "a"}, {0: 22, 1: 5, cat: "b"} ... ]
      // for this example depCol is 'target_class' which can be '0' or '1'
      // and colKey is 'cat' which can be 'a', 'b' ...
      Object.entries(columnValueObj).forEach((entry, index) => {
        // entry[0] is column key - entry[1] is list of all values for column key
        proportionObj[entry[0]] = []; // init obj key with empty list
        let tempObj = {};
        depColSet.forEach(depVal => {
          tempObj[colKey] = entry[0];
          // calculate count of depedent column for given column key
          // use array filter to create temp list and use that list's length
          let tempLen = entry[1].filter(x => {
            let parsedX = parseFloat(x);
            if(!isNaN(parsedX)) {
              return parsedX === depVal;
            } else {
              return x === depVal;
            }
          }).length;
          //proportionObj[entry[0]].push({[depVal]: tempLen})
          tempObj[depVal] = tempLen;
          proportionObj[entry[0]].push(tempLen);
        })
        proportionObjList.push(tempObj);
      })
      // proportionObjList is used with d3 stack (almost like python zip) to
      // to map depCol values to categorical features

      // Transpose the data into layers
      let stack = d3.stack()
        .keys(depColSet)
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetNone);
      let stackThing = stack(proportionObjList);
      let stackColorThing = stack(colorObjList);

      // x - axis
      let xStuff = d3.scaleBand()
        .range([0, width])
        .domain(givenColSet)
        .padding(0.2);

      // stacked stuff - svg elem using stacked data (background/setup for chart)
      let stackedSvg = d3.select("#stacked_bar_charts_" + cleanKey)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      stackedSvg.append('g')
        .attr('transform', `translate(0, ${height})`)
        .style("color", "white")
        .call(d3.axisBottom(xStuff))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end")
        .on("mouseover", () => { xAxisTooltip.style("display", null); }) // tooltip - hover over bars and display value
        .on("mouseout", function() {
          window.setTimeout(() => xAxisTooltip.style("display", "none"), 3500);
         })
        .on("mousemove", function(d, t, s, a) {
          let xPosition = 0;
          let yPosition = 0;
          xAxisTooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
          xAxisTooltip.select("text").text('x-axis: ' + d);
        });

      // y-axis
      let stackedY = d3.scaleLinear()
        .domain([0, d3.max(stackThing, (d) => {
          return d3.max(d, (d) => {
            return d[1];
          });
        })])
        .range([height, 0]);

      stackedSvg.append('g')
        .style("color", "white")
        .call(d3.axisLeft(stackedY));

      //window.console.log('colorobjlist', colorObjList);
      let groups = stackedSvg.selectAll("g.stack")
        .data(stackThing)
        .enter().append("g")
        .style("fill", (d, i) => {
          let colorString = colorObjList[d.index][d.key];
          return colorString;
        });

      let stackRect = groups.selectAll("rect")
        .data((d) => {
          return d;
        })
        .enter()
        .append("rect")
        .attr("x", (d, t, s, a) => {
          return xStuff(d.data[colKey]);
        })
        .attr("y", (d, t, s) => {
          return stackedY(d[1]);
        })
        .attr('height', (d) => {
          let y0 = stackedY(d[0]);
          let y1 = stackedY(d[1]);
          return y0 - y1;
        })
        .attr('width', xStuff.bandwidth())
        .on("mouseover", () => { tooltip.style("display", null); }) // tooltip - hover over bars and display value
        .on("mouseout", function() {
          window.setTimeout(() => tooltip.style("display", "none"), 3500);
         })
        .on("mousemove", function(d, t, s, a) {
          let xPosition = d3.mouse(this)[0] - 15;
          let yPosition = d3.mouse(this)[1] - 25;
          tooltip.attr("transform", "translate(" + xPosition + "," + yPosition + ")");
          tooltip.select("text").text(d[1] - d[0]);
        });

        // legend
        let legend = stackedSvg.selectAll(".legend")
          .data(stackColorThing)
          .enter().append("g")
          .attr("transform", function(d, i) {
            //let legendWidth = width + margin.right;
            // hardcoding width here for chart legend position
            let legendWidth = 555;
            return "translate(" + legendWidth + "," + (-(i * 19) - margin.bottom) + ")";
          });

        legend.append("rect")
          .attr("x", -margin.left - 15)
          .attr("y", height)
          .attr("width", 18)
          .attr("height", 18)
          .style("fill", function(d, i) {
            let color = d[d.index];
            return color.data[d.key];
          });

        legend.append("text")
          .attr("x", -margin.left + 5)
          .attr("y", height + 9)
          .attr("dy", ".35em")
          .style("text-anchor", "start")
          .style("fill", "white")
          .text(function(d, i) {
            return d.key;
          });

        // tooltip elem to display on mouseover
        let tooltip = stackedSvg.append("g")
          .attr("class", "tooltip")
          .style("display", "none");

        tooltip.append("rect")
          .attr("width", 35)
          .attr("height", 20)
          .attr("fill", "white")
          .style("opacity", 0.5);

        tooltip.append("text")
          .attr("x", 15)
          .attr("dy", "1.2em")
          .style("text-anchor", "middle")
          .attr("font-size", "12px")
          .attr("font-weight", "bold");

        // tooltip elem to display x axis labels
        let xAxisTooltip = stackedSvg.append("g")
          .attr("class", "tooltip")
          .style("display", "none");

        xAxisTooltip.append("rect")
          .attr("width", width)
          .attr("height", 20)
          .attr("fill", "black")
          .style("opacity", 0.75);

        xAxisTooltip.append("text")
          .attr("x", 15)
          .attr("dy", "1.2em")
          .style("text-anchor", "start")
          .attr("font-size", "12px")
          .attr("font-weight", "bold")
          .style("fill", "white");
     }
  }

  render() {
    const { dataPreview, valByRowObj, colKey, cleanKey } = this.props;
    const { chartCutoff } = this.state;
    let testData = this.createStackedData();

    // layout obj for plotly
    const plotLayout = {
      barmode: 'stack',
      font: {
        family: 'Courier New, monospace',
        size: 1,
        color: 'white'
      },
      xaxis: {
        tickangle: 'auto',
        tickfont: {
         family: 'Oswald, sans-serif',
         size: 9,
         color: 'white'
        }
      },
      yaxis: {
        zerolinecolor: 'white',
        tickangle: 'auto',
        tickfont: {
         family: 'Oswald, sans-serif',
         size: 9,
         color: 'white'
        }
      },
      width: 500,
      height: 375,
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      legend: {
        x: 1,
        y: 1,
        traceorder: 'normal',
        font: {
          family: 'sans-serif',
          size: 9,
          color: 'white'
        }
      }
    };

    // config for plotly
    const optBtnsToRemove = [
      'toImage',
      'sendDataToCloud'
    ];
    const plotConfig = {
      displaylogo: false,
      modeBarButtonsToRemove: optBtnsToRemove
    };

    return (
      <div>
        <div id={"stacked_bar_charts_" + cleanKey} />
        {chartCutoff ? (<p>Too many value to plot</p>) : null}
        <Plot
          style={{position:'relative', left:'-50px'}}
          data={testData}
          layout={plotLayout}
          config={plotConfig}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({

});

export { BarCharts };
export default connect(mapStateToProps, {})(BarCharts);
