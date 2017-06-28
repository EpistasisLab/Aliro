import { get } from '../../../utils/apiHelper';

export const fetchResults = (id) =>
    get(`api/experiments/${id}`);