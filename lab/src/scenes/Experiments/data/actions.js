export const REQUEST_EXPERIMENTS = 'REQUEST_EXPERIMENTS';
export const RECEIVE_EXPERIMENTS = 'RECEIVE_EXPERIMENTS';

export const requestExperiments = () => {
	return {
		type: REQUEST_EXPERIMENTS
	}
};

export const receiveExperiments = (json) => {
	return {
		type: RECEIVE_EXPERIMENTS,
		experiments: json,
		receivedAt: Date.now()
	}
};