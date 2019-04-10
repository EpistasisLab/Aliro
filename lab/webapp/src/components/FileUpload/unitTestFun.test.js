
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


describe('try testing react component', () => {
  let store = mockStore(initialState);
  let testFileUpload;

  beforeEach(() => {
    testFileUpload = mount(<FileUpload store={store} testProp="hello" />);
  })

  it('create mock fileupload component', () => {
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

  /*it('click file upload button', () => {
    //expect(testFileUpload.html()).toEqual("foo");
    //testFileUpload.find('input').toEqual("foo");

    expect(testFileUpload.find('#upload_dataset_file_browser_button')).toEqual("foo");
    //testFileUpload.find("input").simulate("click");
    // testFileUpload.find('#upload_dataset_file_browser_button').simulate("change", {
    //   target: {
    //     files: [ 'iris.csv' ]
    //   }
    // });
  })*/


})

// https://jestjs.io/docs/en/tutorial-async
// jest mock is not working, not returning promise, must be improperly configured and/or
// not setup correctly

//import uploadDataset from '../../data/datasets/dataset/api';
// cheating and just importing fake apiHelper directly - probably not recommended
import { uploadFile } from '../../utils/__mocks__/apiHelper';
describe('mock network request', () => {
  //jest.mock('../../utils/apiHelper');
  let fakeDataset = {
    name: 'stuff'
  };
  it('testing promise', () => {
    expect.assertions(1);
    //return uploadDataset(fakeDataset).then(data => expect(data.name).toEqual('iris.csv'));
    return uploadFile('fakeurl').then(data => expect(data.name).toEqual('iris.csv'));
  })
})

// go through basic file upload flow - select file & info, upload file
// cover two scenarios - upload success and failure

//
describe('basic file upload flow', () => {

  let store = mockStore(initialState);
  let testFileUpload;

  beforeEach(() => {
    // https://github.com/airbnb/enzyme/issues/1002
    testFileUpload = shallow(<FileUpload store={store} />).dive();
    // having some trouble using mount, updating state, & checking for expected UI changes
    //testFileUpload = mount(<FileUpload store={store} />);
  })

  it('test successful file upload with react state', () => {
    // fake user submission by entering info directly into component state
    let fileName = 'iris.csv';
    let testFile = {
      name: fileName
    };
    let depCol = 'class';
    let catFeatures = '';
    let ordFeatures = {};
    let formBody = testFileUpload.find('#file-upload-form-input-area');

    // check for CSS style which hides form
    expect(formBody.hasClass('file-upload-form-hide-inputs')).toEqual(true);

    // essentially fake user input
    testFileUpload.setState({
      selectedFile: testFile,
      dependentCol: depCol,
      catFeatures: catFeatures,
      ordinalFeatures: ordFeatures
    });
    //expect(testFileUpload.state('selectedFile')).toBeDefined();
    //expect(testFileUpload.state('selectedFile').name).toEqual('iris.csv');
    // force rerender - component is wrapped in redux stuff (Provider), don't think it will rerender
    //testFileUpload.update();

    // not sure but must be getting new copy of enzyme/react node with expected CSS class after state changes
    formBody = testFileUpload.find('#file-upload-form-input-area');

    // user info is entered in form, check if form input area is visible
    // look for css styling to display form
    expect(formBody.hasClass('file-upload-form-show-inputs')).toEqual(true);
  })

})
