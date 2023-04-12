import AISVGLogo from './AISVGLogo'
import React from 'react';
// import {useState, useEffect} from "react";
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { faThumbsUp } from '@fortawesome/free-solid-svg-icons'

// Primary Chat Window
const ChatBox = ({chatLog, setChatInput, handleSubmit, chatInput,  modeForChatOrCodeRunning, setModeForChatOrCodeRunning , extractedCode}) => <section className="chatbox">
    <div className="chat-log">
        {
            chatLog.map(
                (message, index) => (
                    <ChatMessage key={index} 
                    message={message} 
                    extractedCode={extractedCode}
                
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
const ChatMessage = ({message, extractedCode}) => {
    console.log("message-ChatMessage", message)
    // if message.message includes ``` then it is code
    let codeIncluded = false;
    
    // check each  message.message[i] includes("```")

    // for (let i = 0; i < message.message.length; i++) {
    //     console.log("message.message[i]", message.message[i])
    //     // if (message.message[i].includes("```")) {
    //     //     codeIncluded = true;
    //     // }
    // }
    
    console.log("message-ChatMessage.message", message.message)
    console.log("message-ChatMessage.message.length", message.message.length)
    //  type of message.message
    console.log("message-ChatMessage.message.typeof", typeof message.message)
    // key is the index of the array


    // codeIncluded = true
    // if (message.message.includes("```")) {

    // let tempcode= message.message.split("```")
    // let tempcode= message.message.split("\n")
    // console.log("tempcode", tempcode)

    // console.log("extractedCode.code", extractedCode.code)

    // extract code from message.message 
    // let code = message.message.split("```")[1] is wrong because it will only extract the first code
    // therefore we need to use map to extract all the code
    // let code = message.message.split("```").map((message, index) => {
        // check message is code or not


    async function runExtractedCode(code) {
        // console.log("e.target.textContent", e.target.textContent)
        // example code
        let response = await fetch("https://www.boredapi.com/api/activity")
        

        console.log("1. response-code", response)
        console.log("2. code-code", code)

        if (response.status == "200") {
                                
            console.log("2-1.resp.status", response.status)
            // console.log("2-2. e", e)
        } 

        return response


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
                {/* In this case, it shows normal string message. */}
                {/* if code is false then show  */}
                {
                    !codeIncluded &&
                    <div className="message">
                        {message.message}
                    </div>
                }

                
                
                {/* simple version to present code */}
                {
                    codeIncluded &&
                    <div className="message code">
                        <pre>
                            <code>
                                {message.message}
                            </code>
                        </pre>
                        

                        {/* {message.message} */}
                        
                        {/* play button */}
                        <div>
                        <button className="run-code-button" onClick={async (e)=>
                            {
                                // show me extractedCode
                                // e.target.textContent = "running" + "..." ;

                                // make runExtractedCode(extractedCode.code) run first and then show "Completed" using promise

                                console.log("0. e", e)

                            


                                let resp = await runExtractedCode(extractedCode.code)

                                // make e.target.textContent = "Completed" after runExtractedCode(extractedCode.code) is done

                                

                                console.log("3.runExtractedCode-resp", resp)

                                if (resp.status == "200") {
                                
                                    console.log("4.resp.status", resp.status)
                                    console.log("5. e", e)
                                } 
                                
                            


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
                ```

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


const codeMessage = (message, extractedCode) => {
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




