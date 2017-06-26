import React from 'react';
import {
    renderIntoDocument,
    scryRenderedDOMComponentsWithTag,
    scryRenderedDOMComponentsWithClass,
    Simulate
} from 'react-addons-test-utils';
import { Datasets } from '../';
import { initialDatasets } from './testValues.js';
import { List, Map, fromJS } from 'immutable';
import { expect } from 'chai';

describe('Datasets', () => {

   it('renders message to user when fetching data', () => {
      let datasets = List();
      let currentDataset = Map();
      let isFetching = true;

      const component = renderIntoDocument(
        <Datasets datasets={datasets} currentDataset={currentDataset} isFetching={isFetching} />
      );

      const buttons = scryRenderedDOMComponentsWithTag(component, 'button');
      const message = scryRenderedDOMComponentsWithClass(component, 'header')[1];

      expect(buttons.length).to.equal(0); // check that no buttons rendered
      expect(message.textContent).to.equal('Retrieving your datasets...'); // check message
   });

   it('renders message to user if no available datasets', () => {
      let datasets = List();
      let currentDataset = Map();

      const component = renderIntoDocument(
        <Datasets datasets={datasets} currentDataset={currentDataset} />
      );

      const buttons = scryRenderedDOMComponentsWithTag(component, 'button');
      const message = scryRenderedDOMComponentsWithClass(component, 'header')[1];

      expect(buttons.length).to.equal(0); // check that no buttons rendered
      expect(message.textContent).to.equal('You have no datasets available.'); // check message
   });

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