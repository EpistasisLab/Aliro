import { put } from 'utils/apiHelper';

export const toggleAI = (datasetId, nextAIState) =>
  put(`api/userdatasets/${datasetId}/ai`, { ai: nextAIState });