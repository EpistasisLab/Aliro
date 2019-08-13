import BoxPlot from './';
//import SceneHeader from '../SceneHeader';
// try getting react pieces and framework for test rendering
import React from 'react';
import renderer from 'react-test-renderer';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import fetch from 'jest-fetch-mock';
import fetchMock from 'fetch-mock';

const middlewares = [thunk];
const initialState = {};
const mockStore = configureStore(middlewares);

import { shallow, mount, render, configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-15';
configure({ adapter: new Adapter() });


// mock out stuff fileupload depends on
//jest.mock('../SceneHeader', () => 'Scene_Header');

describe('basic testing of boxplot react component', () => {
  let store = mockStore(initialState);
  let testBoxPlot;
  let tree;

  // basic bookkeeping before/after each test; mount/unmount component, should be
  // similar to how piece will actually work in browser
  beforeEach(() => {
    testBoxPlot = mount(<BoxPlot store={store} testProp='hello' valByRowObj={{'test':[1,2]}} rawKey='test'/>);
    //tree = renderer.create(<FileUpload store={store} />).toJSON();
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
    // test snapshot
    //expect(tree).toMatchSnapshot();
  })


})
