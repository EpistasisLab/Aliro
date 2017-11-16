import React from 'react';
import PropTypes from 'prop-types';
import { Header, Button } from 'semantic-ui-react';

function FetchError({ message, onRetry }) {
  return (
    <div>
      <Header 
        inverted 
        size="small"
        content="Sorry, there's been an error."
        subheader={message}
      />
      {onRetry &&
        <Button 
          inverted 
          color="orange" 
          compact 
          size="small"
          content="Retry"
          onClick={onRetry}
        />
      }
    </div>
  );
}

FetchError.propTypes = {
  message: PropTypes.string.isRequired,
  onRetry: PropTypes.func
};

export default FetchError;