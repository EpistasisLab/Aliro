import io from 'socket.io-client';
import { updateAIToggle, updateDataset }from '../components/Datasets/components/DatasetCard/data/actions.js';
import { addExperiment, updateExperiment } from '../components/Experiments/data/actions.js';

let socket = null;

export const socketMiddleware = (store) => {
  return next => action => {
    const result = next(action);
    /*if(socket && action.type === AI_TOGGLE_SUCCESS) {
     	socket.emit('toggleAI', action);
    }*/
    return result;
  };
};

const configureSocket = (store) => {
	socket = io(`${location.protocol}//${location.hostname}:${location.port}`);

  socket.on('updateAIToggle', data => {
    const parsed = JSON.parse(data);
    updateAIToggle(parsed._id, parsed.nextAIState)(store.dispatch);
  });

  socket.on('updateDataset', data => {
    const dataset = JSON.parse(data)[0];
    updateDataset(dataset)(store.dispatch);
  });

  socket.on('addExperiment', data => {
    const experiment = JSON.parse(data)[0];
    addExperiment(experiment)(store.dispatch);
  });

  socket.on('updateExperiment', data => {
    const experiment = JSON.parse(data)[0];
    updateExperiment(experiment)(store.dispatch);
  });
};

export default configureSocket;
