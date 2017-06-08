
export const requestAIToggle = (datasetId) => ({
	type: REQUEST_AI_TOGGLE,
	datasetId
});

export const receiveAIToggle = (datasetId, aiState) => ({
	type: RECEIVE_AI_TOGGLE,
	receivedAt: Date.now(),
	datasetId,
	aiState
});