import React from 'react';
import PropTypes from 'prop-types';
import { Header } from 'semantic-ui-react';

function FetchMessage({ message }) {
  return (
    <div>
      <Header 
        inverted 
        size="small"
        content={message}
      />
    </div>
  );
}

FetchMessage.propTypes = {
  message: PropTypes.string.isRequired
};

export default FetchMessage;