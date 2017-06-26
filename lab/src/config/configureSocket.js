import io from 'socket.io-client';
import { 
	AI_TOGGLE_SUCCESS,
	AI_TOGGLE_UPDATE
 } from '../components/Datasets/components/DatasetCard/data/actions.js';

let socket = null;

export const socketMiddleware = (store) => {
  return next => action => {
    const result = next(action);
    if(socket && action.type === AI_TOGGLE_SUCCESS) {
     	socket.emit('toggleAI', action);
    }
    
    return result;
  };
};

const configureSocket = (store) => {
	socket = io(`${location.protocol}//${location.hostname}:${location.port}`);

	socket.on('toggleAI', data => {
    store.dispatch({
    	type: AI_TOGGLE_UPDATE,
    	id: data.id,
    	nextAIState: data.nextAIState
    });
  });
};

export default configureSocket;
