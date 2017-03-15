import React from 'react';
import {
    renderIntoDocument,
    scryRenderedDOMComponentsWithClass,
    Simulate
} from 'react-addons-test-utils';
import { fromJS } from 'immutable';
import { Parameters } from '../../src/components/Parameters';
import { initialAlgorithms } from './testValues.js';
import { expect } from 'chai';

describe('Parameters', () => {
	it('renders segment for each of the current algorithm’s parameters', () => {
	   let algorithms = fromJS(initialAlgorithms);
       let currentAlgorithm = algorithms.first();

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