
import { apiReq } from './apiTestHelper';
// get action stuff
import * as actionStuff from '../../data/datasets/dataset/actions';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import fetch from 'jest-fetch-mock';
import fetchMock from 'fetch-mock';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);


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

// using https://redux.js.org/recipes/writing-tests &
// https://www.npmjs.com/package/jest-fetch-mock as references
describe('async action tests', () => {

  afterEach(() => {
    fetchMock.restore()
  });

  it('creates TOGGLE_AI_SUCCESS when toggling AI is done togglin', () => {
    fetch.mockResponseOnce(JSON.stringify({ ai: 'requested' }));

    apiReq('/api/userdatasets/2525/ai', { ai: 'requested' }).then(res => {
      expect(res.data).toEqual('stuff');
    })


    // fetchMock.getOnce('/api/userdatasets/2525/ai', {
    //   body: { ai: 'requested' },
    //   headers: { 'content-type': 'application/json' }
    // });
    //
    // const expectedActions = [
    //   { type: actionStuff.TOGGLE_AI_REQUEST },
    //   { type: actionStuff.TOGGLE_AI_SUCCESS, body: {"message":"AI toggled for 2525"} }
    // ];
    //
    // const store = mockStore({ dataset: {} })
    //
    // expect(store.getActions()).toEqual(expectedActions);
  })
})
