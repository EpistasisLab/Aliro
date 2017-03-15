import React from 'react';
import {
    renderIntoDocument,
    scryRenderedDOMComponentsWithTag,
    Simulate
} from 'react-addons-test-utils';
import { fromJS } from 'immutable';
import { Algorithms } from '../../src/components/Algorithms';
import { initialAlgorithms } from './testValues.js';
import { expect } from 'chai';

describe('Algorithms', () => {

   it('renders button for each available algorithm', () => {
       let algorithms = fromJS(initialAlgorithms);
       let currentAlgorithm = algorithms.first();

       const component = renderIntoDocument(
           <Algorithms algorithms={algorithms} currentAlgorithm={currentAlgorithm} />
       );

       const buttons = scryRenderedDOMComponentsWithTag(component, 'button');

       expect(buttons.length).to.equal(3);
       expect(buttons[0].textContent).to.equal('BernoulliNB');
       expect(buttons[1].textContent).to.equal('GaussianNB');
       expect(buttons[2].textContent).to.equal('LinearSVC');
   });

   it('displays selected algorithm as active', () => {
       let algorithms = fromJS(initialAlgorithms);
       let currentAlgorithm = algorithms.first();

       const component = renderIntoDocument(
           <Algorithms algorithms={algorithms} currentAlgorithm={currentAlgorithm} />
       );

       const buttons = scryRenderedDOMComponentsWithTag(component, 'button');

       expect(buttons[0].className).to.include('active');
       expect(buttons[1].className).to.not.include('active');
       expect(buttons[2].className).to.not.include('active');
   });

   it('updates selected algorithm upon user click event', () => {
       let algorithms = fromJS(initialAlgorithms);
       let currentAlgorithm = algorithms.first();

       const setCurrentAlgorithm = (item) => currentAlgorithm = item;

       const component = renderIntoDocument(
           <Algorithms algorithms={algorithms} currentAlgorithm={currentAlgorithm} setCurrentAlgorithm={setCurrentAlgorithm} />
       );

       const buttons = scryRenderedDOMComponentsWithTag(component, 'button');

       expect(currentAlgorithm.get('name')).to.equal('BernoulliNB');
       Simulate.click(buttons[1]);
       expect(currentAlgorithm.get('name')).to.equal('GaussianNB');
   });

});