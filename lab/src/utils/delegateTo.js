// improve delegate to create a mapping on init rather than loop each time!!
export const delegateTo = (children) => {
  // create a mapping instead
  return (state, action) => {
    let reducer;
    children.forEach(child => {
      if(action.type.startsWith(child.prefix)) {
        reducer = child.reducer(state, action);
      }
    });
    return reducer;
  };
};