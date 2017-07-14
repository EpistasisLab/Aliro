import { get, getFile } from '../../../utils/apiHelper';

export const fetchResults = (id) =>
  get(`api/userexperiments/${id}`);

export const fetchFile = (id) =>
  getFile(`api/v1/files/${id}`);