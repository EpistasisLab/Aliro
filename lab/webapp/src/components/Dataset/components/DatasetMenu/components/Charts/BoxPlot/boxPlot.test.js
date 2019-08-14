import BoxPlot from './';
import { createBoxPlotStatsTest } from './';
import * as bananaSet from './bananaJson.json';
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

//let fileReader = new FileReader();
configure({ adapter: new Adapter() });


// mock out stuff fileupload depends on
//jest.mock('../SceneHeader', () => 'Scene_Header');

describe('basic testing of boxplot react component', () => {
  let store = mockStore(initialState);
  let testBoxPlot;
  let tree;
  let bananaData;

  // basic bookkeeping before/after each test; mount/unmount component, should be
  // similar to how piece will actually work in browser
  beforeEach(() => {
    testBoxPlot = mount(<BoxPlot store={store} testProp='hello' valByRowObj={{'test':[1,2]}} rawKey='test'/>);
  })
  afterEach(() => {
    testBoxPlot.unmount();
  })

  // test for existence
  it('create mock fileupload component, test for existence', () => {
    //const testFileUpload = shallow(<FileUpload store={store} testProp='hello' />);
    testBoxPlot.setProps({ name: 'bar' });
    //let tree = component.toJSON();
    expect(testBoxPlot.name()).toEqual('Connect(BoxPlot)');
    expect(testBoxPlot.props().testProp).toEqual('hello');
    expect(testBoxPlot.props().name).toEqual('bar');
    // let tempValByRowObj = {
    //   'testData': [1,2,3,4,5,4,3,2,1]
    // };
  })

  // check statistics
  it(`parse banana test set and check values of statistics for boxplot: \n
  q1,q3,median,min,max,min_val_in_data,max_val_in_data`, () => {
    // based specifically on banana dataset - https://www.openml.org/d/1460
    // values generated with python pandas; in this case min/max are potentially different

    /*
    let min = q1 - (1.5 * interQuantileRange);
    let max = q3 + (1.5 * interQuantileRange);
    let min_val_in_data = Math.min(...data_sorted);
    let max_val_in_data = Math.max(...data_sorted);

    min < min_val_in_data ? min = minData : null;
    max > max_val_in_data ? max = maxData : null;
    */

    const groundTruth = {
      At1: {
        q1: -0.75325,
        q3: 0.7820,
        median: -0.01525,
        min: -3.056125,
        max: 2.81, // 3.0848750000000003 with formula: q3 + (1.5 * interQuantileRange)
        min_val_in_data: -3.09,
        max_val_in_data: 2.81
      },
      At2: {
        q1: -0.91400,
        q3: 0.8225,
        median: -0.03720,
        min: -2.39, // -3.5187500000000003 with formula: q1 - (1.5 * interQuantileRange)
        max: 3.19, // 3.42725
        min_val_in_data: -2.39,
        max_val_in_data: 3.19
      },
      class: {
        q1: -1,
        q3: 1,
        median: -1,
        min: -1,
        max: 1,
        min_val_in_data: -1,
        max_val_in_data: 1
      }
    }
    // expect an object in return
    let statObj_At1 = createBoxPlotStatsTest(bananaSet.default, 'At1');
    let statObj_At2 = createBoxPlotStatsTest(bananaSet.default, 'At2');
    let statObj_class = createBoxPlotStatsTest(bananaSet.default, 'class');

    expect(statObj_At1).toEqual(groundTruth.At1);
    expect(statObj_At2).toEqual(groundTruth.At2);
    expect(statObj_class).toEqual(groundTruth.class);
    //console.log('statObj_At1', statObj_At1);
    //console.log('bananaSet', bananaSet);
  })

})
