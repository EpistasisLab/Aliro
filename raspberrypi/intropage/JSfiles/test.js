function decisiontree() {

    d3=d3v3
  
    
    var label_names;
  
    var TOTAL_SIZE;
    // default_colors = [
    //   "#c25975", "#d26bff", "#2d5a47", "#093868", "#fcdfe6", "#94a2fa", "#faec94", "#decaee", "#daeeca", "#b54c0a", "#dc1818", "#18dcdc", "#000000", "#340000", "#86194c", "#fef65b", "#ff9b6f", "#491b47", "#171717", "#e8efec", "#1c6047", "#a2bae0", "#4978c3", "#f8fee0", "#dcfb66", "#91fb66", "#29663b", "#b4b7be", "#0088b2", "#88b200", "#c43210", "#f06848", "#f0bc48", "#d293a2", "#cccccc", "#59596a", "#fafae6", "#ffc125", "#ff4e50", "#f0e6fa", "#f6c1c3", "#363636"
    // ]
  
  
  
    default_colors = [
      "#74BFA1", "#E37852", "#2d5a47", "#093868", "#fcdfe6", "#94a2fa", "#faec94", "#decaee", "#daeeca", "#b54c0a", "#dc1818", "#18dcdc", "#000000", "#340000", "#86194c", "#fef65b", "#ff9b6f", "#491b47", "#171717", "#e8efec", "#1c6047", "#a2bae0", "#4978c3", "#f8fee0", "#dcfb66", "#91fb66", "#29663b", "#b4b7be", "#0088b2", "#88b200", "#c43210", "#f06848", "#f0bc48", "#d293a2", "#cccccc", "#59596a", "#fafae6", "#ffc125", "#ff4e50", "#f0e6fa", "#f6c1c3", "#363636"
    ]
  
  
  
    // default_colors = [
    //   "#18dcdc", "#d26bff", "#2d5a47", "#093868", "#fcdfe6", "#94a2fa", "#faec94", "#decaee", "#daeeca", "#b54c0a", "#dc1818", "#c25975", "#000000", "#340000", "#86194c", "#fef65b", "#ff9b6f", "#491b47", "#171717", "#e8efec", "#1c6047", "#a2bae0", "#4978c3", "#f8fee0", "#dcfb66", "#91fb66", "#29663b", "#b4b7be", "#0088b2", "#88b200", "#c43210", "#f06848", "#f0bc48", "#d293a2", "#cccccc", "#59596a", "#fafae6", "#ffc125", "#ff4e50", "#f0e6fa", "#f6c1c3", "#363636"
    // ]
  
    // differnt combination of colors
    // default_colors =
      
  
  
  
    //************************************* Options******************************************************//
  
    // var file_name = "structureC1.json" // generator_1
    // var file_namev2 = "structureC2_origin.json" // generator_2
  
    var file_name = "structure_iris_dc_1.json" // generator_1
    var file_namev2 = "structure_iris_dc_1.json" // generator_2
  
    // var file_name = "structure_iris_dc_1_80_size.json" // generator_1
    // var file_namev2 = "structure_iris_dc_1_80_size.json" // generator_2
    
    // var file_name = "structure.json" // generator_1
    // var file_namev2 = "structure.json" // generator_2
    var version2 = true // if true json from generator_2 will be used
  
  
    var tree_branch = false // if the thickness of the branches depend on the value of targt + color * /
    var tree_branch_parent = true //  true: thickness from the root if not the direct parent
    // var tree_branch_color = "black"
  
    var tree_branch_color = "#A3A6A8"
    var strokeness = 120 //  the degree of separation between the nodes 
    var default_strokeness = 50
    var hover_percent_parent = false // if the display percentage depends on the direct parent or the root
    var square = false
    var rect_percent = true //display the percentage or the value in the small rectangles of the labels 
    var value_percent_top = true /// if we display the value and the percentage above the rectangle /
  
    var dict_leaf_y = { 1: 0, 2: -17.5, 3: -35, 4: -52.5, 5: -70, 6: -87.5, 6: -105, 7: -122.5, 8: -140, 9: -157.5, 10: -175 }
  
  
    /****************************************************************************************************** */
  
  
  
  
    getDepth = function (obj) {
      var depth = 0;
      if (obj.children) {
        obj.children.forEach(function (d) {
          var tmpDepth = getDepth(d)
          if (tmpDepth > depth) {
            depth = tmpDepth
          }
        })
      }
      return 1 + depth
    }
  
  
    // var margin = { top: 20, right: 120, bottom: 20, left: 180 },
    //   width = 2000 + 960 - margin.right - margin.left,
    //   height = 800 - margin.top - margin.bottom;
  
    // current
    // var margin = { top: 30, right: 30, bottom: 30, left: 0 },
    //   width = 500 - margin.left - margin.right,
    //   height = 350 * 600 / 500 - margin.top - margin.bottom;
  
    
    var margin = { top: 30, right: 30, bottom: 30, left: 0 },
      width = 700 - margin.left - margin.right,
      height = 350 * 600 / 500 - margin.top - margin.bottom;
  
    var i = 0,
      duration = 550,
      root;
  
    var tree
    var diagonal
    var svg
  
    var filetochoose = version2 ? file_namev2 : file_name
  
    d3.json(filetochoose, function (error, flare) {
      if (error) throw error;
  
      console.log(getDepth(flare))
  
  
      tree = d3.layout.tree()
        .separation(function (a, b) { return ((a.parent == root) && (b.parent == root)) ? strokeness : strokeness; })
        .size([height, getDepth(flare) * width / 8]);
  
      diagonal = d3.svg.diagonal()
        .projection(function (d) { return [d.y, d.x]; });
  
      // svg = d3.select("body").append("svg")
      //   .attr("width", getDepth(flare) * width / 8 + margin.right + margin.left)
      //   .attr("height", height + margin.top + margin.bottom)
      //   .append("g")
      //   .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
  
  
  
  
      svg = d3.select("#dataviz_area_div")
        .append("svg")
        .attr("id", "dataviz_area_div_svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        // .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        // .attr("viewBox", `-25 -15 400 250`)
        // .attr("viewBox", `-30 -30 500 400`)  
        // current
        // .attr("viewBox", `-90 -30 500 400`)
        // .attr("viewBox", `-90 -30 600 800`)  
          // .attr("viewBox", `-90 -30 600 500`)  
          .attr("viewBox", `30 -80 600 600`)  
          
  
  
      TOTAL_SIZE = flare.size
      l = flare.pred.replace(/of/g, "").split(', ')
      for (var j = 0; j < l.length; j++) {
        l[j] = l[j].split(' ')[2]
      }
      label_names = l
  
  
      root = flare;
      root.x0 = height / 2;
      root.y0 = 0;
  
      function collapse(d) {
        if (d.children) {
          d._children = d.children;
          d._children.forEach(collapse);
          d.children = null;
        }
      }
  
      root.children.forEach(collapse);
      update(root, l.length);
      // createLabels(l);
    });
  
    d3.select(self.frameElement).style("height", "480px");
  
    function update(source, n_labels) {
  
  
      // Compute the new tree layout.
      var nodes = tree.nodes(root).reverse(),
        links = tree.links(nodes);
      tpaths = tree.links(nodes);
  
      // Normalize for fixed-depth.
      nodes.forEach(function (d) { d.y = d.depth * 180; });
  
      // Update the nodes…
      var node = svg.selectAll("g.node")
        .data(nodes, function (d) { return d.id || (d.id = ++i); });
  
      // Enter any new nodes at the parent's previous position.
      var nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", function (d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
        .on("click", click);
  
      nodeEnter.append("circle")
        .attr("r", 1e-6)
        .style("fill", function (d) {
  
          return d._children ? "lightsteelblue" : "#fff";
        });
  
        // nodeEnter.append("text")
        //     .attr("x", function(d) { return (d.children || d._children) || version2 ? -10 : 10; })
        //     .attr("dy", ".35em")
        //     .attr("text-anchor", function(d) { return (d.children || d._children) || version2 ? "end" : "start"; })
        //     .text(function(d) { return d.pred ? d.name+' '+d.pred : d.name; })
        //     .style("fill-opacity", 1e-6);
  
      function getTextWidth(text, fontSize, fontFace) {
        var a = document.createElement('canvas');
        var b = a.getContext('2d');
        b.font = fontSize + 'px ' + fontFace;
        return b.measureText(text).width;
      }
  
  
  
      var rect = nodeEnter.append("rect")
        .attr("width", 133 + 8)
        .attr("height", 70)
        .attr("x", -80)
        .attr("y", -80)
        .attr("rx", 6)
        .attr("ry", 6)
        .style("fill", function (d) { return (d.children || d._children) || version2 ? "#f0f0f0" : "#ffffff" })
        .style("stroke", function (d) { return (d.children || d._children) || version2 ? "rgb(155, 155, 155)" : "#ffffff" })
        .style("visibility", function (d) { return (d.children || d._children) || version2 ? "visible" : "hidden" })
  
      nodeEnter.append("svg:image")
        .attr("xlink:href", function (d) { return ((d.children || d._children) || version2) && d.type == 'categorical' ? 'http://fractalytics.io/wp-content/uploads/2019/05/cat.png' : 'http://fractalytics.io/wp-content/uploads/2019/05/num.png' })
        .attr("x", "-76")
        .attr("y", "-74")
        .attr("width", "20")
        .attr("height", "20")
        .style("visibility", function (d) {
          if (d.name.match(/(.*?)(<|>|=|!=|<=|>=|=<|=>)/i)) {
            return d.name.match(/(.*?)(<|>|=|!=|<=|>=|=<|=>)/i)[1] == 'Root ' ? 'hidden' : 'visible'
          }
          else return (d.children || d._children) || version2 ? "visible" : "hidden"
        });
  
      nodeEnter.append("text")
        .attr("x", function (d) {
          ttr = 13
          if (default_colors.length > 5) {
            ttr = (40 * default_colors.length) / 2
          }
          return (d.children || d._children) || version2 ? -75 - ((getTextWidth(d.size + " / " + (d.size * 100 / TOTAL_SIZE).toFixed(0) + "%", 10, 'Verdana') + 5.7) - (133 + 8)) / 2 : ttr
        })
        .attr("y", function (d) {
          ttr = dict_leaf_y[label_names.length] - 15
          if (default_colors.length > 5) {
            ttr = -20
          }
          return (d.children || d._children) || version2 ? -87 : ttr;
  
        })
        .attr("dy", ".35em")
        .attr("text-anchor", "start")
        .style("font-size", "10px")
        .style("font-family", "Verdana")
        .style("stroke", "#c2c2c2")
        .style("stroke-width", "0.05em")
        .text(function (d) { return true ? d.size + " / " + (d.size * 100 / TOTAL_SIZE).toFixed(0) + "%" : ""; })
        .attr('visibility', function () {
          return value_percent_top ? 'visible' : 'hidden'
        })
  
  
  
  
      nodeEnter.append("text")
        .attr("x", function (d) {
          if (((d.children || d._children) || version2) && d.name.match(/(.*?)(<|>|=|!=|<=|>=|=<|=>)/i)[1].length <= 11) {
            return (d.children || d._children) || version2 ? -75 - ((getTextWidth(d.name.match(/(.*?)(<|>|=|!=|<=|>=|=<|=>)/i)[1], 14, 'Verdana') + 5.7) - (133 + 8)) / 2 : 0
          }
          else return (d.children || d._children) || version2 ? -75 - ((getTextWidth(d.name.match(/(.*?)(<|>|=|!=|<=|>=|=<|=>)/i)[1].substring(0, 11), 14, 'Verdana') + 5.7) - (133 + 8)) / 2 : 0
        })
        .attr("y", function (d) {
          if (!d.name.match(/(.*?)(<|>|=|!=|<=|>=|=<|=>)/i)) return -65
          else return d.name.match(/(.*?)(<|>|=|!=|<=|>=|=<|=>)/i)[1] == 'Root ' ? -55 : -65
        })
        .attr("dy", ".35em")
        .attr("text-anchor", "start")
        .style("font-size", "14px")
        .style("font-family", "Verdana")
        .style("stroke", "black")
        .style("stroke-width", "0.05em")
  
        .text(function (d) {
          if ((d.children || d._children) || version2) {
            return d.name.match(/(.*?)(<|>|=|!=|<=|>=|=<|=>)/i)[1].length <= 15 ? d.name.match(/(.*?)(<|>|=|!=|<=|>=|=<|=>)/i)[1] : (d.name.match(/(.*?)(<|>|=|!=|<=|>=|=<|=>)/i)[1]).substring(0, 13) + '..'
  
          }
          else return "";
        })
        .append('svg:title')
        .text(function (d) {
          return (d.children || d._children) || version2 ? d.name.match(/(.*?)(<|>|=|!=|<=|>=|=<|=>)/i)[1] : ""
        })
  
  
  
  
      nodeEnter.append("text")
        .attr("x", function (d) { return (d.children || d._children) || version2 ? -75 - ((getTextWidth(d.name.replace(d.name.match(/(.*?)(<|>|=|!=|<=|>=|=<|=>)/i)[1], '').replace('=', ''), 14, 'Verdana') + 5.7) - (133 + 8)) / 2 : 0 })
        .attr("y", -45)
        .attr("dy", ".35em")
        .attr("text-anchor", "start")
        .style("font-size", "12px")
        .style("font-family", "Verdana")
        .style("stroke", "black")
        .style("stroke-width", "0.04em")
        .text(function (d) {
  
          var toreturn = (d.children || d._children) || version2 ? d.name.replace(d.name.match(/(.*?)(<|>|=|!=|<=|>=|=<|=>)/i)[1], '').replace('!=', 'not').replace(/=|\!=/g, '').replace('<', '<=') : "";
          if (!d.name.match(/(.*?)(<|>|=|!=|<=|>=|=<|=>)/i)) return toreturn
          return d.name.match(/(.*?)(<|>|=|!=|<=|>=|=<|=>)/i)[1] == 'Root ' ? '' : toreturn
        })
  
  
      var labels_w = 133 / n_labels
      for (var j = 0; j < n_labels; j++) {
        var curr = j
  
  
  
        nodeEnter.append("rect")
          .attr("width", function (d) {
            var v;
            if (d.pred) {
              console.log(parseInt(d.pred.split(",")[curr].match(/\d+/)[0]), ' *133/', d.size)
              v = parseInt(d.pred.split(",")[curr].match(/\d+/)[0]) * 133 / d.size;
            }
            else if (!d.children) {
              v = 40
            }
  
            if (square) return (d.children || d._children) || version2 ? 133 / label_names.length - 4 : 40
            else return (d.children || d._children) || version2 ? v : 40
          })
          .attr("height", 20)
          .attr('rx', function (d) { return square ? 0 : 4 })
          .attr('ry', function (d) { return square ? 0 : 4 })
          .attr("x", function (d) {
  
            var v;
            var ttl = 0
            if (curr > 0) {
  
              for (var l = 0; l <= curr - 1; l++) {
                if (d.pred) {
                  v = parseInt(d.pred.split(",")[l].match(/\d+/)[0]);
                }
                else if (!d.children) v = parseInt(d.name.split(",")[l].match(/\d+/)[0]);
                ttl = ttl + v * 133 / d.size
              }
  
            } else {
              ttl = 0
            }
  
            ttr = 13
            if (default_colors.length > 5) {
              ttr = 10 + j * 45
            }
  
  
            if (square) return (d.children || d._children) || version2 ? -76 + j * (133 / label_names.length) : ttr
            else return (d.children || d._children) || version2 ? -76 + ttl : ttr
          })
          .attr("y", (function (d) {
            console.log(default_colors.length)
            if (default_colors.length > 5) {
              return (d.children || d._children) || version2 ? -34 : -10
            } else return (d.children || d._children) || version2 ? -34 : dict_leaf_y[label_names.length] - 4 + 20 * j + j * 4;
          }))
          .style("fill", function (d) {
            if (default_colors.length == 0) {
              return default_colors[j]
            } else {
              return default_colors[j]
            }
  
          }
          )
          .attr('visibility', function (d) {
  
            if (d.pred) {
              v = parseInt(d.pred.split(",")[curr].match(/\d+/)[0]);
            }
            else if (!d.children) v = parseInt(d.name.split(",")[curr].match(/\d+/)[0]);
            v = v * 133 / d.size
            return v != 0 || !d.children ? "visible" : "hidden"
          })
          .attr('opacity', function (d) {
            var val
            if (d.pred) {
              // console.log(d.pred.split(",")[curr].match(/\d+/)[0])
              val = (parseInt(d.pred.split(",")[curr].match(/\d+/)[0]) * 100 / d.size).toFixed(0)
            }
            else if (!d.children) val = (parseInt(d.name.split(",")[curr].match(/\d+/)[0]) * 100 / d.size).toFixed(0)
            return (d.children || d._children) || version2 ? 1 : val / 100 + 0.3
  
          })
          .append("svg:title")
          .text(function (d) {
            if (d.pred) {
              // console.log(d.pred.split(",")[curr].match(/\d+/)[0])
              return !rect_percent ? d.pred.split(",")[curr].match(/\d+/)[0] : (parseInt(d.pred.split(",")[curr].match(/\d+/)[0]) * 100 / d.size).toFixed(0) + "%"
            }
            else if (!d.children) return !rect_percent ? d.name.split(",")[curr].match(/\d+/)[0] : (parseInt(d.name.split(",")[curr].match(/\d+/)[0]) * 100 / d.size).toFixed(0) + "%"
  
          })
  
  
  
  
  
        var subg = nodeEnter.append("g")
          .attr("width", labels_w)
          .attr("height", 20)
          .attr("x", function (d) {
            var v;
            var ttl = 0
            if (curr > 0) {
  
              for (var l = 0; l <= curr - 1; l++) {
                if (d.pred) {
                  v = parseInt(d.pred.split(",")[l].match(/\d+/)[0]);
                }
                else if (!d.children) v = parseInt(d.name.split(",")[l].match(/\d+/)[0]);
                ttl = ttl + v * 133 / d.size
              }
  
            } else {
              ttl = 0
            }
  
            return -80 + ttl
  
          })
          .attr("y", -30)
  
  
        subg.append("text")
          .text(function (d) {
            if (d.pred) {
              // console.log(d.pred.split(",")[curr].match(/\d+/)[0])
              return !rect_percent ? d.pred.split(",")[curr].match(/\d+/)[0] : (parseInt(d.pred.split(",")[curr].match(/\d+/)[0]) * 100 / d.size).toFixed(0) + "%"
            }
            else if (!d.children) return !rect_percent ? d.name.split(",")[curr].match(/\d+/)[0] : (parseInt(d.name.split(",")[curr].match(/\d+/)[0]) * 100 / d.size).toFixed(0) + "%"
  
          })
          .attr("x", (function (d) {
  
            var v;
            var ttl = 0
            if (curr > 0) {
  
              for (var l = 0; l <= curr - 1; l++) {
                if (d.pred) {
                  v = parseInt(d.pred.split(",")[l].match(/\d+/)[0]);
                }
                else if (!d.children) v = parseInt(d.name.split(",")[l].match(/\d+/)[0]);
                ttl = ttl + v * 133 / d.size
              }
  
            } else {
              ttl = 0
            }
  
            ttr = 18
            if (default_colors.length > 5) {
              ttr = 14 + j * 45
            }
  
            if (square) return (d.children || d._children) || version2 ? -71 + j * (133 / label_names.length) : ttr
            else return (d.children || d._children) || version2 ? -71 + ttl : ttr
          }))
          .attr("y", (function (d) {
            ttr = dict_leaf_y[label_names.length] + 10 + 20 * j + j * 4
            if (default_colors.length > 5) {
              ttr = 5
            }
  
            return (d.children || d._children) || version2 ? -19 : ttr;
  
          }))
          .style("fill", "white")
          .style("font-size", "12px")
          .attr('visibility', function (d) {
            if (d.pred && !square) {
              // console.log(d.pred.split(",")[curr].match(/\d+/)[0])
              return (parseInt(d.pred.split(",")[curr].match(/\d+/)[0]) * 100 / d.size).toFixed(0) > 20 ? "vivible" : "hidden"
            }
          })
          .append("svg:title")
          .text(function (d) {
            if (d.pred) {
              // console.log(d.pred.split(",")[curr].match(/\d+/)[0])
              return !rect_percent ? d.pred.split(",")[curr].match(/\d+/)[0] : (parseInt(d.pred.split(",")[curr].match(/\d+/)[0]) * 100 / d.size).toFixed(0) + "%"
            }
            else if (!d.children) return !rect_percent ? d.name.split(",")[curr].match(/\d+/)[0] : (parseInt(d.name.split(",")[curr].match(/\d+/)[0]) * 100 / d.size).toFixed(0) + "%"
  
          })
  
        subg.append('text')
          .text(function (d) {
            if (d.pred) {
              return ''
            }
            else if (!d.children) {
              return label_names[curr]
            }
          })
          .attr("x", (function (d) {
            ttr = 60
            if (default_colors.length > 5) {
              ttr = 18 + j * 45
            }
            return (d.children || d._children) || version2 ? -66 + j * labels_w : ttr
          }))
          .attr("y", (function (d) {
            ttr = dict_leaf_y[label_names.length] + 10 + 20 * j + j * 4
            if (default_colors.length > 5) {
              ttr = 25
            }
            return (d.children || d._children) || version2 ? -15 : ttr;
          }))
          .style("font-size", "14px")
          .style("fill", "rgb(78, 74, 74)")
          .attr('transform', function (d) {
  
            return default_colors.length <= 5 ? '' : 'translate(' + (-30 + j * 20) + ',' + (10 + j * (-37)) + ') rotate(55 50 50)'
          })
  
  
  
      }
  
  
  
      //   nodeEnter.append("text")
      //   .attr("x", function(d) { return (d.children || d._children) || version2 ? -10 : 10; })
      //   .attr("dy", ".35em")
      //   .attr("text-anchor", function(d) { return (d.children || d._children) || version2 ? "end" : "start"; })
      //   .text(function(d) { return d.pred ? d.pred : ''; })
      //   .style("fill-opacity", 1e-6)
  
  
  
      // Transition nodes to their new position.
      var nodeUpdate = node.transition()
        .duration(duration)
        .attr("transform", function (d) { return "translate(" + d.y + "," + d.x + ")"; });
  
      nodeUpdate.select("circle")
        .attr("r", 10)
        .style("fill", function (d) { return d._children ? "lightsteelblue" : "#fff"; });
  
      nodeUpdate.select("text")
        .style("fill-opacity", 1);
  
      // Transition exiting nodes to the parent's new position.
      var nodeExit = node.exit().transition()
        .duration(duration)
        .attr("transform", function (d) { return "translate(" + source.y + "," + source.x + ")"; })
        .remove();
  
      nodeExit.select("circle")
        .attr("r", 1e-6);
  
      nodeExit.select("text")
        .style("fill-opacity", 1e-6);
  
      // Update the links…
      var link = svg.selectAll("path.link")
        .data(links, function (d) { return d.target.id; });
  
  
      if (tree_branch) var link_stoke_scale = d3.scale.linear().domain([0, 100]).range([1.5, default_strokeness]);
      else var link_stoke_scale = d3.scale.linear().domain([0, 100]).range([1.5, 8]);
  
      var color = d3.scale.linear()
        .domain([0, 50, 100])
        .range(["rgb(2, 255, 219)", "blue"]);
  
  
      // Enter any new links at the parent's previous position.
      link.enter().insert("path", "g")
        .attr("class", "link")
        .attr("id", function (d) { return d.target.id; })
        .attr("d", function (d) {
          var o = { x: source.x0, y: source.y0 };
          return diagonal({ source: o, target: o });
        })
        .style("stroke-width", function (d) {
  
          if (!d.target) {
            return link_stoke_scale(50)
          }
          else {
            if (tree_branch) {
              //   console.log(d.target.size,'*100/',TOTAL_SIZE,link_stoke_scale(d.target.size*100/TOTAL_SIZE),tree_branch_parent)
              //   console.log(d.target.size,'*100/',d.source.size,link_stoke_scale(d.target.size*100/d.source.size),tree_branch_parent)
  
              return tree_branch_parent ? link_stoke_scale(d.target.size * 100 / TOTAL_SIZE) : link_stoke_scale(d.target.size * 100 / d.source.size)
            } else {
  
              return link_stoke_scale(50)
            }
          }
        })
        .style("stroke", function (d) {
  
          if (!d.target) {
            return "#fff"
            // return "#A3A6A8"
          }
          else return tree_branch_color;
        })
        .append("svg:title")
        .text(function (d, i) {
          if (hover_percent_parent) {
            var val = ((d.target.size / TOTAL_SIZE) * 100).toFixed(2);
          } else {
            var val = ((d.target.size / d.source.size) * 100).toFixed(2);
          }
  
          return val + "%"
        })
  
      var tlink = svg.selectAll("text.tlink")
        .data(tpaths, function (d) { return d.target.id; });
  
      tlink.enter().insert("text", "g")
        .attr("class", "tlink")
        .attr("dy", function (d) { return d.target.side == "left" ? -10 : 15; })
        .append('textPath')
        .attr("xlink:href", function (d) { return '#' + d.target.id; }) //place the ID of the path here
        .style("text-anchor", "middle") //place the text halfway on the arc
        .attr("startOffset", "45%")
        .text(function (d) { return d.target.side == "left" ? "No" : "Yes"; })
        .attr('visibility', function (d) { return d.target.depth == 1 && !version2 ? 'visible' : 'hidden' })
        .attr("opacity", 0.5)
  
  
      tlink.exit().transition()
        .duration(duration)
        .attr("d", function (d) {
          var o = { x: source.x, y: source.y };
          return diagonal({ source: o, target: o });
        })
        .remove();
  
      // Transition links to their new position.
      link.transition()
        .duration(duration)
        .attr("d", diagonal)
        .style("stroke-width", function (d) {
  
          if (!d.target) {
            return link_stoke_scale(50)
          }
          else {
            if (tree_branch) {
              //   console.log(d.target.size,'*100/',TOTAL_SIZE,link_stoke_scale(d.target.size*100/TOTAL_SIZE),tree_branch_parent)
              //   console.log(d.target.size,'*100/',d.source.size,link_stoke_scale(d.target.size*100/d.source.size),tree_branch_parent)
  
              return tree_branch_parent ? link_stoke_scale(d.target.size * 100 / TOTAL_SIZE) : link_stoke_scale(d.target.size * 100 / d.source.size)
            } else {
  
              return link_stoke_scale(50)
            }
          }
        });
  
  
      // Transition exiting nodes to the parent's new position.
      link.exit().transition()
        .duration(duration)
        .attr("d", function (d) {
          var o = { x: source.x, y: source.y };
          return diagonal({ source: o, target: o });
        })
        .remove();
  
      // Stash the old positions for transition.
      nodes.forEach(function (d) {
        d.x0 = d.x;
        d.y0 = d.y;
      });
  
  
      // Toggle children on click.
      function click(d) {
        console.log(d)
        
        if (d.children) {
          d._children = d.children;
          d.children = null;
        } else {
          d.children = d._children;
          d._children = null;
        }
        update(d, n_labels);

      }
  
  
    }
  
  
  
  
    function createLabels(labels) {
  
  
      var Size = 400
  
  
      var svg1 = d3.select("body")
        .append("svg")
        .attr("width", Size)
        .attr("height", Size)
        .attr("class", "legends");
  
      console.log(labels.length)
      console.log(default_colors.slice(0, labels.length))
      default_colors = default_colors.slice(0, labels.length)
      if (default_colors.length == 2) default_colors.push('')
      if (default_colors.length == 0) {
        var c_l = default_colors
      } else {
        var c_l = default_colors
      }
  
      for (i = 0; i < c_l.length; i++) {
  
        console.log(labels[i], "", c_l[i])
  
        var legendG = svg1
          .append("g")
          .attr("transform", function (d) {
            return "translate(" + 0 + "," + (30 * i + Size / 33 + Size / 50) + ")"; // place each legend on the right and bump each one down 15 pixels
          })
          .attr("class", "legend");
  
        legendG.append("rect") // make a matching color rect
          .attr("width", 15)
          .attr("height", 15)
          .attr("fill", c_l[i])
          .style('visibility', function () {
            return labels[i] ? "visible" : "hidden"
          })
  
        legendG.append("text") // add the text
          .text(labels[i])
          .style("font-size", 30)
          .attr("y", 12)
          .attr("x", 21)
  
      }
  
    }
  }