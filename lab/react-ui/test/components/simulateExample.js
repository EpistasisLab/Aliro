// This demos how to simulate a click to open a modal and get content from modal
/*it('renders the list of available datasets in modal', () => {
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
});*/