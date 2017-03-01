import React from 'react';
import ReactDOM from 'react-dom';
import {
    renderIntoDocument,
    findRenderedDOMComponentWithTag,
    scryRenderedDOMComponentsWithTag,
    scryRenderedDOMComponentsWithClass,
    Simulate
} from 'react-addons-test-utils';
import { fromJS } from 'immutable';
import { Datasets } from '../../src/components/Datasets';
import { expect } from 'chai';

describe('Datasets', () => {

   it('renders the list of available datasets in modal', () => {
       let datasets = fromJS([
           { name: 'gametes.csv' },
           { name: 'adults.csv' },
           { name: 'hypothyroid.csv' }
       ]);
       let currentDataset = new Map();

       const component = renderIntoDocument(
           <Datasets datasets={datasets} currentDataset={currentDataset} />
       );

       // simulate click to open modal
       const button = findRenderedDOMComponentWithTag(component, 'button');
       Simulate.click(button);

       // must use window.document in order to get elements in modal which is attached to body
       const modalList = window.document.getElementsByClassName('item');

       expect(modalList.length).to.equal(3);
   });


   it('displays selected dataset as none when none selected', () => {
       let datasets = fromJS([
           { name: 'gametes.csv' },
           { name: 'adults.csv' },
           { name: 'hypothyroid.csv' }
       ]);
       let currentDataset = new Map();

       const component = renderIntoDocument(
           <Datasets datasets={datasets} currentDataset={currentDataset} />
       );

       // get node that displays selected dataset
       const selected = scryRenderedDOMComponentsWithClass(component, 'header')[2];

       expect(selected).to.be.ok;
       expect(selected.textContent).to.contain('none');
   });

   it('does not display checkmark when no selected dataset', () => {
       let datasets = fromJS([
           { name: 'gametes.csv' },
           { name: 'adults.csv' },
           { name: 'hypothyroid.csv' }
       ]);
       let currentDataset = new Map();

       const component = renderIntoDocument(
           <Datasets datasets={datasets} currentDataset={currentDataset} />
       );

       // simulate click to open modal
       const button = findRenderedDOMComponentWithTag(component, 'button');
       Simulate.click(button);

       // must use window.document in order to get elements in modal which is attached to body
       const checkmark = window.document.getElementsByClassName('check');

       expect(checkmark.length).to.equal(0);
   });


   it('displays correct selected dataset upon selection', () => {
       let datasets = fromJS([
           { name: 'gametes.csv' },
           { name: 'adults.csv' },
           { name: 'hypothyroid.csv' }
       ]);
       let currentDataset = new Map();

       const setCurrentDataset = (item) => currentDataset = item;

       const component = renderIntoDocument(
           <Datasets datasets={datasets} currentDataset={currentDataset} setCurrentDataset={setCurrentDataset} />
       );

       // simulate click to open modal
       const button = findRenderedDOMComponentWithTag(component, 'button');
       Simulate.click(button);

       // must use window.document in order to get elements in modal which is attached to body
       const modalList = window.document.getElementsByClassName('item');

       // simulate click on a list item
       const current = modalList[0];
       console.log(current);
       Simulate.click(current);

   });

});