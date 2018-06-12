/**
* First pass at integrations tests that run against the lab container api through an external context
*
*/

import * as labApi from './labApi';

// just try to get some data
it('integration fetchDatasets', () => {
  expect.assertions(1);
  return labApi.fetchDatasets().then(data => expect(data).toBeTruthy());
  //return expect(labApi.fetchDatasets()).resolves.toBeTruthy();
});