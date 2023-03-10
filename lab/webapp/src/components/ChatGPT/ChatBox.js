// Nick's ChatBox component
import AISVGLogo from './AISVGLogo'
import React from 'react';
import {useState, useEffect} from "react";
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { faThumbsUp } from '@fortawesome/free-solid-svg-icons'

import ImportanceScoreJSON from '../ResultsV2/components/ImportanceScoreJSON';
import ClassRate from '../ResultsV2/components/ClassRate';
import Builder from '../Builder';
import {Header, Grid, Loader, Dropdown, Menu} from 'semantic-ui-react';
import AlgorithmDetails from '../ResultsV2/components/AlgorithmDetails';
import RunDetails from '../ResultsV2/components/RunDetails';
import ImportanceScore from '../ResultsV2/components/ImportanceScore';
import LearningCurve from '../ResultsV2/components/LearningCurve';
import PCA from '../ResultsV2/components/PCA';
import LearningCurveJSON from '../ResultsV2/components/LearningCurveJSON';
import PCAJSON from '../ResultsV2/components/PCAJSON';
import ConfusionMatrixJSON from '../ResultsV2/components/ConfusionMatrixJSON';
import TSNEJSON from '../ResultsV2/components/TSNEJSON';
// import ROCCurve from '../ResultsV2/components/ROCCurve';
import ShapSummaryCurve from '../ResultsV2/components/ShapSummaryCurve';
import MSEMAEDetails from '../ResultsV2/components/MSEMAEDetails';
import Score from '../ResultsV2/components/Score';

// Primary Chat Window
const ChatBox = ({chatLog, setChatLog, setChatInput, handleSubmit, chatInput, experiment}) => 
<section className="chatbox" id={experiment}>
    <div className="chat-log">
        {
            chatLog.map((message, index) => (
                <ChatMessage
                    chatIndex={index}
                    message={message}
                    chatLog={chatLog}
                    setChatLog={setChatLog}
                    setChatInput={setChatInput}
                    experiment={experiment}/>
            ))
        }
    </div>

    <div className="chat-input-holder">
        <form className="form" onSubmit={handleSubmit}>
            <input
                rows="1"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="chat-input-textarea"></input>
            <button className="submit" type="submit">Submit</button>
        </form>
    </div>
</section>


// Chat Message



const ChatMessage = ({chatIndex, message, chatLog, setChatLog, setChatInput, experiment}) => {
    console.log("message", message);
    
    if(message.messageType === "text"){
        
        const selectButton= (e) => {
            //get to the parent div that is class chat-message-center
            let parent = e.target.parentNode;
            while(parent.className !== "chat-message-center"){
                parent = parent.parentNode;
            }

            //get chat-button class children
            let buttons = parent.getElementsByClassName("chat-button");
            
            //loop through buttons and change background color to default
            for (let i = 0; i < buttons.length; i++) {
                buttons[i].style.backgroundColor = "";
            }
            e.target.style.backgroundColor = "#658465";
            // convert to int
            let api_id =parseInt(e.target.dataset.messageid) + 1;
            console.log(api_id);
            // api_call(api_id);


            // save whether button was clicked into local storage
            localStorage.setItem("buttonClicked", true);

        };

        let hasButtons = message.buttons !== undefined ? true : false;
        
        return (
            <div className={`chat-message ${message.user === "assistant" && "alirogpt"}`}>
                <div className="chat-message-center">
                        {message.user == 'assistant' ? (
                            <div className="avatar alirogpt">
                                <div>AI</div>
                            </div>
                        ) : (
                            <div className="avatar">
                                <div>You</div>
                            </div>
                        )}
                        <div className="message">
                            <div>{message.message}</div>
                        </div>
                            {
                    hasButtons === true && message.buttons.map(
                        (item, index) =>
                        
                        // when index is 0
                        index === "" ? (
                            // console.log("index is 0",item)
                            <div>{item}: </div>
                        ) : (
                            <div
                                className="chat-button"
                                //style="margin-right: 10px;"
                                style={{'margin-right':"10px"}}
                                key={index}
                                onClick={selectButton}
                                data-messageid={message.messageid}
                                >
                                {item.includes('(suggested)') ? (
                                    <span>
                                    {/* <FontAwesomeIcon icon={faThumbsUp} style={{"float":"left","margin-right":"5px"}}/> */}
                                    {item.replace('(suggested)', '')}
                                    </span>
                                ) : item}
                            </div>
                        )
                    )

                    // show image
                } 
                    </div>
                </div>
        );
    }else if(message.messageType === "showMLpElement"){
        
      // get balancedAccList from local storage
      let balancedAccList = JSON.parse(localStorage.getItem('balancedAccList'));
      
      // get precisionList from local storage
      let precisionList = JSON.parse(localStorage.getItem('precisionList'));
    
      // get aucList from local storage
      let aucList = JSON.parse(localStorage.getItem('aucList'));

      // recallList from local storage
      let recallList = JSON.parse(localStorage.getItem('recallList'));

      // f1List from local storage
      let f1List = JSON.parse(localStorage.getItem('f1List'));

      // get rocCurve from local storage
      let rocCurve = localStorage.getItem('rocCurve');

        return (
            <div>
                <div className="message chartchat">
                            <Grid columns={2} stackable="stackable">
                                <Grid.Row>
                                    <Grid.Column>
                                        <AlgorithmDetails
                                            algorithm={experiment.data.algorithm}
                                            params={experiment.data.params}/>
                                        <RunDetails
                                            startTime={experiment.data.started}
                                            finishTime={experiment.data.finished}
                                            launchedBy={experiment.data.launched_by}/>
                                        
                                        
                                        
                                        <LearningCurveJSON
                                            scoreName="Learning Curve"
                                            train_sizes={experiment.data.train_sizes}
                                            train_scores={experiment.data.train_scores}
                                            test_scores={experiment.data.test_scores}
                                            chartKey="learning_curve_chat"
                                            chartColor="#55D6BE"
                                            type="classification"/>
                                        

                                        <ConfusionMatrixJSON
                                            scoreName="Confusion Matrix"
                                            cnf_data={experiment.data.cnf_matrix}
                                            chartKey="test_chart_chat"
                                            chartColor="#55D6BE"
                                            type="classification"/>
                                        
                                        
                                    </Grid.Column>
                                    
                                    <Grid.Column>
                                    <Score
                                        scoreName="Balanced Accuracy"
                                        scoreValueList={balancedAccList}
                                        chartKey="all"
                                        chartColor="#7D5BA6"
                                        type="classification"
                                        />
                                        <Score
                                        scoreName="AUC"
                                        scoreValueList={aucList}
                                        chartKey="auc_scores"
                                        chartColor="#55D6BE"
                                        type="classification"
                                        />
                                        <Score
                                        scoreName="Precision"
                                        scoreValueList={precisionList}
                                        chartKey="precision_scores"
                                        chartColor="#55D6BE"
                                        type="classification"
                                        />
                                        <Score
                                        scoreName="Recall"
                                        scoreValueList={recallList}
                                        chartKey="recall_scores"
                                        chartColor="#55D6BE"
                                        type="classification"
                                        />
                                        <Score
                                        scoreName="F1 Score"
                                        scoreValueList={f1List}
                                        chartKey="f1_scores"
                                        chartColor="#55D6BE"
                                        type="classification"
                                        />
                                    </Grid.Column>
                                </Grid.Row>
                                
                            </Grid>
                        </div>
            </div>
        );
    }else if(message.messageType === "showEDAElement"){

        
      // get class_percentage from local storage
      let class_percentage = JSON.parse(localStorage.getItem('class_percentage'));

              // get shapSummaryCurveDict
        let shapSummaryCurveDict = JSON.parse(localStorage.getItem('shapSummaryCurveDict'));

      // get shap_explainer
        let shap_explainer = localStorage.getItem('shap_explainer');

      // get shap_num_samples
        let shap_num_samples = localStorage.getItem('shap_num_samples');
        return(
            <div className="message chartchat">                
                <Grid columns={2} stackable="stackable">                   
                    <Grid.Row>
                        <Grid.Column>
                            
                            <ImportanceScoreJSON
                                scoreName="Feature Importance"
                                scoreValueList={experiment.data.feature_importances}
                                featureList={experiment.data.feature_names}
                                chartKey="importance_score_chat"
                                chartColor="#55D6BE"
                                type="classification"/>
                            
                            
                            <PCAJSON
                                scoreName="PCA 2D"
                                Points={experiment.data.X_pca}
                                Labels={experiment.data.y_pca}
                                chartKey="pca_2d_chat"
                                chartColor="#55D6BE"
                                type="classification"/>
                            
                            <TSNEJSON
                                scoreName="TSNE 2D"
                                Points={experiment.data.X_tsne}
                                Labels={experiment.data.y_tsne}
                                chartKey="tsne_2d_chat"
                                chartColor="#55D6BE"
                                type="classification"/>
                            
                        </Grid.Column>
                        
                        <Grid.Column>
                            
                            <ClassRate
                                scoreName="Class Rate"
                                scoreValueList={class_percentage}
                                chartKey="class_rate_chat"
                                chartColor="#55D6BE"
                                type="classification"
                            />
                            
                            
                                <ShapSummaryCurve
                                fileDict={shapSummaryCurveDict}
                                shap_explainer={shap_explainer}
                                shap_num_samples={shap_num_samples} />


                            

                        </Grid.Column>
                        
                    </Grid.Row>
                </Grid>
            </div>
        )
    }
    return (
        <div className={`chat-message ${message.user}`}>
            <div className="chat-message-text">
                {message.message}
            </div>
        </div>

    )
}

export default ChatBox







