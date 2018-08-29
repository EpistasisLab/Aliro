/**
* Api interfact to a machine instance
*/

import { get, post } from './util/apiHelper';

export const fetchCapacity = (id) => get(`http://machine:5081/projects/${id}/capacity`);
export const fetchProjects = () => get(`http://machine:5081/projects`);

export const killExperiment = (id) => post(`http://machine:5081/experiments/${id}/kill`);