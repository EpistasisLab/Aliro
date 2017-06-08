/*case REQUEST_AI_TOGGLE:
		return state.merge({
				items: state.get('items').map(d => dataset(d, action))
		});
case RECEIVE_AI_TOGGLE:
		return state.merge({
				items: state.get('items').map(d => dataset(d, action))
		});*/

// manages individual dataset
/*const dataset = (state = fromJS({}), action) => {
		switch(action.type) {
				case REQUEST_AI_TOGGLE:
						if(state.get('_id') !== action.datasetId) {
								return state;
						}

						return state.merge({
								toggling: true
						});
				case RECEIVE_AI_TOGGLE:
						if(state.get('_id') !== action.datasetId) {
								return state;
						}
				
						return state.merge({
								ai: action.aiState,
								toggling: false
						});
				default:
						return state;  
		}
};*/