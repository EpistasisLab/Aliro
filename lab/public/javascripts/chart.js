self.addEventListener("message", function(e) {
  // Add window
  window = self;
  // Import c3
  importScripts("/bower_components/c3/c3.min.js");
  // Get chart data  
  var chart = e.data.chart;
  // Render chart
  self.postMessage(c3.generate(chart)); // Send chart back
  self.close(); // Terminate
}, false);
