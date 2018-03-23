import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import FetchError from '../../../FetchError';
import InvertedCard from '../../../InvertedCard';
import { Header, Image, Loader } from 'semantic-ui-react';

function ImportanceScore({
  importanceScore,
  isFetching,
  errorMessage,
  fetchImportanceScore,
  file
}) {
  const getCardContent = () => {
    if(errorMessage) {
      return (
        <FetchError
          message={errorMessage}
          onRetry={() => fetchImportanceScore(file.get('_id'))}
        />
      );
    } else if(isFetching) {
      return (
        <Loader active inverted inline="centered" content="Retrieving feature importance..." />
      );
    } else if(!isFetching && !importanceScore) {
      return (
        <Header inverted size="tiny" content="Feature importance is not available." />
      );
    }

    return (
      <Image src={URL.createObjectURL(importanceScore)} />
    );
  };

  return (
    <InvertedCard
      header="Feature Importance"
      content={getCardContent()}
    />
  );
}

ImportanceScore.propTypes = {
  file: ImmutablePropTypes.map,
  importanceScore: PropTypes.instanceOf(Blob),
  isFetching: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string,
  fetchImportanceScore: PropTypes.func.isRequired
};

export default ImportanceScore;
