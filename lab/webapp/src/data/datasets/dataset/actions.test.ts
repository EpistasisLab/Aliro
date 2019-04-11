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
