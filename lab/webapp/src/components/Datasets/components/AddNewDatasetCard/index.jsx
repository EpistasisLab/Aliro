/* ~This file is part of the Aliro library~

Copyright (C) 2017 Epistasis Lab, University of Pennsylvania

Aliro is maintained by:
    - Heather Williams (hwilli@upenn.edu)
    - Weixuan Fu (weixuanf@upenn.edu)
    - William La Cava (lacava@upenn.edu)
    - Michael Stauffer (stauffer@upenn.edu)
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
import React from 'react';
import { connect } from 'react-redux';
// import * as actions from 'data/datasets/dataset/actions';
// import DatasetActions from './components/DatasetActions';
import BestResult from './components/BestResult';
import ExperimentStatus from './components/ExperimentStatus';
import { Grid, Segment, Header, Button, Popup, Message } from 'semantic-ui-react';
import { formatDataset } from '../../../../utils/formatter';



import { Link } from 'react-router';

const AddNewDatasetCard = () => {
	
  // console.log('header', header);
  // console.log('subheader', subheader);
  // console.log('btnText', btnText);
  // console.log('btnIcon', btnIcon);
  // console.log('linkText', linkText);

  // console.log("Link", Link);

	// var icon_type = "question circle";
  // console.log("sessionStorage.getItem(addNewPopup)",sessionStorage.getItem("addNewPopup"))
	
  function openTrueOrFalse_addNewPopup(){
    if (sessionStorage.getItem("addNewPopup") == "true"){

      // if (document.getElementById("aiTooglePopup")!==null){
      //   document.getElementById("aiTooglePopup").style.cssText = "display: block !important";
      // }

      
      return false;
    }
    else{
      return true;
    }
    

  }


  const style = {
    // borderRadius: 0 !important,
    //show focus outline

    opacity: 0.5,
    padding: '2em',
    // background: '#fff',
    // 
  }

    return (
      // if sessionStorage does not have addNewPopup


        <Grid.Column className="dataset-card" id= "gridAddNewdataCard"  >
          
          {/* <Popup 
            // id ="aiTooglePopup"
            trigger={
              // make Segment color blue

            <Segment inverted attached="top" className="panel-header" id ="segmentAddNewdataCard">
              <Popup
                position="right center"
              //   header={formatDataset(dataset.name)}
              //   content={`Rows: ${dataset.metafeatures.n_rows}, Cols: ${dataset.metafeatures.n_columns}, Classes: ${dataset.metafeatures.n_classes}  Prediction type: ${dataset.files[0].prediction_type}`}
              // content="Add a new dataset"  
              trigger={
                  <Header
                    as="a"
                    inverted
                    size="large"
                  
                    className="title"
                    
                  />
                }
              />
              
            </Segment>
            }
            position="bottom right"
            // header={formatDataset(dataset.name)}
            content = "Step 2: If you want to generate machine learning experiments automatically, please click to toggle AI button"
            
            
  
          /> */}

      <Segment inverted attached="top" className="panel-header" id ="testheader">
          <Header
                as="a"
                inverted
                size="large"
                // icon={icon_type}
                // content={formatDataset(dataset.name)}
                // href={datasetLink}
                className="title"
                
              />

        </Segment>

        <BestResult />
        <ExperimentStatus
          // filter={dataset._id}
          // experiments={dataset.experiments}
          // notifications={"hello"}
        />


          
  
         
          <Popup
            id = "addNewPopup"
            trigger={
            // <Button
            //   as="a"
            //   color="blue"
            //   icon="plus"
            //   size = "large"
            //   attached="bottom"
            //   // content="Build New Experiment"
            // //   href={builderLink}
            // />
            <Button
              // inverted
              // as="a"
              id = "addNewDatasetBtnCross"
              // className="dataset-card"
              color="blue"
              icon="plus"
              // size = "large"
              // attached="center"
              as={ Link }
              to={"/upload_datasets"}
              content="Add New Dataset"
              // positioning content "bottom right"
              // position="bottom right"
             >

              

             </Button> 
            
          }
          content = "Step 1: click this button to upload your dataset."
          
          // style={style}
          

          // position='right center'
          position='bottom center'



        // use function in open

        open = {openTrueOrFalse_addNewPopup()}
  
        
  
        onClick = { () => 
          {
            if (document.getElementById("addNewPopup") != null) {
            
              document.getElementById("addNewPopup").style.cssText += ';display:none !important;';

              // save flag to local storage to avoid showing the popup again
              // use session storage to avoid showing the popup again

              sessionStorage.setItem("addNewPopup", "true");
              // show the local storage on the console
              console.log("addNewPopup", sessionStorage.getItem("addNewPopup"));


              // add below to App.css in javascript


              // get class name content under id aiTooglePopup
              var content = document.getElementById("aiTooglePopup").getElementsByClassName("content")[0];
              // set border-radius: 10px;
              content.style.cssText += ';border-radius: 10px;';

              var aiTooglePopup =document.getElementById("aiTooglePopup")
              
              // set display: flex;
              aiTooglePopup.style.cssText += ';display: flex;';
              // set flex-direction: row;
              aiTooglePopup.style.cssText += ';flex-direction: row;';
              // set align-items: center;
              aiTooglePopup.style.cssText += ';align-items: center;';

              // set animation: blinker 3s linear infinite;
              aiTooglePopup.style.cssText += ';animation: blinker 3s linear infinite;';


              // #aiTooglePopup .content {
    
      
              //   border-radius: 10px;
   
              // }

              
              // #aiTooglePopup{
              //   display: flex;
              //   flex-direction: row;
              //   align-items: center;
              //   animation: blinker 3s linear infinite;
              // }

              // // add above css to App.css in javascript

              // document
              

            
            }
          }
        }


          />

        {/* <BestResult
          // result={dataset.best_result}
          // hasMetadata={dataset.has_metadata}
        />
        <ExperimentStatus
          // filter={dataset._id}
          // experiments={dataset.experiments}
          // notifications={dataset.notifications}
        /> */}


          {/* <Segment inverted attached="top" className="panel-header" id ="segmentAddNewdataCard">
          <Header
                    as="a"
                    inverted
                    size="large"
                  
                    className="title"
                    
                  />
              
            </Segment> */}


        </Grid.Column>
      );
   


  

  
};

export { AddNewDatasetCard };
// export default connect(null, actions)(AddNewDatasetCard);