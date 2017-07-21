import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import FetchMessage from '../../../FetchMessage';
import FetchError from '../../../FetchError';
import InvertedCard from '../../../InvertedCard';
import { Image } from 'semantic-ui-react';

function ROCCurve({
  rocCurve, 
  isFetching, 
  errorMessage,
  fetchROCCurve,
  file
}) {
  const getCardContent = () => {
    if(errorMessage) {
      return (
        <FetchError
          message={errorMessage}
          onRetry={() => fetchROCCurve(file.get('_id'))}
        />
      );
    } else if(isFetching) {
      return (
        <FetchMessage message="Retrieving ROC Curve..." />
      );
    } else if(!isFetching && !rocCurve) {
      return (
        <FetchMessage message="ROC Curve is not available." />
      );
    }

    return (
      <Image src={URL.createObjectURL(rocCurve)} />
    );
  };

  return (
    <InvertedCard 
      header="ROC Curve"
      content={getCardContent()}
    />
  );
}

ROCCurve.propTypes = {
  rocCurve: PropTypes.instanceOf(Blob),
  isFetching: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string,
  fetchROCCurve: PropTypes.func.isRequired,
  file: ImmutablePropTypes.map
};

export default ROCCurve;