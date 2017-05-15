export const getUniqOptions = (items, field) => {
	return [...new Set(items.map(item => item[field]))];
};