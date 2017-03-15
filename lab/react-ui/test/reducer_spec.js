import { List, Map, fromJS } from 'immutable';
import { expect } from 'chai';

//import reducer from '../src/reducer';

beforeEach(function() {
	const initialState = Map();
});

describe('reducer', () => {

	/*it('handles SET_DATASETS', () => {
		console.log(reducer);
		const initialState = List();
		const datasets = fromJS([
           { name: 'Gametes' },
           { name: 'Adults' },
           { name: 'Hypothyroid' }
        ]);
        const action = {type: 'SET_DATASETS', datasets};
        const nextState = reducer(initialState, action);

       	expect(nextState.get('datasets')).to.equal(datasets);
	});*/

	/*it('handles SET_CURRENT_DATASET', () => {
		const initialState = Map();
       	const action = {type: 'SET_CURRENT_DATASET', currentDataset: fromJS({name: "Adults"})};
       	const nextState = reducer(initialState, action);

	 	expect(nextState).to.equal(fromJS({
	      currentDataset: fromJS({name: "Adults"})
	    }));
	});*/

});

