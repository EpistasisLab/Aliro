import React from 'react';
import PropTypes from 'prop-types';
import InvertedCard from '../../../InvertedCard';
import Gauge from '../../../Gauge';
import GaugeAll from '../../../GaugeAll';
import BarPlot from '../../../BarPlot';
import { Header, Icon, Popup} from 'semantic-ui-react';
/**
* Hijacking this component to do two things:
*   1.) create single Gauge component or basic message based on given props
*   2.) make multi gauge (GuageAll) component to display chart with several entries
*/

function foldcheck(fold) {
  let iconname = 'checkmark';
  let iconcolor = 'green';
  let iconmsg = "The model is not overfitted based on this score.";
  if(fold > 1.5 || fold < 0 ){
    iconname = 'angle double up';
    iconcolor = 'red';
    iconmsg = 'Warning! The model is overfitted based on this score!';
  } else if(fold>1.2){
    iconname = 'angle up';
    iconcolor = 'yellow';
    iconmsg = 'Warning! The model may be overfitted based on this score!';
  }
  return [iconname, iconcolor, iconmsg];
}

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
          min={0.5}
          max={1.0}
        />
      );
    } else if (scoreValueList && type == "r2_or_vaf") {
      return (
        <GaugeAll
          expList={scoreValueList}
          chartKey={chartKey}
          chartColor={chartColor}
          min={0}
          max={1.0}
        />
      );
    } else if (scoreValueList && type == "pearsonr") {
      return (
        <GaugeAll
          expList={scoreValueList}
          chartKey={chartKey}
          chartColor={chartColor}
          min={-1.0}
          max={1.0}
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

  if(typeof(scoreValue) !== 'number' && !scoreValueList.length){
    return (
      <InvertedCard
        header={scoreName}
        content={getCardContent()}
      />
    );
  } else {
    let fold = scoreValueList[0][1]/scoreValueList[1][1];
    var icons = foldcheck(fold);
    let headericon = (
      <Popup
        position="top center"
        content={icons[2]}
        trigger={
          <Icon
            inverted
            color={icons[1]}
            name={icons[0]}
            className="info-icon float-right"
          />
        }
      />
    );

    return (
      <InvertedCard
        header={scoreName}
        headericon={headericon}
        content={getCardContent()}
      />
    );
  }


  
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
