import React from 'react';
import { Header, Button } from 'semantic-ui-react';

const FetchError = ({ message, onRetry }) => (
  <div>
    <Header 
      inverted 
      size="small"
      content="Sorry, there's been an error."
      subheader={message}
    />
    <Button 
      inverted 
      color="orange" 
      compact 
      size="small"
      content="Retry"
      onClick={onRetry}
    />
  </div>
);

export default FetchError;