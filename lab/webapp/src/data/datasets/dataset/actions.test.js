import * as actionStuff from './actions';

// redux actions for toggling AI and updating datasets - these actions take new
// input and emit corresponding redux actions
describe('testing how some UI action affects redux action stuff', () => {
  it('updateAI', () => {
    // mock input
    const testDatasetID = '1234321';
    const testState = {
      nextAIState: 'toggled'
    };
    // expected result
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

import * as apiTestHelper from './__mocks__/api';
//jest.mock('./api');
describe('testing mock api calls in redux action reducer', () => {

  it('toggleAI, expect success', () => {
    const testDatasetID = 12345;
    const nextAIState = {};

    expect.assertions(1);
    // let test = actionStuff.uploadDataset(testDatasetID);
    // expect(test).toEqual('d');

    return apiTestHelper.toggleAI(testDatasetID, nextAIState)
      .then(fakeData => expect(fakeData).toEqual({uploadedID: testDatasetID}));
  })

  it('toggleAI, expect failure', () => {
    const testDatasetID = 123345;
    const nextAIState = {};

    expect.assertions(1);

    return apiTestHelper.toggleAI(testDatasetID, nextAIState)
      .catch(e => expect(e).toEqual({error: 'wrong id ' + testDatasetID + ' ,expected 12345'}));
  })

  it('uploadDataset, expect success', () => {
    const testDatasetID = 9876;
    const nextAIState = {};

    expect.assertions(1);

    return apiTestHelper.uploadDataset(testDatasetID, nextAIState)
      .then(fakeData => expect(fakeData).toEqual({uploadedID: testDatasetID}));
  })

  it('uploadDataset, expect failure', () => {
    const testDatasetID = 123345;
    const nextAIState = {};

    expect.assertions(1);

    return apiTestHelper.uploadDataset(testDatasetID, nextAIState)
      .catch(e => expect(e).toEqual({error: 'wrong id ' + testDatasetID + ' ,expected 09876'}));
  })
})
