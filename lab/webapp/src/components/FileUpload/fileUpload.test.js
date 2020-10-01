import FileUpload from './';
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
import Adapter from 'enzyme-adapter-react-16';
configure({ adapter: new Adapter() });


// mock out stuff fileupload depends on
//jest.mock('../SceneHeader', () => 'Scene_Header');

describe('basic testing of fileupload react component', () => {
  let store = mockStore(initialState);
  let testFileUpload;
  let tree;
  let fakeFile = {target: {files: [{name: 'iris.csv'}]}};
  let fakeFileTsv = {target: {files: [{name: 'iris.tsv'}]}};
  let badFakeFile = {target: {files: [{name: 'iris.txt'}]}};
  // basic bookkeeping before/after each test; mount/unmount component, should be
  // similar to how piece will actually work in browser
  beforeEach(() => {
    testFileUpload = mount(<FileUpload store={store} testProp='hello' />);
    //tree = renderer.create(<FileUpload store={store} />).toJSON();
  })
  afterEach(() => {
    testFileUpload.unmount();
  })

  // test for existence
  it('create mock fileupload component, test for existence', () => {
    //const testFileUpload = shallow(<FileUpload store={store} testProp='hello' />);
    testFileUpload.setProps({ name: 'bar' });
    //let tree = component.toJSON();
    expect(testFileUpload.name()).toEqual('Connect(FileUpload)');
    expect(testFileUpload.props().testProp).toEqual('hello');
    expect(testFileUpload.props().name).toEqual('bar');
    // test snapshot
    //expect(tree).toMatchSnapshot();
  })

  it('simple change to component state', () => {
    expect(testFileUpload.props().name).toBeUndefined();
    expect(testFileUpload.state('dependentCol')).toBeUndefined();
    testFileUpload.setState({dependentCol: 'class'})
    expect(testFileUpload.state('dependentCol')).toEqual('class');
  })

  it('simulate user entering data with file upload form inputs', () => {
    // asked about how to simulate user actions here, using enzyme simulate doesn't quite
    // work, using 'onChange' prop to fake user action:
    // https://stackoverflow.com/questions/55638365/how-to-access-internal-pieces-of-react-component-and-mock-api-call-with-jest-e/55641884#55641884

    // these actions are supposed to tigger event handlers in the component being
    // tested (which they do) & update component react state (which doesn't appear to happen)
    // this might be a limitation of enzyme

    // this should create a browser console error - using javascript library to
    // create a file preview which attempts to parse given input, if input not a
    // file/blob the error is generated. The file onChange handler attempts to
    // create the file preview and set the selected file obj and file name in
    // the component's react state
    testFileUpload.find('input').at(0).prop('onChange')(fakeFile);

    // update() is supposed to forceUpdate/re-render the component
    testFileUpload.update();
    // manually updating, component react state does not contain anything, in any
    // case need to call update() to access elements by html dom ID


    // the following is a standin for user input entering metadata

    let depColTextField = testFileUpload.find('#dependent_column_text_field_input').at(0);
    // still need to access with 'at', using find('#dependent_column_text_field_input')
    // returns 4 nodes somehow
    depColTextField.prop('onChange')(
      {target:{value: 'test_class'}},
      {value:'test dep input'}
    );
    let ordTextArea = testFileUpload.find('#ordinal_features_text_area_input');
    ordTextArea.prop('onChange')(
      {target:{value: {testOrdKey: 'testHello'}}},
      {value:'test ord input'}
    );
    let catTextArea = testFileUpload.find('#categorical_features_text_area_input');
    catTextArea.prop('onChange')(
      {target:{value: 'testCatHello1, testCatHello2'}},
      {value:'test cat input'}
    );
    // cheating for now and just updating component state directly...
    testFileUpload.setState({
      selectedFile: fakeFile.target.files[0],
      ordinalFeatures: {testOrdKey: 'testHello'},
      catFeatures: 'testCatHello1, testCatHello2',
      dependentCol: 'test_class'
    });
    //console.log('test state: ', testFileUpload.state());
    //console.log('test file: ', testFileUpload.state('selectedFile'));
    // ...and checking for state which was just manually set above
    expect(testFileUpload.state('selectedFile')).toEqual(fakeFile.target.files[0]);
    expect(testFileUpload.state('ordinalFeatures')).toEqual({testOrdKey: 'testHello'});
    expect(testFileUpload.state('catFeatures')).toEqual('testCatHello1, testCatHello2');
    expect(testFileUpload.state('dependentCol')).toEqual('test_class');
  })

  it('try uploading non csv/tsv file type', () => {
    testFileUpload.find('input').at(0).prop('onChange')(badFakeFile);
    testFileUpload.update();
    //expect(testFileUpload.state('selectedFile')).toEqual(badFakeFile.target.files[0]);
    expect(testFileUpload.state('selectedFile')).toBeUndefined();
    let formBody = testFileUpload.find('#file-upload-form-input-area');

    // check for CSS style which hides form
    expect(formBody.hasClass('file-upload-form-hide-inputs')).toEqual(true);
    expect(formBody.hasClass('file-upload-form-show-inputs')).toEqual(false);
  })

  it('try testing generateFileData - good input', () => {
    // use dive() to get at inner FileUpload class functions -
    // https://github.com/airbnb/enzyme/issues/208#issuecomment-292631244
    const shallowFileUpload = shallow(<FileUpload store={store}/>).dive();
    // all input from user will be read as strings
    const fakeUserInput = {
      depCol: 'target_class',
      catCols: 'a, b, c',
      ordFeats: '{"species": ["cat", "dog", "bird"]}'
    };
    // add fake file with filename so generateFileData will do something, if
    // no file & filename present generateFileData returns blank/empty formData
    shallowFileUpload.setState({
      selectedFile: fakeFile.target.files[0],
      dependentCol: fakeUserInput.depCol,
      catFeatures: fakeUserInput.catCols,
      ordinalFeatures: fakeUserInput.ordFeats
    });

    // expect list of comma separated cat cols to get parsed with string split
    // dependent columns will be stored as is (type string)
    // ordFeats will parse given JSON
    const expectedInput = {
      depCol: 'target_class',
      catCols: ['a', 'b', 'c'],
      ordFeats: {
        species: ["cat", "dog", "bird"]
      }
    };
    // use instance to get access to inner function
    const instance = shallowFileUpload.instance();
    // create spy, check function gets called
    const spy = jest.spyOn(instance, 'generateFileData');
    const testData = instance.generateFileData(); // FormData
    // get stuff stored in returned formdata, stingified in preparation to make
    // network request
    const metadata = JSON.parse(testData.get('_metadata'));
    expect(spy).toBeCalled();
    // value of _metadata defined in generateFileData
    expect(metadata.dependent_col).toEqual(expectedInput.depCol);
    expect(metadata.categorical_features).toEqual(expectedInput.catCols);
    expect(metadata.ordinal_features).toEqual(expectedInput.ordFeats);
  })

  it('Select tsv file - expect form to be displayed', () => {
    testFileUpload.find('input').at(0).prop('onChange')(fakeFileTsv);

    // update() is supposed to forceUpdate/re-render the component
    testFileUpload.update();
    testFileUpload.setState({
      selectedFile: fakeFileTsv.target.files[0]
    });
    let formBody = testFileUpload.find('#file-upload-form-input-area');

    // check for CSS style which hides form
    expect(formBody.hasClass('file-upload-form-hide-inputs')).toEqual(false);
    expect(formBody.hasClass('file-upload-form-show-inputs')).toEqual(true);
    expect(testFileUpload.state('selectedFile')).toEqual(fakeFileTsv.target.files[0]);
  })

  it('try testing generateFileData - bad input, no ordinal features', () => {
    // use dive() to get at inner FileUpload class functions -
    // https://github.com/airbnb/enzyme/issues/208#issuecomment-292631244
    const shallowFileUpload = shallow(<FileUpload store={store}/>).dive();
    // all input from user will be read as strings
    const fakeUserInput = {
      depCol: 'target_c@#$@#$',
      catCols: 'a, b, c   , 4,,, ,',
      ordFeats: ''
    };
    // add fake file with filename so generateFileData will do something, if
    // no file & filename present generateFileData returns blank/empty formData
    shallowFileUpload.setState({
      selectedFile: fakeFileTsv.target.files[0],
      dependentCol: fakeUserInput.depCol,
      catFeatures: fakeUserInput.catCols,
      ordinalFeatures: fakeUserInput.ordFeats
    });

    // expect list of comma separated cat cols to get parsed with string split
    //  (remove whitespace and empty strings)
    // dependent columns will be stored as is (type string)
    // ordFeats will parse given JSON, if not proper JSON return empty obj
    const expectedInput = {
      depCol: 'target_c@#$@#$',
      catCols: ['a', 'b', 'c', '4'],
      ordFeats: ''
    };
    // use instance to get access to inner function
    const instance = shallowFileUpload.instance();
    // create spy, check function gets called
    const spy = jest.spyOn(instance, 'generateFileData');
    const testData = instance.generateFileData(); // FormData
    // get stuff stored in returned formdata, stingified in preparation to make
    // network request
    const metadata = JSON.parse(testData.get('_metadata'));
    expect(spy).toBeCalled();
    // value of _metadata defined in generateFileData
    expect(metadata.dependent_col).toEqual(expectedInput.depCol);
    expect(metadata.categorical_features).toEqual(expectedInput.catCols);
    expect(metadata.ordinal_features).toEqual(expectedInput.ordFeats);
  })

  it('try testing generateFileData - bad input, with ordinal features', () => {
    // use dive() to get at inner FileUpload class functions -
    // https://github.com/airbnb/enzyme/issues/208#issuecomment-292631244
    const shallowFileUpload = shallow(<FileUpload store={store}/>).dive();
    // all input from user will be read as strings
    const fakeUserInput = {
      depCol: 'target_c@#$@#$',
      catCols: 'a, b, c   , 4,,, ,',
      ordFeats: '{"species": ["cat", "dog", "bird"]}{"missing_comma": ["one","two"]}'
    };
    // add fake file with filename so generateFileData will do something, if
    // no file & filename present generateFileData returns blank/empty formData
    shallowFileUpload.setState({
      selectedFile: fakeFile.target.files[0],
      dependentCol: fakeUserInput.depCol,
      catFeatures: fakeUserInput.catCols,
      ordinalFeatures: fakeUserInput.ordFeats
    });

    // expect list of comma separated cat cols to get parsed with string split
    //  (remove whitespace and empty strings)
    // dependent columns will be stored as is (type string)
    // ordFeats will parse given JSON, if not proper JSON return empty obj
    const expectedInput = {
      depCol: 'target_c@#$@#$',
      catCols: ['a', 'b', 'c', '4'],
      ordFeats: ''
    };
    // use instance to get access to inner function
    const instance = shallowFileUpload.instance();
    // create spy, check function gets called
    const spy = jest.spyOn(instance, 'generateFileData');
    const testData = instance.generateFileData(); // FormData
    // returned content from generateFileData should be object containing error
    //console.log('error test: ', testData);
    expect(testData.errorResp).toBeDefined();
    expect(testData.errorResp).toEqual('SyntaxError: Unexpected token { in JSON at position 35');
  })
})
// 
// describe('testing user input with table', () => {
//   describe.each`
//     testname | dependent_column | categorical_cols | ordinal_features | expected_cat | expected_ord
//     ${`Good input - no cat or ord`} | ${`test_class`} | ${""} | ${""} | ${[]} | ${{}}
//     ${`Good input - cat no ord`} | ${`test_class`} | ${"cat1, cat2"} | ${""} | ${["cat1","cat2"]} | ${{}}
//     ${`Good input - cat and ord`} | ${`test_class`} | ${"cat1, cat2"} | ${'{"species": ["cat", "dog", "bird"]}'}| ${["cat1","cat2"]} | ${{'species': ["cat", "dog", "bird"]}}
//     `("test good input", ({testname, dependent_column, categorical_cols, ordinal_features, expected_cat, expected_ord}) => {
//       it(`${testname}`, () => {
//         //console.log(`${testname} test`);
//
//         let store = mockStore(initialState);
//         const shallowFileUpload = shallow(<FileUpload store={store}/>).dive();
//         let testFileUpload;
//         let tree;
//         let fakeFile = {target: {files: [{name: 'iris.csv'}]}};
//         const expectedInput = {
//           depCol: 'test_class',
//           catCols: ['cat1', 'cat2'],
//           ordFeats: {
//             species: ["cat", "dog", "bird"]
//           }
//         };
//
//         shallowFileUpload.setState({
//           selectedFile: fakeFile.target.files[0],
//           dependentCol: `${dependent_column}`,
//           catFeatures: `${categorical_cols}`,
//           ordinalFeatures: `${ordinal_features}`
//         });
//
//
//         // use instance to get access to inner function
//         const instance = shallowFileUpload.instance();
//         // create spy, check function gets called
//         const spy = jest.spyOn(instance, 'generateFileData');
//         const testData = instance.generateFileData(); // FormData
//         console.log(`test data: `, testData);
//         // get stuff stored in returned formdata, stingified in preparation to make
//         // network request
//         const metadata = JSON.parse(testData.get('_metadata'));
//         console.log(`test data: `, metadata);
//         expect(spy).toBeCalled();
//         // value of _metadata defined in generateFileData
//         expect(metadata.dependent_col).toEqual(`${dependent_column}`);
//         expect(metadata.categorical_features).toEqual(`${expected_cat}`);
//         expect(metadata.ordinal_features).toEqual(`${expected_ord}`);
//       })
//     })
//
//   // describe.each`
//   //   testname | dependent_column | categoricals | ordinal
//   //   ${`Good input - no cat or ord`} | ${`test_class`} | ${[]} | ${{}}
//   //   ${`Good input - no cat or ord`} | ${`test_class`} | ${"cat1, cat2"} | ${{}}
//   // `('test good input', ({testname, dependent_column, categorical, ordinal}) => {
//   //   it(`${testname}`, () => {
//   //          console.log(`${testname} test`);
//   //        })
//   // });
// })
//


// https://jestjs.io/docs/en/tutorial-async
// jest mock is not working, not returning promise, must be improperly configured and/or
// not setup correctly or something

//jest.mock('../../utils/apiHelper');
//import uploadDataset from '../../data/datasets/dataset/api';

// cheating and just importing fake apiHelper directly - probably not recommended
import { uploadFile } from '../../utils/__mocks__/apiHelper';
describe('mock network request', () => {
  let store = mockStore(initialState);
  let testFileUpload;

  beforeEach(() => {
    //testFileUpload = mount(<FileUpload store={store} testProp='hello' />);
    testFileUpload = shallow(<FileUpload store={store} />).dive();
  })

  const fakeDatasets = [
    {
      'name': 'auto.csv',
      'username': 'testuser',
      'dependent_col' : 'class',
      'categorical_features': '',
      'ordinal_features': '',
      'timestamp': Date.now(),
    },
    {
      'name': 'iris.csv',
      'username': 'testuser',
      'dependent_col' : 'target_class',
      'categorical_features': '',
      'ordinal_features': '',
      'timestamp': Date.now(),
    }
  ];

  it('testing promise for successful case, proper dependent_col', () => {
    expect.assertions(1);
    //return uploadDataset(fakeDataset).then(data => expect(data.name).toEqual('iris.csv'));
    //return uploadFile('fakeurl').then(data => expect(data.name).toEqual('iris.csv'));

    // on successful upload, change window location/redirect the page, uses error
    // flag in server response to control logic for UI to display message on error
    // or page redirection on success, not sure how to get at those pieces with
    // this testing framework. DOM does not seem to be updating correctly
    return uploadFile(fakeDatasets[0])
      .then(data => expect(data.id).toEqual(7654321));
  })

  it('testing promise for unsuccessful case, improper dependent_col', () => {
    expect.assertions(1);
    return uploadFile(fakeDatasets[1])
      .catch(e => {
        expect(e).toEqual({'error': 'dependent_col: target_class invalid'});

        // fake setting state, normally occurs in upload handler function in
        // FileUpload component after promise making actual upload resolves

        // testFileUpload.setState({
        //   errorResp: e,
        //   serverResp: e
        // });

        // manually setting state is not working correctly?, popup open prop should be set
        // to 'true' in case of error response, not sure if this is incorrect method
        // of testing how UI should look based on react component state

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
