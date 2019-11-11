import React from 'react';
import PropTypes from 'prop-types';
import InvertedCard from '../../../InvertedCard';
import Gauge from '../../../Gauge';
import GaugeAll from '../../../GaugeAll';
import BarPlot from '../../../BarPlot';
import { Header } from 'semantic-ui-react';
/**
* Hijacking this component to do two things:
*   1.) create single Gauge component or basic message based on given props
*   2.) make multi gauge (GuageAll) component to display chart with several entries
*/
function Score({ scoreName, scoreValue, chartKey, chartColor, scoreValueList, type }) {
  const getCardContent = () => {
    if(typeof(scoreValue) !== 'number' && !scoreValueList.length) {
      if (scoreName.includes('AUC') ) {
        return (
          <Header inverted size="tiny" content={`${scoreName} is only available for binary classification.`} />
        );
      } else {
        return (
          <Header inverted size="tiny" content={`${scoreName} is not available.`} />
        );
      }
    } else if (scoreValueList && type == "classification") {

      return (
        <GaugeAll
          expList={scoreValueList}
          chartKey={chartKey}
          chartColor={chartColor}
        />
      );
    } else if (scoreValueList && type == "regression") {
      return (
        <BarPlot
          expList={scoreValueList}
          chartKey={chartKey}
          chartColor={chartColor}
        />
      );
    }

    /*return (
      <Gauge
        value={scoreValue}
        chartKey={chartKey}
        chartColor={chartColor}
      />
    );*/
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
