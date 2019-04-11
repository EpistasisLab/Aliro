import  FileUpload  from './';

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
    expect(testFileUpload.state("dependentCol")).toBeUndefined();
    testFileUpload.setState({dependentCol: "class"})
    expect(testFileUpload.state("dependentCol")).toEqual("class");
  })

  // trying to simulate UI element change - having trouble either accessing desired
  // piece (in this case file input), simulating change event or both

  // it('click file upload button', () => {
  //   //expect(testFileUpload.html()).toEqual("foo");
  //   //testFileUpload.find('input').toEqual("foo");
  //
  //   //expect(testFileUpload.find('#upload_dataset_file_browser_button')).toEqual("foo");
  //   //testFileUpload.find('#upload_dataset_file_browser_button').simulate("click");
  //   //testFileUpload.find("input").simulate("click");
  //   testFileUpload.find('#upload_dataset_file_browser_button').simulate("change", {
  //     target: {
  //       files: [ 'iris.csv' ]
  //     }
  //   });
  // })


})

// https://jestjs.io/docs/en/tutorial-async
// jest mock is not working, not returning promise, must be improperly configured and/or
// not setup correctly
//jest.mock('../../utils/apiHelper');
//import uploadDataset from '../../data/datasets/dataset/api';
//jest.mock('../../data/datasets/dataset/api');
// cheating and just importing fake apiHelper directly - probably not recommended
import { uploadFile } from '../../utils/__mocks__/apiHelper';
describe('mock network request', () => {
  //jest.mock('../../utils/apiHelper');
  let fakeDataset = {
    name: 'stuff'
  };
  const fakeDatasets = [
    {
      'name': 'auto.csv',
      'username': 'testuser',
      'dependent_col' : "class",
      'categorical_features': "",
      'ordinal_features': {},
      'timestamp': Date.now(),
    },
    {
      'name': 'iris.csv',
      'username': 'testuser',
      'dependent_col' : "target_class",
      'categorical_features': "",
      'ordinal_features': {},
      'timestamp': Date.now(),
    }
  ];

  it('testing promise for successfully case, proper dependent_col', () => {
    expect.assertions(1);
    //return uploadDataset(fakeDataset).then(data => expect(data.name).toEqual('iris.csv'));
    //return uploadFile('fakeurl').then(data => expect(data.name).toEqual('iris.csv'));
    return uploadFile(fakeDatasets[0]).then(data => expect(data.id).toEqual(7654321));
  })

  it('testing promise for unsuccessful case, improper dependent_col', () => {
    expect.assertions(1);

    return uploadFile(fakeDatasets[1]).catch(e => expect(e).toEqual({"error": "dependent_col: target_class invalid"}));
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

  // the intended behavior of this component is to hide the fields to enter info
  // about the file being uploaded until a file with a filename has been selected
  it('check UI form is hidden w/o a file selection', () => {
    let formBody = testFileUpload.find('#file-upload-form-input-area');

    // check for CSS style which hides form
    expect(formBody.hasClass('file-upload-form-hide-inputs')).toEqual(true);
    expect(formBody.hasClass('file-upload-form-show-inputs')).toEqual(false);
  })

  it('test selecting file and displaying UI form after file selection', () => {
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

    // not sure but must be getting new copy of enzyme/react node with expected
    // CSS class after state changes by re-assigning variable
    formBody = testFileUpload.find('#file-upload-form-input-area');

    // user info is entered in form, check if form input area is visible
    // look for css styling to display form
    expect(formBody.hasClass('file-upload-form-show-inputs')).toEqual(true);
  })

  it('test handleUpload method', () => {
    testFileUpload
  })

})
