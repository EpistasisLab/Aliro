import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import FetchMessage from '../../../FetchMessage';
import FetchError from '../../../FetchError';
import InvertedCard from '../../../InvertedCard';
import { Image } from 'semantic-ui-react';

function ConfusionMatrix({
  confusionMatrix, 
  isFetching, 
  errorMessage,
  fetchConfusionMatrix,
  file
}) {
  const getCardContent = () => {
    if(errorMessage) {
      return (
        <FetchError
          message={errorMessage}
          onRetry={() => fetchConfusionMatrix(file.get('_id'))}
        />
      );
    } else if(isFetching) {
      return (
        <FetchMessage message="Retrieving Confusion Matrix..." />
      );
    } else if(!isFetching && !confusionMatrix) {
      return (
        <FetchMessage message="Confusion Matrix is not available." />
      );
    }

    return (
      <Image src={URL.createObjectURL(confusionMatrix)} />
    );
  };

  return (
    <InvertedCard 
      header="Confusion Matrix"
      content={getCardContent()}
    />
  );
}

ConfusionMatrix.propTypes = {
  confusionMatrix: PropTypes.instanceOf(Blob),
  isFetching: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string,
  fetchConfusionMatrix: PropTypes.func.isRequired,
  file: ImmutablePropTypes.map
};

export default ConfusionMatrix;