import React from 'react';
import { Header } from 'semantic-ui-react';

function NotFound() {
  return (
    <div>
      <Header
        inverted 
        color="red" 
        size="huge" 
        textAlign="center"
        content="404 Error: Page Not Found"
      />
    </div>
  );
}

export default NotFound;