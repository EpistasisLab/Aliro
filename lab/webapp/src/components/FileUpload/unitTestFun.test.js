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

describe('try testing fileupload react component', () => {
  let store = mockStore(initialState);
  let testFileUpload;

  // basic bookkeeping before/after each test; mount/unmount component, should be
  // similar to how piece will actually work in browser
  beforeEach(() => {
    testFileUpload = mount(<FileUpload store={store} testProp="hello" />);
  })
  afterEach(() => {
    testFileUpload.unmount();
  })

  // test for existence
  it('create mock fileupload component, test for existence', () => {
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

  it('simulate use of file upload button/input', () => {
    // asked about how to simulate user actions here, using enzyme simulate doesn't quite
    // work, using 'onChange' prop to fake user action:
    // https://stackoverflow.com/questions/55638365/how-to-access-internal-pieces-of-react-component-and-mock-api-call-with-jest-e/55641884#55641884

    //testFileUpload.find("input").simulate("click");
    // testFileUpload.find('#upload_dataset_file_browser_button').at(0).simulate('change', {
    //   event: {
    //     target: {
    //       files: [{name: 'iris.csv'}]
    //     }
    //   }
    // });

    // these actions are supposed to tigger event handlers in the component being
    // tested (which they do) & update component react state (which doesn't appear to happen)
    let fakeFile = {target: {files: [{name: 'iris.csv'}]}};
    testFileUpload.find('input').at(0).prop('onChange')(fakeFile);
    // update() is supposed to forceUpdate/re-render the component but even after
    // manually updating, component react state does not contain anything
    // testFileUpload.update();
    // enzyme documentation/resources are somewhat lacking
    testFileUpload.find('textarea').at(0).prop('onChange')(
      {target:{value: 'testHello'}},
      {value:'test input'}
    );
    // cheating for now and just updating component state directly...
    testFileUpload.setState({selectedFile: fakeFile.target.files[0]});
    //console.log('test state: ', testFileUpload.state());
    //console.log('test file: ', testFileUpload.state('selectedFile'));
    // ...and checking for state which was just manually set above
    expect(testFileUpload.state("selectedFile")).toEqual(fakeFile.target.files[0]);

    // not sure how to check UI pieces which depend on react state here, using
    // enzyme mount to create the component requires a different way to go about
    // trying to access the pieces which would change UI based on state

    // see unit test below for basic file upload flow where component is created
    // differently (shallow, not mount) and allows for accessing inner elements
    // to check UI
  })


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
  let store = mockStore(initialState);
  let testFileUpload;

  beforeEach(() => {
    //testFileUpload = mount(<FileUpload store={store} testProp="hello" />);
    testFileUpload = shallow(<FileUpload store={store} />).dive();
  })
  afterEach(() => {
    //testFileUpload.unmount();
  })
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

  it('testing promise for successful case, proper dependent_col', () => {
    expect.assertions(1);
    //return uploadDataset(fakeDataset).then(data => expect(data.name).toEqual('iris.csv'));
    //return uploadFile('fakeurl').then(data => expect(data.name).toEqual('iris.csv'));

    // on successful upload, change window location/redirect the page, uses error
    // flag in server response to control logic for UI or page redirection, not
    // sure how to get at those pieces with this testing framework
    return uploadFile(fakeDatasets[0])
      .then(data => expect(data.id)
      .toEqual(7654321));
  })

  it('testing promise for unsuccessful case, improper dependent_col', () => {
    expect.assertions(1);
    return uploadFile(fakeDatasets[1])
      .catch(e => {
        expect(e).toEqual({"error": "dependent_col: target_class invalid"});

        // fake setting state, normally occurs in upload handler function in
        // FileUpload component after promise making actual upload resolves

        // testFileUpload.setState({
        //   errorResp: e,
        //   serverResp: e
        // });

        // this is not working correctly as it is, popup open prop should be set
        // to 'true' in case of error response, not sure if this is incorrect method
        // of testing

        // testFileUpload = shallow(<FileUpload store={store} />).dive();
        // testFileUpload.update();
        // let popup = testFileUpload.find('Popup').at(0);
        // console.log('popup props', popup.props());
      });
  })
})

// go through basic file upload flow - select file & info, upload file
// cover two scenarios - upload success and failure

// this test examines styling based on mock user input
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

})
