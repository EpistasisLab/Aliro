// improve delegate to create a mapping on init rather than loop each time!!
export const delegateTo = (children) => {
	// create a mapping instead
	return (state, action) => {
		children.forEach(child => {
			if(action.type.startsWith(child.prefix)) {
				return child.reducer(state, action);
			}
		});
	};
};