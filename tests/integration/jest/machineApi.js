/**
* First pass at integrations tests that run against the lab container api through an external context
*
*/

import { get, post } from './util/apiHelper';

export const fetchCapacity = (id) => get(`http://machine:5081/projects/${id}/capacity`);
export const fetchProjects = () => get(`http://machine:5081/projects`);