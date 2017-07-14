export const fmtDatasetName = (str) => {
  str = str.replace(/_/g,' '); // remove underscore
  str = str.replace(/-/g,' '); // remove dashes
  str = str.replace(/(^|\s)[a-z]/g, f => f.toUpperCase()); // uppercase each new word
  return str;
};

export const fmtAlg = (str) => {
  // put spaces between capitalized words
  str = str.replace(/([a-z])([A-Z])/g, '$1 $2');
  str = str.replace(/([A-Z])([A-Z][a-z])/g, '$1 $2');
  return str;
};

export const fmtParam = (str) => {
  str = str.replace(/_/g,' '); // remove underscore
  str = str.replace(/(^|\s)[a-z]/g, f => f.toUpperCase()); // uppercase each new word
  return str;
};