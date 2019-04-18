import React from 'react';
import PropTypes from 'prop-types';
import InvertedCard from '../../../InvertedCard';
import Gauge from '../../../Gauge';
import GaugeAll from '../../../GaugeAll';
import { Header } from 'semantic-ui-react';

function Score({ scoreName, scoreValue, chartKey, chartColor, scoreValueList }) {
  const getCardContent = () => {
    if(typeof(scoreValue) !== 'number') {
      return (
        <Header inverted size="tiny" content={`${scoreName} is not available.`} />
      );
    } else if (scoreValueList) {
      let gaugeList = [];
      let testList = [];
      let keyList = ['train_score', 'test_score', 'accuracy_score'];

      Object.keys(scoreValueList).forEach(scoreKey => gaugeList.push(
        [scoreKey, scoreValueList[scoreKey]]
      ))
      keyList.forEach(scoreKey => testList.push(
        [scoreKey, scoreValueList[scoreKey]]
      ))
      //return gaugeList;
      window.console.log(gaugeList);
      return (
        <GaugeAll
          expList={testList}
          chartKey={chartKey}
          chartColor={chartColor}
        />
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
