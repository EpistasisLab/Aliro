import BarCharts from './';
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

describe('basic testing of BarCharts react component', () => {
  let store = mockStore(initialState);
  let testBarCharts;

  beforeEach(() => {
    testBarCharts = mount(<BarCharts store={store} depCol='test' valByRowObj={{'test':[1,2]}} rawKey='test'/>);
  })
  afterEach(() => {
    testBarCharts.unmount();
  })

  // test for existence
  it('create mock BarCharts component, test for existence', () => {
    testBarCharts.setProps({ name: 'bar' });
    expect(testBarCharts.name()).toEqual('Connect(BarCharts)');
    expect(testBarCharts.props().depCol).toEqual('test');
    expect(testBarCharts.props().name).toEqual('bar');
    expect(testBarCharts.props().valByRowObj).toEqual({'test':[1,2]});
  })


})
