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
const ChatBox = ({chatLog, setChatLog, setChatInput, handleSubmit, chatInput, experiment}) => <section className="chatbox">
    <div className="chat-log">
        {
            chatLog.map((message, index) => (
                <ChatMessage
                    key={index}
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

// Individual Chat Message
const ChatMessage = ({message, chatLog, setChatLog, setChatInput, experiment}) => {
    // check message.message includes "success":true if true, split message.message
    // using "," message.message.includes("success\":true") &&
    // console.log(message.message.split(","))


    // ml performance charts
    const [showMLpElement, setshowMLpElement] = useState(false);

    // eda charts
    const [showEDAElement, setshowEDAElement] = useState(false);

    useEffect(() => {
        setTimeout(function () {
          setshowMLpElement(true);
        }, 6000);
      }, []);

    
    useEffect(() => {
        setTimeout(function () {
            setshowEDAElement(true);
        }, 12000);
    }, []);





    const [resp, setResp] = useState([""]);
    var booleanForSuccess = message
    .message
    .includes("success\":true");
    var booleanForMessage = message
        .message
        .includes("message\":");
    let chat_message = '';
    if(booleanForMessage === true){
        let parsed = JSON.parse(message.message);
        let keys = Object.keys(parsed.data);
        chat_message = parsed.data[keys[0]].message;
    }
    let buttons = [];
    var booleanForButtons = message
    .message
    .includes("buttons\":");
    if(booleanForButtons === true){
        let parsed = JSON.parse(message.message);
        let keys = Object.keys(parsed.data);
        buttons = parsed.data[keys[0]].buttons;
    }
    
    var messageid = message.messageid;
    console.log(messageid);
    let image_loc = '';
    var booleanForImage = message
        .message
        .includes(".png")
    if(booleanForImage === true){
        let parsed = JSON.parse(message.message);
        let keys = Object.keys(parsed.data);
        image_loc = parsed.data[keys[0]].image;
    }

    var booleanForCharts = false;
    // var buttonClicked = false;
    // if localStorage.getItem("buttonClicked") is not null
    // then set booleanForCharts to true
    if(localStorage.getItem("buttonClicked") !== null){

        booleanForCharts = localStorage.getItem("buttonClicked");
    }

    console.log("booleanForCharts", booleanForCharts);



    // create function that sends an api call
    let api_call = (api_id) => {
        let username = "me";
        fetch('http://localhost:8000/api/'+api_id).then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP error: ${response.status}`);
            }
            return response.text();
        }).then((text) => {
            setResp(text);

            // console.log("text", text) json
            let parsed = JSON.parse(text);
            //get parsed.data keys
            let keys = Object.keys(parsed.data)
            console.log(keys[0]);
            if(keys[0] == "AI"){
                username = "gpt"
            }
            console.log(text);
            setTimeout(() => {

                chatLog = [
                    ...chatLog, {
                        user: username,
                        messageid: `${api_id}`,
                        message: `${text}`
                    }
                ]
                setChatLog(chatLog);
                console.log(username);
                if (username == 'gpt'){
                    api_call(api_id+1);
                }
            }, 1000);
            
        })
        
    }
    
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


    booleanForSuccess = true 
    booleanForMessage = false
    booleanForButtons = true




    buttons= ["Select algorithm","Decision Tree Classifier", "Gradient Boosting Classifier","K Neighbors Classifier", "SVC", "Logistic Regression", "Random Forest Classifer"]



    var hypOne = ["Select hyperparameters","hyperparameter1", "hyperparameter2", "hyperparameter3", "hyperparameter4", "hyperparameter5"];




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

        // get class_percentage from local storage
        let class_percentage = JSON.parse(localStorage.getItem('class_percentage'));


        // get rocCurve from local storage
        let rocCurve = localStorage.getItem('rocCurve');


        // get shapSummaryCurveDict
        let shapSummaryCurveDict = JSON.parse(localStorage.getItem('shapSummaryCurveDict'));

        // get shap_explainer
        let shap_explainer = localStorage.getItem('shap_explainer');

        // get shap_num_samples
        let shap_num_samples = localStorage.getItem('shap_num_samples');

    
    


    return (
        <>
            {/* ml algorithms */}
            <div className={`chat-message ${message.user === "gpt" && "alirogpt"}`}>
                <div className="chat-message-center">
                    <div className={`avatar ${message.user === "gpt" }`}>
                        {
                            message.user === "gpt"
                                ? <div>You</div>
                                : <div>You</div>
                        }
                    </div>

                    {/* for normal chat */}
                    {
                        // message.user = 'me'
                    }
                    
                    <div className="message">
                        {booleanForSuccess === false&& booleanForImage==false && message.message}

                    </div>
                    {
                        booleanForSuccess === true && booleanForMessage === true && <div>{chat_message}</div>
                    }
                    {/* for buttons */}
                    {
                        booleanForSuccess === true && booleanForMessage === false && booleanForButtons === true && buttons.map(
                            (item, index) =>
                            
                            // when index is 0
                            index === 0 ? (
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
            {/* <div style={{ display: (showing ? 'block' : 'none') }}>This is visible</div> */}


            {/* hyperparameters */}
            <div className={`chat-message ${message.user === "gpt" && "alirogpt"}`}>
                <div className="chat-message-center">
                    <div className={`avatar ${message.user === "gpt" }`}>
                        {
                            message.user === "gpt"
                                ? <div>You</div>
                                : <div>You</div>
                        }
                    </div>

                    {/* for normal chat */}
                    {
                        // message.user = 'me'
                    }
                    
                    <div className="message">
                        {booleanForSuccess === false&& booleanForImage==false && message.message}

                    </div>
                    {
                        booleanForSuccess === true && booleanForMessage === true && <div>{chat_message}</div>
                    }
                    {/* for buttons */}
                    {
                        booleanForSuccess === true && booleanForMessage === false && booleanForButtons === true && hypOne.map(
                            (item, index) =>
                            
                            // when index is 0
                            index === 0 ? (
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




            {/* ai message: Let's see the model performance */}

            <div>
                {showMLpElement ? (
                <div className="chat-message false">
                    <div className="chat-message-center">
                        <div className="avatar alirogpt">
                            <div>AI</div>
                        </div>
                        <div className="message">Let's see the model performance and other information.</div>

                        
                        
                    </div>
                </div>
                ) : (
                <div></div>
                )}{" "}
            </div>
            


            


            {/* Charts for ml performance*/}
            

            <div>
                {showMLpElement ? (
                <div className="chat-message false">
                    <div className="chat-message-center">
                        <div className="avatar alirogpt">
                            <div>AI</div>
                        </div>

                        

                        <div className="message">
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
                                {showEDAElement ? (
                                
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
                                ) : (
                                <div></div>
                                )}{" "}
                            </Grid>
                        </div>
                        
                        
                        
                    </div>
                </div>
                ) : (
                <div></div>
                )}{" "}
            </div>


            {/* ai message: Let's see the EDA */}
            {/* <div>
                {showEDAElement ? (
                <div className="chat-message false">
                    <div className="chat-message-center">
                        <div className="avatar alirogpt">
                            <div>AI</div>
                        </div>
                        <div className="message">Let's see EDA.</div>
                        
                        
                    </div>
                </div>
                ) : (
                <div></div>
                )}{" "}
            </div> */}



            {/* test & Charts for eda*/}
            {/* <div>
                {showEDAElement ? (



                <div className="chat-message false">
                    <div className="chat-message-center">
                        <div className="avatar alirogpt">
                            <div>AI</div>
                        </div>

                        <div className="message">
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


                                        <TSNEJSON
                                            scoreName="TSNE 2D"
                                            Points={experiment.data.X_tsne}
                                            Labels={experiment.data.y_tsne}
                                            chartKey="tsne_2d_chat"
                                            chartColor="#55D6BE"
                                            type="classification"/>

                                    </Grid.Column>
                                    
                                </Grid.Row>
                            </Grid>
                        </div>
                        
                        
                        
                    </div>
                </div>

                

                

                ) : (
                <div></div>
                )}{" "}
            </div> */}


            {/* <div>
                <p>Hello</p>
                <Builder />
            </div> */}


    


        </>
    )
}

export default ChatBox







