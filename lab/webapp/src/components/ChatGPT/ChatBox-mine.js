import AISVGLogo from './AISVGLogo'
import React from 'react';
import {useState} from "react";
// import Results from '../Results';
import ImportanceScoreJSON from '../Results/components/ImportanceScoreJSON';
import ClassRate from '../Results/components/ClassRate';
import Builder from '../Builder';
import {Header, Grid, Loader, Dropdown, Menu} from 'semantic-ui-react';
import AlgorithmDetails from '../ResultsV2/components/AlgorithmDetails';
import RunDetails from '../ResultsV2/components/RunDetails';
import ImportanceScore from '../ResultsV2/components/ImportanceScore';
import LearningCurve from '../ResultsV2/components/LearningCurve';
import PCA from '../ResultsV2/components/PCA';
import LearningCurveJSON from '../Results/components/LearningCurveJSON';
import PCAJSON from '../Results/components/PCAJSON';
import ConfusionMatrixJSON from '../Results/components/ConfusionMatrixJSON';
import TSNEJSON from '../Results/components/TSNEJSON';



import configStore from '../../config/configStore';
import configSocket from '../../config/configSocket';
import Root from '../Root';
import { Provider } from 'react-redux';
import { Router, Route, IndexRedirect, hashHistory } from 'react-router';
import App from '../App';

import ReactDOM from 'react-dom';

const store = configStore();
configSocket(store);

// Primary Chat Window
const ChatBox = ({chatLog, setChatInput, handleSubmit, chatInput, experiment}) => <section className="chatbox">
    <div className="chat-log">
        {
            chatLog.map(
                (message, index) => (<ChatMessage key={index} message={message} experiment={experiment}/>)
            )
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
const ChatMessage = ({message, experiment}) => {
    // check message.message includes "success":true if true, split message.message
    // using "," message.message.includes("success\":true") &&
    // console.log(message.message.split(","))
    var booleanForMessage = message
        .message
        .includes("success\":true")
    var messageArray = message
        .message
        .split(",")

    // remove first element
    messageArray.shift()

    
    // const root = ReactDOM.createRoot(document.getElementById('root'));
    // root.render(
    //     <div >
    //         <p>choi!</p>
    //     </div>
    // );
        

    


    //   get availableAlgorithms from local storage





    return (
        <div className={`chat-message ${message.user === "gpt" && "alirogpt"}`}>
            <div className="chat-message-center">
                <div className={`avatar ${message.user === "gpt" && "alirogpt"}`}>
                    {
                        message.user === "gpt"
                            ? <AISVGLogo/>
                            : <div>You</div>
                    }
                </div>

                {/* for normal chat */}
                <div className="message">
                    {booleanForMessage === false && message.message}
                    <div>
                        {/* <ImportanceScoreJSON
                  scoreName="Feature Importance"
                  scoreValueList={[0.1, 0.2, 0.3, 0.4]}
                  featureList={['review', 'rating', 'price', 'brand']}
                  chartKey="importance_score_chat"
                  chartColor="#55D6BE"
                  type="classification"
                /> */
                        }
                    </div>

                    <div>
                    {/* https://react-redux.js.org/using-react-redux/connect-mapstate */}

                       


                        {/* <div id="hello">
                            <Builder/>
                            <p>HELLLOOOOO!!!</p>
                        </div> */}


























      

                        
                        <Grid columns={3} stackable="stackable">
                            <Grid.Row>
                                <Grid.Column>
                                    <AlgorithmDetails
                                        algorithm={experiment.data.algorithm}
                                        params={experiment.data.params}/>
                                    <RunDetails
                                        startTime={experiment.data.started}
                                        finishTime={experiment.data.finished}
                                        launchedBy={experiment.data.launched_by}/> {/* <ImportanceScore file={importanceScore} /> */}
                                    <ImportanceScoreJSON
                                        scoreName="Feature Importance"
                                        scoreValueList={experiment.data.feature_importances}
                                        featureList={experiment.data.feature_names}
                                        chartKey="importance_score_chat"
                                        chartColor="#55D6BE"
                                        type="classification"/> {/* <LearningCurve file={learningCurve}/> */}
                                    <LearningCurveJSON
                                        scoreName="Learning Curve"
                                        train_sizes={experiment.data.train_sizes}
                                        train_scores={experiment.data.train_scores}
                                        test_scores={experiment.data.test_scores}
                                        chartKey="learning_curve_chat"
                                        chartColor="#55D6BE"
                                        type="classification"/> {/* <PCA file={pca}/> */}
                                    <PCAJSON
                                        scoreName="PCA 2D"
                                        Points={experiment.data.X_pca}
                                        Labels={experiment.data.y_pca}
                                        chartKey="pca_2d_chat"
                                        chartColor="#55D6BE"
                                        type="classification"/> {/* <TSNE file={tsne}/> */}
                                    {/* <TSNEJSON file={tsne_json}/> */}
                                    {/* <TSNEJSON scoreName="TSNE 2D"
                  Points={experiment.data.X_tsne}
                  Labels={experiment.data.y_tsne}
                  chartKey="tsne_2d"
                  chartColor="#55D6BE"
                  type="classification"
                /> */
                                    }
                                </Grid.Column>
                                <Grid.Column>
                                    {/* <NoScore
                  scoreName="Class Rate"
                  scoreValueList={class_percentage}
                  chartKey="test"
                  chartColor="#55D6BE"
                  type="classification"
                /> */
                                    }

                                    {/* <ConfusionMatrix file={confusionMatrix} /> */}
                                    {/* This TestChart is for interactive and responsive confusion matrix */}
                                    <ConfusionMatrixJSON
                                        scoreName="Confusion Matrix"
                                        cnf_data={experiment.data.cnf_matrix}
                                        chartKey="test_chart_chat"
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

                                   

                                </Grid.Column>
                            </Grid.Row>
                        </Grid>




                        
                    </div>

                    <div>

                        {/* call Builder componenet with props */}
                        {/* <Builder /> */}

                    </div>

                </div>

                {/* for buttons */}
                {
                    booleanForMessage === true && messageArray.map(
                        (item, index) =>
                        // <div className="message" key={index}>     {item} </div> buttons
                        <div className="side-menu-button" key={index}>
                            <span></span>
                            {item}
                        </div>

                    )

                }

                {/* {
                booleanForMessage === true && messageArray.map(
                    (item, index) =>

                    setInterval(() => {

                    <div className="message" key={index}>
                        {item}
                    </div>
                    }, 100 * index)
                )
            } */
                }

            </div>
        </div>
    )
}

export default ChatBox