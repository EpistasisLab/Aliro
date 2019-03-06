import { put, uploadFile } from 'utils/apiHelper';

export const toggleAI = (datasetId, nextAIState) =>
  put(`api/userdatasets/${datasetId}/ai`, { ai: nextAIState });

export const uploadDataset = (dataset) => {
  return uploadFile('/api/v1/datasets', dataset);
}
