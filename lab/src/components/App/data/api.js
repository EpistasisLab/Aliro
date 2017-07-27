import { get } from '../../../utils/apiHelper';

export const fetchPreferences = () => get('api/preferences');