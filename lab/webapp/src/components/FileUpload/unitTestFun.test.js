
import { apiReq } from './apiTestHelper';
import  FileUpload  from './';
// get action stuff
import * as actionStuff from '../../data/datasets/dataset/actions';
// try getting react pieces
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

describe('testing how some UI action affects redux action stuff', () => {
  it('updateAI', () => {
    const testDatasetID = '1234321';
    const testState = {
      nextAIState: 'toggled'
    };
    const expectedAction = {
      type: actionStuff.AI_UPDATE,
      id: testDatasetID,
      nextAIState: testState
    };
    expect(actionStuff.updateAI(testDatasetID, testState))
      .toEqual(expectedAction);
  })

  it('updateDataset', () => {
    const testDataset = {
      id: 'da_data',
      info: {
        experiment: 'pass',
        result: [3,4,5]
      }
    };
    const expectedAction = {
      type: actionStuff.DATASET_UPDATE,
      dataset: testDataset
    };
    expect(actionStuff.updateDataset(testDataset))
      .toEqual(expectedAction);
  })

})


describe('try creating react component', () => {
  let store = mockStore(initialState);
  let testFileUpload;
  beforeEach(() => {
    testFileUpload = mount(<FileUpload store={store} testProp="hello" />);
  })

  it('create mock fileupload', () => {
    //const testFileUpload = shallow(<FileUpload store={store} testProp="hello" />);
    testFileUpload.setProps({ name: 'bar' });
    //let tree = component.toJSON();
    expect(testFileUpload.name()).toEqual("Connect(FileUpload)");
    expect(testFileUpload.props().testProp).toEqual("hello");
    expect(testFileUpload.props().name).toEqual("bar");
  })

  it('change component state', () => {
    expect(testFileUpload.props().name).toBeUndefined();
    testFileUpload.setState({dependentCol: "class"})
    expect(testFileUpload.state("dependentCol")).toEqual("class");
  })

  it('click file upload button', () => {
    //expect(testFileUpload.html()).toEqual("foo");
    //testFileUpload.find('input').toEqual("foo");
    //testFileUpload.find("input").simulate("click");

  })

})
