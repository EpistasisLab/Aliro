import React from 'react';
import {
    renderIntoDocument,
    scryRenderedDOMComponentsWithClass,
    Simulate
} from 'react-addons-test-utils';
import { fromJS } from 'immutable';
import { Parameters } from '../';
import { currentAlgorithmParams, currentAlgorithmNoParams } from './testValues.js';
import { expect } from 'chai';

// 1. Complete logo project notes
// 2. Organize reducer + start setting up status page and snippet
// 3. Finish testing for Parameters/Parameter

// WORK ON THIS FIRST BEFORE TESTS: organizer reducer and set up for status page
// Look at json for results to get an idea of the json
// AND THEN use tdd for building status page and launch btn!

// pull out Parameter from Parameters and test correctly?

// renders nothing when fetching data (when currentAlgorithm is undefined)
// renders no components if algorithm has no parameters
// renders either alias or name for each
// renders description for each
// renders btn for each choice
// shows correct default value as active
// changes parameter value on click
describe('Parameters', () => {
  it('renders segment for each of the current algorithm’s parameters', () => {
       let currentAlgorithm = fromJS(currentAlgorithmParams);

       const component = renderIntoDocument(
           <Parameters currentAlgorithm={currentAlgorithm} />
       );

       const segments = scryRenderedDOMComponentsWithClass(component, 'segment');

       expect(segments.length).to.equal(3);
       expect(segments[0].textContent).to.include('alpha');
       expect(segments[1].textContent).to.include('binarize');
       expect(segments[2].textContent).to.include('fit prior');
  });
});