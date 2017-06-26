import { get } from '../../../utils/apiHelper';

export const fetchDatasets = () =>
	get('api/userdatasets');