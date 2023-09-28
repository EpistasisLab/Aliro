/* ~This file is part of the Aliro library~

Copyright (C) 2023 Epistasis Lab, 
Center for Artificial Intelligence Research and Education (CAIRE),
Department of Computational Biomedicine (CBM),
Cedars-Sinai Medical Center.

Aliro is maintained by:
    - Hyunjun Choi (hyunjun.choi@cshs.org)
    - Miguel Hernandez (miguel.e.hernandez@cshs.org)
    - Nick Matsumoto (nicholas.matsumoto@cshs.org)
    - Jay Moran (jay.moran@cshs.org)
    - and many other generous open source contributors

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.

(Autogenerated header, do not modify)

*/
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import InvertedCard from '../../../InvertedCard';
// import Gauge from '../../../Gauge';
// import GaugeAll from '../../../GaugeAll';
// import DonutChart from '../../../DonutChart';
import ScatterPlot from '../../../ScatterPlot';
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


// <PCAJSON scoreName="PCA 2D"
//                   Points={experiment.data.X_pca}
//                   Labels={experiment.data.y_pca}
//                   chartKey="pca_2d"
//                   chartColor="#55D6BE"
//                   type="classification"
//                 />


// function NoScore({ scoreName, train_sizes, Points, test_scores, chartKey, chartColor, type }) {
  function NoScore({ scoreName, file, chartKey, chartColor, type }) {

    // const [data, setData] = useState(null);
    const [Points, setPoints] = useState([]);
    const [Labels, setLabels] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/v1/files/${file._id}`);
        const jsonData = await response.json();
        
        setPoints(jsonData.X_tsne);
        setLabels(jsonData.y_tsne);
      } catch (error) {
        console.error('Error fetching JSON:', error);
      }
    };

    fetchData();
  }, []);


  const getCardContent = () => {
    // if(typeof(Labels) !== 'number' && !LabelsList.length) 
    // {
    //   if (scoreName.includes('AUC') ) {
    //     return (
    //       <Header inverted size="tiny" content={`${scoreName} is only available for binary classification.`} />
    //     );
    //   } else {
    //     return (
    //       <Header inverted size="tiny" content={`${scoreName} is not available.`} />
    //     );
    //   }
    // } 
    
    if (Points && Labels && type == "classification") {

      console.log(scoreName+"i am here in no score");
      console.log(scoreName+'labels', Labels);

      return (

        // <GaugeAll
        //   expList={LabelsList}
        //   chartKey={chartKey}
        //   chartColor={chartColor}
        //   min={0.5}
        //   max={1.0}
        // />
        
      
      // <DonutChart
      //   expList={LabelsList}
      //   chartKey={chartKey}
      //   chartColor={chartColor}
      //   min={0.5}
      //   max={1.0}
      // />


      // Points, Labels, chartKey, chartColor, type
      <ScatterPlot 
        Points={Points}
        Labels ={Labels}
        chartKey={chartKey}
        chartColor={chartColor}
      />
      

      );
      
    } 
    // else if (LabelsList && type == "r2_or_vaf") {
    //   return (
    //     <GaugeAll
    //       expList={LabelsList}
    //       chartKey={chartKey}
    //       chartColor={chartColor}
    //       min={0}
    //       max={1.0}
    //     />
    //   );
    // } else if (LabelsList && type == "pearsonr") {
    //   return (
    //     <GaugeAll
    //       expList={LabelsList}
    //       chartKey={chartKey}
    //       chartColor={chartColor}
    //       min={-1.0}
    //       max={1.0}
    //     />
    //   );
    // }

  };

  if(typeof(Labels) !== 'number' && !Points.length){
    return (
      <InvertedCard
        header={scoreName}
        content={getCardContent()}
      />
    );
  } else {
    let fold = Points[0][1]/Points[1][1];
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
      content={getCardContent()}
    />
      
    );
  }


  
}


NoScore.propTypes = {
  scoreName: PropTypes.string.isRequired,
  Labels: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.string
  ]),
  chartKey: PropTypes.string.isRequired,
  chartColor: PropTypes.string.isRequired
};

export default NoScore;
