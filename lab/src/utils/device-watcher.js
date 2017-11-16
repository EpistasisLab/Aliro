const breakpoints = {
  MAX_MOBILE: 480,
  MIN_TABLET: 768,
  MAX_TABLET: 1024,
  MAX_DESKTOP: 1224,
  MAX_LGSCREEN: 1824
};

const initState = () => {
  return { width: window.innerWidth, height: window.innerHeight };
};

let eventListener;
const setEventListener = (f) => {
  eventListener = f;
};

const startWatch = (setState) => {
  setEventListener(updateState.bind(null, setState));
  window.addEventListener('resize', eventListener);
};

const updateState = (setState) => {
  setState({ width: window.innerWidth, height: window.innerHeight });
};

const endWatch = () => {
  window.removeEventListener('resize', eventListener);
};

const calcCols = (state, colsByDevice) => {
  const { width } = state;

  if(width < breakpoints.MIN_TABLET) { 
    return colsByDevice.mobile; 
  } else if(width < breakpoints.MAX_TABLET) { 
    return colsByDevice.tablet; 
  } else if(width < breakpoints.MAX_DESKTOP) { 
    return colsByDevice.desktop; 
  } else { 
    return colsByDevice.largescreen;
  }
};

module.exports = {
  breakpoints,
  initState,
  startWatch,
  endWatch,
  calcCols
};