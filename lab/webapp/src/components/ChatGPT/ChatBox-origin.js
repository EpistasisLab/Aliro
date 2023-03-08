import AISVGLogo from './AISVGLogo'
import React from 'react';
import {useState} from "react";

// Primary Chat Window
const ChatBox = ({chatLog, setChatLog, setChatInput, handleSubmit, chatInput}) => <section className="chatbox">
    <div className="chat-log">
        {
            chatLog.map((message, index) => (
                <ChatMessage
                    key={index}
                    message={message}
                    chatLog={chatLog}
                    setChatLog={setChatLog}
                    setChatInput={setChatInput}/>
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
const ChatMessage = ({message, chatLog, setChatLog, setChatInput}) => {
    // check message.message includes "success":true if true, split message.message
    // using "," message.message.includes("success\":true") &&
    // console.log(message.message.split(","))
    var booleanForMessage = message
        .message
        .includes("success\":true")

    // var booleanForMessage = false

    var booleanForImage = message
        .message
        .includes(".png")

    var firstbooleanForImage = message
        .message
        .includes("screenshot1")

    var secondbooleanForImage = message
        .message
        .includes("screenshot2")
    
    var thirdbooleanForImage = message
        .message
        .includes("screenshot3")


    // console.log("booleanForImage: ", booleanForImage)


    console.log('thirdbooleanForImage',thirdbooleanForImage)

    // var booleanForImage = true

    var messageArray = message
        .message
        .split(",")

    // remove first element
    // messageArray.shift()
    // remove "data":[{"buttons":[" string from messageArray

    for (let i = 0; i < messageArray.length; i++) {
        // console.log(messageArray[i])

        // remove data from messageArray[i]

        messageArray[i] = messageArray[i].replace('"data"', "");

        messageArray[i] = messageArray[i].replace(':[{',"")

        messageArray[i]  =messageArray[i].replace('"buttons"',"")
        messageArray[i] = messageArray[i].replace(":[", '')
        messageArray[i] = messageArray[i].replace("]}]}", '')

        messageArray[i] = messageArray[i].replace('"', '')
        messageArray[i] = messageArray[i].replace('"', '')


      }





    return (
        <div className={`chat-message ${message.user === "gpt" && "alirogpt"}`}>
            <div className="chat-message-center">
                <div className={`avatar ${message.user === "gpt" && "alirogpt"}`}>
                    {
                        message.user === "gpt"
                            ?<AISVGLogo/>
                            : <div>You</div>
                    }
                </div>

                {/* for normal chat */}
                <div className="message">
                    {booleanForMessage === false&& booleanForImage==false && message.message}

                </div>

                {/* for buttons */}
                {
                    
                    booleanForMessage === true && messageArray.map(
                        (item, index) =>
                        // <div className="message" key={index}>     {item} </div> buttons do not print
                        // when index is 0
                        index !== 0 && <div
                            className="side-menu-button"
                            //style="margin-right: 10px;"
                            style={{'margin-right':"10px"}}
                            key={index}
                            
                            >
                            <span></span>
                            {item}
                        </div>

                    )

                    // show image
                } {/* {
                booleanForMessage === true && messageArray.map(
                    (item, index) =>

                    setInterval(() => {

                    <div className="message" key={index}>
                        {item}
                    </div>
                    }, 100 * index)

                )

            } */
                } {
                    firstbooleanForImage === true && <div >
                            {/* <img src={require('./screenshot1.png')} height="600" width="700"/> */}
                        </div>
                }

                {
                    secondbooleanForImage === true && <div >

                            {/* <img src={require('./screenshot2.png')} height="600" width="700"/> */}
                        </div>
                }

                {
                    thirdbooleanForImage === true && <div >
                             {/* <img src={require('./screenshot3.png')} height="250" width="800"/> */}
                        </div>
                }

                </div>
        </div>
    )
}

export default ChatBox