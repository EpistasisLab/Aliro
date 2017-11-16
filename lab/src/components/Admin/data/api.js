import { get } from '../../../utils/apiHelper';

export const fetchAlgorithms = () => get('api/projects');