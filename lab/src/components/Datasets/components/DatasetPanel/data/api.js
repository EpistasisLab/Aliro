export const toggleAI = (datasetId, aiState) => {
	const route = `api/v1/datasets/${datasetId}/ai`;
		
	let myHeaders = new Headers();
	myHeaders.append('Content-Type', 'application/json');

	return function(dispatch) {
		dispatch(requestAIToggle(datasetId));
		return fetch(route, {
			method: 'PUT',
			headers: myHeaders,
			mode: 'cors',
			cache: 'default',
			body: JSON.stringify({ai: aiState})
		})
		.then(response => response.json())
		.then(json =>
			dispatch(receiveAIToggle(datasetId, aiState))
		);
	}  
};