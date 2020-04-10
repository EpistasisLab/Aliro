import * as actions from './actions'

import 'isomorphic-fetch'
import fetchMock from 'fetch-mock'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)
fetchMock.config.sendAsJson = true

describe ('async actions', () => {
	afterEach(() => {
		fetchMock.restore()
	})

	it('create FETCH_RECOMMENDER_SUCCESS when fetching recommender has been done', () => {
		const recObject = {
			    "_id": "5e8bdb51cb325e6349a450c9",
			    "type": "recommender",
			    "status": "disabled"
			}

		fetchMock.getOnce('path:/api/recommender', {
			body: recObject
		})

		const expectedActions = [
			{ type: actions.FETCH_RECOMMENDER_REQUEST},
			{ type: actions.FETCH_RECOMMENDER_SUCCESS, payload: recObject }
		]
		const store = mockStore()

	    return store.dispatch(actions.fetchRecommender()).then(() => {
	      // return of async actions
	      expect(store.getActions()).toEqual(expectedActions)
	    })
	})

})