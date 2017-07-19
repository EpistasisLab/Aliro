import React from 'react';
import PropTypes from 'prop-types';
import InvertedCard from '../../../InvertedCard';
import { Image } from 'semantic-ui-react';

function ConfusionMatrix({ imageSrc }) {
  return (
    <InvertedCard 
      header="Confusion Matrix"
      content={imageSrc ? (
        <Image src={imageSrc} />
      ) : (
        <span>Not available</span>
      )}
    />
  );
}

ConfusionMatrix.propTypes = {
  imageSrc: PropTypes.string.isRequired
};

export default ConfusionMatrix;