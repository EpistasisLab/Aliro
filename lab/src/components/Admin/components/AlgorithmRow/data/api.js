import { put } from '../../../../../utils/apiHelper';

export const updateCategory = (algorithmId, nextCategory) =>
  put(`api/v1/projects/${algorithmId}/category`, { category: nextCategory });