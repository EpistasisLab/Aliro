import { get, post } from '../../../utils/apiHelper';

export const fetchDataset = (id) => get(`api/datasets/${id}`);

export const fetchExperiment = (id) => get(`api/experiments/${id}`);

export const submitExperiment = (algorithm, params) => 
  post(`api/v1/projects/${algorithm}/experiment`, params.toJSON());