export const fmtAlg = (str) => {
	str = str.replace(/([a-z])([A-Z])/g, '$1 $2');
  str = str.replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
  return str;
}

export const fmtParam = (str) => {
	str = str.replace(/_/g,' ');
	str = str.replace(/(^|\s)[a-z]/g, f => f.toUpperCase());
	return str;
}