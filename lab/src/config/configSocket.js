import io from 'socket.io-client';
import { updateAIToggle, updateDataset }from '../components/Datasets/components/DatasetCard/data/actions.js';
import { addExperiment, updateExperiment } from '../components/Experiments/data/actions.js';

let socket = io(`${location.protocol}//${location.hostname}:${location.port}`);

const configSocket = (store) => {
  socket.on('updateAIToggle', data => {
    const parsed = JSON.parse(data);
    updateAIToggle(parsed._id, parsed.nextAIState)(store.dispatch);
  });

  socket.on('updateDataset', data => {
    const dataset = JSON.parse(data)[0];
    updateDataset(dataset)(store.dispatch);
  });

  socket.on('updateExperiment', data => {
    const experiment = JSON.parse(data)[0];
    updateExperiment(experiment)(store.dispatch);
  });

  socket.on('addExperiment', data => {
    const experiment = JSON.parse(data)[0];
    addExperiment(experiment)(store.dispatch);
  });
};

export default configSocket;