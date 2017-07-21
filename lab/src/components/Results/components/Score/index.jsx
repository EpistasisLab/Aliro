import React from 'react';
import PropTypes from 'prop-types';
import FetchMessage from '../../../FetchMessage';
import InvertedCard from '../../../InvertedCard';
import Gauge from '../../../Gauge';

function Score({ scoreName, scoreValue, chartKey, chartColor }) {
  const getCardContent = () => {
    if(typeof(scoreValue) !== 'number') {
      return (
        <FetchMessage message={`${scoreName} is not available.`} />
      );
    }

    return (
      <Gauge 
        value={scoreValue}
        chartKey={chartKey}
        chartColor={chartColor}
      />
    );
  };

  return (
    <InvertedCard 
      header={scoreName}
      content={getCardContent()}
    />
  );
}

Score.propTypes = {
  scoreName: PropTypes.string.isRequired,
  scoreValue: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string
  ]),
  chartKey: PropTypes.string.isRequired,
  chartColor: PropTypes.string.isRequired
};

export default Score;