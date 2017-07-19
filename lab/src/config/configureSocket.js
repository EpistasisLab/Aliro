import io from 'socket.io-client';
import { updateAIToggle, updateDataset }from '../components/Datasets/components/DatasetCard/data/actions.js';
import { addExperiment, updateExperiment } from '../components/Experiments/data/actions.js';

let socket = null;

export const socketMiddleware = (store) => {
  return next => action => {
    const result = next(action);
    if(socket && action.type === 'PREFERENCES_FETCH_SUCCESS') {
      let preferences = store.getState().getIn(['preferences', 'data']).toJS();
      socket.emit('authentication', { userid: preferences._id });

      socket.on('authenticated', function() {
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
      });
    }
    return result;
  };
};

const configureSocket = (/*store*/) => {
  socket = io(`${location.protocol}//${location.hostname}:${location.port}`);
};

export default configureSocket;
