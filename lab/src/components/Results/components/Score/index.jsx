import React from 'react';
import PropTypes from 'prop-types';
import InvertedCard from '../../../InvertedCard';
import Gauge from '../../../Gauge';

function Score({ scoreName, scoreValue, chartKey, chartColor }) {
  return (
    <InvertedCard 
      header={scoreName}
      content={
        <Gauge 
          value={scoreValue}
          chartKey={chartKey}
          chartColor={chartColor}
        />
      }
    />
  );
}

Score.propTypes = {
  scoreName: PropTypes.string.isRequired,
  scoreValue: PropTypes.number.isRequired,
  chartKey: PropTypes.string.isRequired,
  chartColor: PropTypes.string.isRequired
};

export default Score;