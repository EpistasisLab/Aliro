import React from 'react';
import {
    renderIntoDocument,
    scryRenderedDOMComponentsWithTag,
    Simulate
} from 'react-addons-test-utils';
import { fromJS } from 'immutable';
import { Datasets } from '../../src/components/Datasets';
import { initialDatasets } from './testValues.js';
import { expect } from 'chai';

describe('Datasets', () => {

   it('renders button for each available dataset', () => {
       let datasets = fromJS(initialDatasets);
       let currentDataset = datasets.first();

       const component = renderIntoDocument(
           <Datasets datasets={datasets} currentDataset={currentDataset} />
       );

       const buttons = scryRenderedDOMComponentsWithTag(component, 'button');

       expect(buttons.length).to.equal(3);
       expect(buttons[0].textContent).to.equal('Gametes');
       expect(buttons[1].textContent).to.equal('Adults');
       expect(buttons[2].textContent).to.equal('Hypothyroid');
   });

   it('displays selected dataset as active', () => {
       let datasets = fromJS(initialDatasets);
       let currentDataset = datasets.first();

       const component = renderIntoDocument(
           <Datasets datasets={datasets} currentDataset={currentDataset} />
       );

       const buttons = scryRenderedDOMComponentsWithTag(component, 'button');

       expect(buttons[0].className).to.include('active');
       expect(buttons[1].className).to.not.include('active');
       expect(buttons[2].className).to.not.include('active');
   });

   it('updates selected dataset upon user click event', () => {
       let datasets = fromJS(initialDatasets);
       let currentDataset = datasets.first();

       const setCurrentDataset = (item) => currentDataset = item;

       const component = renderIntoDocument(
           <Datasets datasets={datasets} currentDataset={currentDataset} setCurrentDataset={setCurrentDataset} />
       );

       const buttons = scryRenderedDOMComponentsWithTag(component, 'button');

       expect(currentDataset.get('name')).to.equal('Gametes');
       Simulate.click(buttons[1]);
       expect(currentDataset.get('name')).to.equal('Adults');
   });

});