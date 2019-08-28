// https://github.com/plotly/react-plotly.js/issues/115
// make a stubbed function/setup file for jest, trying to test plotly with jest
// does not work without this
window.URL.createObjectURL = function() {};
