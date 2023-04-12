import AISVGLogo from './AISVGLogo'
import React from 'react';
// import {useState, useEffect} from "react";
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { faThumbsUp } from '@fortawesome/free-solid-svg-icons'

// Primary Chat Window
const ChatBox = ({chatLog, setChatInput, handleSubmit, chatInput,  modeForChatOrCodeRunning, setModeForChatOrCodeRunning,datasetId,experimentId, updateAfterRuningCode}) => <section className="chatbox">
    <div className="chat-log">
        {
            chatLog.map(
                (message, index) => (
                    <ChatMessage key={index} 
                    message={message}
                    datasetId={datasetId}
                    experimentId={experimentId}
                    updateAfterRuningCode={updateAfterRuningCode}
                />)
            )
        }
    </div>




    

    <div className="chat-input-holder">
        
            {/* toggle button for chat mode or coding mode */}
  
            {/* <button className="toggle-button-chat-code" onClick={
                        (e)=>{

                            if (e.target.textContent === "chat mode") {
                                setModeForChatOrCodeRunning("code")
                                //  background:
                                e.target.style.background = "#ae5211";
                            } else {
                                setModeForChatOrCodeRunning("chat")
                                e.target.style.background = "#2185D0";
                            }

                        }
                    }>{modeForChatOrCodeRunning} mode
            </button> */}
        

        <form className="chatSubmitForm" onSubmit={handleSubmit}>

            <input
                rows="1"
                value={chatInput}
                onChange={(e) => 
                    setChatInput(e.target.value)
                }
                className="chat-input-textarea"
                placeholder="Type your message here. "
                ></input>
            <button className="submit" type="submit">Submit</button>
        </form>

        
    </div>
</section>

// Individual Chat Message
const ChatMessage = ({message,datasetId,experimentId,updateAfterRuningCode}) => {
    // console.log("message-ChatMessage", message)
    // console.log("message-ChatMessage.message", message.message)
    // console.log("message-ChatMessage.message.length", message.message.length)

    let codeIncluded = checkIncludeCode(message.message)
    let extractedCode = extractCodeFromMess(message.message)

    console.log("codeIncluded-checkIfCode", codeIncluded)
    console.log("extractedCode-checkIfCode", extractedCode)

    // Nick's code
    // const regex = /```([^`]*)```/g;
    // const matches = messageFromOpenai.matchAll(regex);

    // for (const match of matches) {
    //     //check if the first 6 characters are python
    //     if(match[1].substring(0,6) === "python"){
    //         //remove the first 6 characters
    //         match[1] = match[1].substring(6);
    //     }
    //     // console.log("python code:",match[1]);
    // }

    // message: messageFromOpenai.split(/\n/).map(
    //     line => 
    //     <div key={line}>
    //     {line}</div>
    // )


    




    async function runExtractedCode(code,datasetId,experimentId) {
        // POST http://localhost:5080/execapi/v1/executions/experiment/6431c4a9df7aa3004a1b8e18
        // Content-Type: application/json

        // {
        //   # "src_code": "import csv\n\ndata = [\n    ['Name', 'Age', 'Gender'],\n    ['Alice', 25, 'Female'],\n    ['Bob', 30, 'Male'],\n    ['Charlie', 35, 'Male'],\n    ['David', 40, 'Male'],\n]\n\nfilename = 'test.csv'\nfilepath = ''\n\nwith open(filepath + filename, mode='w', newline='') as file:\n    writer = csv.writer(file)\n    writer.writerows(data)\n\nprint(f'CSV file {filename} has been created and saved to {filepath}.')",
        //   "dataset_id": "6431c4a6df7aa3004a1b8e17",
        // }

        let resultFromRuningCode= await fetch(`/execapi/v1/executions/experiment/${experimentId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "src_code": code,
                "dataset_id": datasetId,
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log("response-data-result", data['result'])
            return data;
        })
        .catch(error => {
            console.log("runExtractedCode-fetch-error", error)
            return error;
        })


        return resultFromRuningCode;
        
        


        

        


    }

    function checkIncludeCode(message) {

        console.log("message-checkIncludeCode", message)
        let codeIncluded = false;
        if (message.includes("```")) {
            codeIncluded = true;
        }
        return codeIncluded
    }

    function extractCodeFromMess(message) {


        let code = "";
        const regex = /```([^`]*)```/g;
        const matches = message.matchAll(regex);

        for (const match of matches) {
            console.log("match-extractCodeFromMess", match)
            //check if the first 6 characters are python
            if(match[1].substring(0,6) === "python"){
                //remove the first 6 characters
                match[1] = match[1].substring(6);
            }
            console.log("python code:",match[1]);
            code = match[1];

        }

        return code;

        



        // const code = match[1];

        // console.log("extractCode",code);

        // console.log("match-extractCodeFromMess[0]", match[0]);
        // console.log("match-extractCodeFromMess[1]", match[1]);

        // for 

        // return code;

    }
    







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
                {/* origin */}
                {/* <div className="message">
                        {message.message}
                </div>  */}


                {/* In this case, it shows normal string message. */}
                {/* if code is false then show  */}
                {
                    codeIncluded === false ?
                    <div className="message">
                        {/* origin */}
                        {/* {message.message} */}


                        

                        {/* v5 */}
                        {/* {
                            message.message.split(/\n/).map(line => {
                                if (line.includes("http")) {
                                  return (
                                    <div style={{ position: 'relative', width: '100%', paddingBottom: '100%' }}>
                                      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                                        <image href={line} height="100%" width="100%" />
                                      </svg>
                                    </div>
                                  );
                                } else {
                                  return (
                                    <div>
                                      {line}
                                    </div>
                                  );
                                }
                              })
                        } */}

                        {/* v7 */}
                        {

                            message.message.split(/\n/).map(line => {
                                if (line.includes(".png") && line.includes("http") || line.includes(".jpg") && line.includes("http")) {
                                  return (
                                    <div style={{ position: 'relative', width: '100%', paddingBottom: '100%' }}>
                                      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                                        <image href={line.substring(line.indexOf("http"))} height="100%" width="100%" />
                                      </svg>
                                    </div>
                                  );
                                } else if (line.includes(".csv") && line.includes("http") || line.includes(".tsv") && line.includes("http")) {
                                  return (
                                    <div>
                                      <a href={line.substring(line.indexOf("http"))} download>
                                        Download file
                                      </a>
                                    </div>
                                  );
                                } else {
                                  return (
                                    <div>
                                      {line}
                                    </div>
                                  );
                                }
                              })
                        }
                    </div> : 
                    <div className="message code">
                        {/* <pre>
                            <code>
                                {message.message}
                            </code>
                        </pre> */}


                        {/* {
                            message.message.split(/\n/).map(
                                line =>
                                <div>
                                    {line}
                                </div>
                            )
                        } */}

                        <div style={{ width: '100%', overflowX: 'auto' }}>
                        <pre style={{ margin: 0 }}>
                            <code style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                            {
                                message.message.split(/\n/).map((line, index) => {
                                return (
                                    <div className={`line-${index % 2 === 0 ? 'even' : 'odd'}`}>
                                    {line}
                                    </div>
                                );
                                })
                            }
                            </code>
                        </pre>
                        </div>

                        {/* {message.message} */}
                        

                        {/* play button */}
                        <div>
                            <button className="run-code-button" onClick={
                                async (e)=>
                                {
                                    // extractedCode="df_new = df.head(50)\ndf_new.to_csv('iris_new.csv')"
                                    let resp = await runExtractedCode(extractedCode, datasetId,experimentId)

                                    
                                    
                                    updateAfterRuningCode(e, resp)
                                    
                                    
                                


                                }
                            }>
                                Run

                                    {/* <p>
                                        {extractedCode.code}{' '}
                                    
                                    </p> */}
                                    
                            </button>
                        </div>
                    </div>
                }

                
                


                
                {/* advanced version to present code */}

                {/* if code is true then show  */}
                {/* this below is the exmaple.*/}

                {/* Step 1: Import the required modules

                You will need the urllib and beautifulSoup modules to crawl and parse web pages, respectively. You can use the following code to import these modules:

                ```
                import urllib.request
                from bs4 import BeautifulSoup
                ```import { element } from '../../../dist/vendors.a08b12698240f370fc2c';


                Step 2: Define the website to crawl */}

                {/* {
                    codeIncluded &&
                    message.message.split("```").map((message, index) => {
                        console.log("message-inside", message)
                        
                    }
                    )
                } */}

            </div>
        </div>
    )
}


const codeMessage = (message) => {
    return(
        <div className="message code">
            <pre>
                <code>
                    {message}
                </code>
            </pre>
        </div>
    )
}

export default ChatBox




