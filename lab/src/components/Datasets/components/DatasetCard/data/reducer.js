import { 
	AI_TOGGLE_REQUEST, 
	AI_TOGGLE_SUCCESS, 
	AI_TOGGLE_FAILURE
} from './actions';

const dataset = (state = Map(), action) => {
	switch(action.type) {
		case AI_TOGGLE_REQUEST:
			return state.get(action.id).set('isTogglingAI', true);
		case AI_TOGGLE_SUCCESS:
		case AI_TOGGLE_FAILURE:
			return state.get(action.id).set('isTogglingAI', false);
		default:
			return state;	
	}
};

export const getIsTogglingAI = (state, id) =>
	state.getIn(['datasets', 'byId', id, 'isTogglingAI']);

export default dataset;	