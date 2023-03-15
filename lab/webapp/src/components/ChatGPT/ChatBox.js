// Nick's ChatBox component
import AISVGLogo from './AISVGLogo'
import React from 'react';
import {useState, useEffect} from "react";
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { faThumbsUp } from '@fortawesome/free-solid-svg-icons'

// Primary Chat Window
const ChatBox = ({chatLog, setChatInput, handleSubmit, chatInput}) => <section className="chatbox">
    <div className="chat-log">
        {
            chatLog.map(
                (message, index) => (<ChatMessage key={index} message={message}/>)
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
const ChatMessage = ({message}) => {
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
                <div className="message">
                    {message.message}
                </div>
            </div>
        </div>
    )
}

export default ChatBox