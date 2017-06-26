import { get } from '../../../utils/apiHelper';

export const fetchExperiments = () => 
    get('api/userexperiments');