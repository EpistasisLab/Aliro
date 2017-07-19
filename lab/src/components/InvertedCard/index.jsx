import React from 'react';
import PropTypes from 'prop-types';
import { Segment, Header } from 'semantic-ui-react';

function InvertedCard({ header, content, /*footer*/ }) {
  return (
    <div className="inverted-card">
      <Segment inverted attached="top">
        <Header inverted size="medium" content={header} />
      </Segment>
      <Segment inverted attached="bottom">
        {content}
      </Segment>
    </div>
  );
}

InvertedCard.propTypes = {
  header: PropTypes.string.isRequired,
  content: PropTypes.element,
  footer: PropTypes.element
};

export default InvertedCard;