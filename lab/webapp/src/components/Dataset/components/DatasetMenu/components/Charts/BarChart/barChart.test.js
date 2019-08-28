import BarChart from './';
// try getting react pieces and framework for test rendering
import React from 'react';
import Papa from 'papaparse';

import renderer from 'react-test-renderer';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

const middlewares = [thunk];
const initialState = {};
const mockStore = configureStore(middlewares);

import { shallow, mount, render, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-15';
// trying to use jest & plotly needs a stub function/special configuration (in package.json)
// https://github.com/plotly/react-plotly.js/issues/115
//window.URL.createObjectURL = function() {};
configure({ adapter: new Adapter() });

describe('basic testing of BarChart react component', () => {
  let store = mockStore(initialState);
  let testBarChart;

  beforeEach(() => {
    testBarChart = mount(<BarChart store={store} depCol='test' valByRowObj={{'test':[1,2]}} rawKey='test'/>);
  })
  afterEach(() => {
    testBarChart.unmount();
  })

  // test for existence
  it('create mock BarChart component, test for existence', () => {
    testBarChart.setProps({ name: 'bar' });
    expect(testBarChart.name()).toEqual('Connect(BarChart)');
    expect(testBarChart.props().depCol).toEqual('test');
    expect(testBarChart.props().name).toEqual('bar');
    expect(testBarChart.props().valByRowObj).toEqual({'test':[1,2]});
  })

  // it('template test', () => {
  //   let testPlotlyChart = testBarChart.find('#bar_chart_test');
  //   console.log('testPlotlyChart : ', testPlotlyChart);
  //   expect(true).toEqual(true);
  // })

})
