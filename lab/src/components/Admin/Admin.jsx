import React from 'react';
import ResponsiveGrid from '../ResponsiveGrid';
import FetchError from '../FetchError';
import { Header } from 'semantic-ui-react';

function Admin() {
  /*if(errorMessage && !datasets.size) {
    return (
      <FetchError 
        message={errorMessage}
        onRetry={() => fetchDatasets()}
      />
    );
  } else if(isFetching && !datasets.size) {
    return (
      <Header 
        inverted 
        size="small"
        content="Retrieving your datasets..."
      />
    );
  } else if(!isFetching && !datasets.size) {
    return (
      <Header 
        inverted 
        size="small"
        content="You have no datasets uploaded yet."
      />
    );
  }*/
      
  return (
    <ResponsiveGrid
      mobile={1}
      tablet={2}
      desktop={3}
      lgscreen={4}
    >
      Admin
    </ResponsiveGrid>
  );
}

Admin.propTypes = {

};

export default Admin;