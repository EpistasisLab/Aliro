import { post } from 'utils/apiHelper';

export const submitExperiment = (algorithm, params) => 
  post(`api/v1/projects/${algorithm}/experiment`, params);