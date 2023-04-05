// import "./normal.css"; import "./ChatGPT.css";
import {useState, useEffect} from "react";
import React from 'react';
import SideMenu from "./SideMenu";
import ChatBox from "./ChatBox";
import { locales } from 'moment';



export default function ChatGPT({experiment}) {

    var limitNumChatBox = 5;

    useEffect(() => {
        
        
        // getEngines();

        initailChatBoxSetting();
        getAllChatsFilterbyExpIdSetChatbox();
        setLanModelReset(true);
       
    }, 
    // make useEffect run when numChatBox changes or when experimentId changes
    // [numChatBox],
    [window.location.href],
    // [experimentId],
    )


    const [chatInput, setChatInput] = useState("");
    const [models, setModels] = useState([]);
    const [temperature, setTemperature] = useState(0.5);
    // language model
    // const [currentModel, setCurrentModel] = useState("text-davinci-003");
    const [currentModel, setCurrentModel] = useState("gpt-3.5-turbo");

    // initial chat box setting
    const [chatLog, setChatLog] = useState([
        {
            user: "gpt",
            message: "How can I help you today?"
        }
    ]);



    // this is the number of chat boxes in the result page
    const [numChatBox, setNumChatBox] = useState(1);

    // this is the current chat box id where user is typing
    const [chatCurrentTempId, setChatCurrentTempId] = useState(1);

    // const [testID, setTestID] = useState(0);
    // true or false trigger for chat box


    // language model reset
    // This is a boolean value that indicates whether the language model should be reset
    // when user moves to a new experiment or new chat box, the lanModelReset should be true
    const [lanModelReset, setLanModelReset] = useState(false);

    // current experiment id
    const [currentExpId, setCurrentExpId] = useState("");

    // modeforchatorcoderuning
    const [modeForChatOrCodeRunning, setModeForChatOrCodeRunning] = useState("chat");

    // extractedCode
    const [extractedCode, setExtractedCode] = useState({
        code: ""
      });


    // clear chats
    function clearChat() {
        setChatLog([]);
    }



    // load all the models
    async function getEngines() {
        // fetch("http://localhost:3080/models")
        await fetch("openai/v1/models")
            .then(res => res.json())
            .then(data => {
                // set models in order alpahbetically
                console.log("data-models", data)
                data
                    .models
                    .data
                    .sort((a, b) => {
                        if (a.id < b.id) {
                            return -1;
                        }
                        if (a.id > b.id) {
                            return 1;
                        }
                        return 0;
                    })
                setModels(data.models.data)
                // console.log("models", data.models.data)
            })
    }


    function checkIfCode(messageFromOpenai) {

            // check if the messageFromOpenai contains python code. for example the messageFromOpenai looks like this: 

            // ```
            // def get_links(soup):
            //     links = []
            //     for link in soup.find_all('a'):
            //         url = link.get('href')
            //         if url.startswith('http'):
            //             links.append(url)
            //     return links
            // ```

            // that is, the messageFromOpenai contains ``` at the beginning and at the end
            
            let booleanCode = false;
            messageFromOpenai.split("\n").forEach(line => {
                console.log("line", line)
                if (line.includes("```")) {
                    booleanCode = true;
                }
            })

            console.log("booleanCode", booleanCode);

            return booleanCode;

    }


    function extractCode(messageFromOpenai) {



        const regex = /```([\s\S]+?)```/;
        const match = regex.exec(messageFromOpenai);
        const code = match[1];

        console.log("extractCode",code);

        console.log("match", match);

        return code;




        /* Step 1: Import the required modules

        You will need the urllib and beautifulSoup modules to crawl and parse web pages, respectively. You can use the following code to import these modules:

        ```
        import urllib.request
        from bs4 import BeautifulSoup
        ```

        Step 2: Define the website to crawl */

        

 
    }












    // ==================== chat api ====================
    function postChats(){

        let url = window.location.href;
        // split url by /
        let urlSplit = url.split("/");
        // console.log("urlSplit", urlSplit);
        let experimentId = urlSplit[urlSplit.length - 1];


        // POST http://localhost:5080/chatapi/v1/chats
        // Content-Type: application/json

        // {
        //     "title" : "Chat with experiment id 2",
        //     "_experiment_id": "63f6e4987c5f93004a3e3ca8",
        //     "_dataset_id": "63f6e4947c5f93004a3e3ca7"
        // }


        fetch("/chatapi/v1/chats", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: "Chat with experiment id " + experimentId,
                _experiment_id: experimentId,
                _dataset_id: experimentId
            })
            })
            .then(res => res.json())
            .then(data => {
                console.log("data--best", data);
            })
            .catch(err => {
                console.log("err--best",err);
            })
    }

    async function getAllChats(){
        // GET http://localhost:5080/chatapi/v1/chats

        await fetch("/chatapi/v1/chats", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            })
            .then(res => res.json())
            .then(data => {
                console.log("allChats", data);

                // for (let i = 0; i < data.length; i++) {
                //     console.log("data[i]['_id']", data[i]['_id']);
                // }


            
                
            })
            .catch(err => {
                console.log("err--best--getAllChats",err);
            })

    }


    // get all chats and filter out the chats that has the same experiment id
    function getAllChatsFilterbyExpIdSetChatbox(){
        // GET http://localhost:5080/chatapi/v1/chats

        fetch("/chatapi/v1/chats", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            })
            .then(res => res.json())
            .then(data => {
                // get the experiment id from the url
                let url = window.location.href;
                let urlSplit = url.split("/");
                let experimentId = urlSplit[urlSplit.length - 1];


                // map to filter out the chats that has the same experiment id 
                let filteredChats = data.map((chat) => {
                    
                    if (chat['_experiment_id'] === experimentId) {
                        return chat;
                    }
                    else {
                        return null;
                    }
                })

                // remove null from filteredChats
                let filteredChatsWithoutNull = filteredChats.filter((chat) => {
                    return chat !== null;
                })

                setNumChatBox(filteredChatsWithoutNull.length);
                setChatCurrentTempId(filteredChatsWithoutNull.length);


                if (filteredChatsWithoutNull.length >=limitNumChatBox )
                {
                    document.getElementById("newchatbutton").style.pointerEvents = "none";
                }


                fetch(`/chatapi/v1/chats/${filteredChatsWithoutNull[filteredChatsWithoutNull.length-1]['_id']}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json"
                    }
                })
                .then(res => res.json())
                .then(data => {
            
                    let chatLogNew = [];
                    
                    // need to change
                    for (let i = 0; i < data["chatlogs"].length; i++) {
                        
                            if (data["chatlogs"][i]["who"]=="user"){
                            chatLogNew = [
                                ...chatLogNew, {
                                    user: data["chatlogs"][i]["who"],
                                    message: data["chatlogs"][i]["message"]
                                }
                            ]
                        }

                        else if (data["chatlogs"][i]["who"]=="gpt"){
                            chatLogNew =[
                                ...chatLogNew, {
                                    user: data["chatlogs"][i]["who"],
                                    // message: `${messageFromOpenai}`
                                    message: data["chatlogs"][i]["message"].split(/\n/).map(line => <div key={line}>{line}</div>)
                                }
                            ]
                        }
                    }

                    setChatLog(chatLogNew);
                    
                })
                .catch(err => {
                    console.log("err--getSpecificChat",err);
                })
            
                



                
            })
            .catch(err => {
                console.log("err--getAllChats",err);
            })

    }








    async function getSpecificChat(chatId){
        // GET http://localhost:5080/chatapi/v1/chats/641e137ac5abc90a3b2b221e

        await fetch(`/chatapi/v1/chats/${chatId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            })
            .then(res => res.json())
            .then(data => {
                // console.log("data--best--getSpecificChat", data);
                // data should be converted to text
                



                let chatLogNew =[
                    {
                        user: "gpt",
                        message: "How can I help you today?"
                    }
                ]

                

                // console.log("data[chatlogs]", data["chatlogs"]);

                // for loop based on the length of data["chatlogs"]
                for (let i = 0; i < data["chatlogs"].length; i++) {
                    
                    chatLogNew = [
                        ...chatLogNew, {
                            user: data["chatlogs"][i]["who"],
                            message: data["chatlogs"][i]["message"]
                        }
                    ]


                }

                console.log("chatLogNew-loop", chatLogNew);

                setChatLog(chatLogNew);



                
                // setTestID(1);   

            })
            .catch(err => {
                console.log("err--best--getSpecificChat",err);
            })

    }

    function patchSpecificChat(chatId, title, experiment_id, dataset_id){ 
    
        // PATCH http://localhost:5080/chatapi/v1/chats/641e31ddb2663354ec5d52b8
        // Content-Type: application/json
        
        // {
        //     "title" : "Chat with experiment id!!!",
        //     "_experiment_id": "63f6e4987c5f93004a3e3ca8",
        //     "_dataset_id": "63f6e4947c5f93004a3e3ca7"
        
        // }

        fetch(`/chatapi/v1/chats/${chatId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: title,
                _experiment_id: experiment_id,
                _dataset_id: dataset_id
            })
            })
            .then(res => res.json())
            .then(data => {
                console.log("data--best--patchSpecificChat", data);
            })
            .catch(err => {
                console.log("err--best--patchSpecificChat",err);
            })

    
    
    }

    function deleteSpecificChat(chatId){
        // DELETE http://localhost:5080/chatapi/v1/chats/641e31ddb2663354ec5d52b8

        fetch(`/chatapi/v1/chats/${chatId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            })
            .then(res => res.json())
            .then(data => {
                console.log("data--best--deleteSpecificChat", data);
            })
            .catch(err => {
                console.log("err--best--deleteSpecificChat",err);
            })

    }
    



    function postInChatlogs(chat_id, message, message_type, who){
        // POST http://localhost:5080/chatapi/v1/chatlogs
        // Content-Type: application/json

        // {
        //     "_chat_id" : "641e137ac5abc90a3b2b221e",
        //     "message" : "Hello there from my desk!!!!!!",
        //     "message_type" : "text",
        //     "who" : "user"
        // }

        fetch("/chatapi/v1/chatlogs", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "_chat_id": chat_id,
                "message": message,
                "message_type": message_type,
                "who": who
            })
            })
            .then(res => res.json())
            .then(data => {
                console.log("data--postInChatlogs", data);
            })
            .catch(err => {
                console.log("err--postInChatlogs",err);
            })




    }


    function patchChatlog(chatlogId, message, message_type, who){
        // PATCH http://localhost:5080/chatapi/v1/chatlogs/641e148dc5abc90a3b2b2221
        // Content-Type: application/json

        // {
        //     "message" : "Hello from cyberspace!",
        //     "message_type" : "text",
        //     "who" : "openai"
        // }

        fetch("/chatapi/v1/chatlogs/641e148dc5abc90a3b2b2221", 
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "message": message,
                    "message_type": message_type,
                    "who": who
                })
            })
            .then(res => res.json())
            .then(data => {
                console.log("data--best--patchChatlog", data);
            }
            )
            .catch(err => {
                console.log("err--best--patchChatlog",err);
            })

    
    }


    function getChatMessage(chat_id){
        // GET http://localhost:5080/chatapi/v1/chats/experiment/641e148dc5abc90a3b2b2221

        fetch(`/chatapi/v1/chats/experiment/${chat_id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            })
            .then(res => res.json())
            .then(data => {
                console.log("data--best--getChatMessage", data);
            }
            )
            .catch(err => {
                console.log("err--best--getChatMessage",err);
            }
            )

    }





    
    // This function post initial chat message (How can I help you?, GPT) to DB
    function initailChatBoxSetting()
    {
        // the experiment id from the url
        let url = window.location.href;
        let urlSplit = url.split("/");
        let experimentId = urlSplit[urlSplit.length - 1];

        // GET http://localhost:5080/chatapi/v1/chats

        fetch("/chatapi/v1/chats", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            })
            .then(res => res.json())
            .then(data => {

                // filter the data by experiment id
                let dataFiltered = data.filter((item) => item._experiment_id === experimentId);

                // any chat id does not exist.
                // there are not any chatbox for this experiment id
                if (dataFiltered.length === 0){
                
                    // POST http://localhost:5080/chatapi/v1/chats
                    // Content-Type: application/json

                    // {
                    //     "title" : "Chat with experiment id 2",
                    //     "_experiment_id": experimentId,
                    //     "_dataset_id": experimentId
                    // }
                    
                    fetch("/chatapi/v1/chats", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            title: "Chat with experiment id " + experimentId,
                            _experiment_id: experimentId,
                            _dataset_id: experimentId
                        })
                        })
                        .then(res => res.json())
                        .then(data => {
                            // there are no chatlogs
                            if (data['chatlogs'].length === 0){

                                // POST http://localhost:5080/chatapi/v1/chatlogs
                                // Content-Type: application/json
                                // {
                                //     "_chat_id" : "642076d7262c19d0be23448b",
                                //     "message" : "How are you?",
                                //     "message_type" : "text",
                                //     "who" : "gpt"
                                // }
                                
                                    fetch("/chatapi/v1/chatlogs", {
                                        method: "POST",
                                        headers: {
                                            "Content-Type": "application/json"
                                        },
                                        body: JSON.stringify({
                                            _chat_id: data._id,
                                            "message": "How can I help you today?",
                                            "message_type": "text",
                                            "who": "gpt"
                                        })
                                    })
                                    .then(res => res.json())
                                    .then(data => {
                                        // console.log("success1")
                                        // get all chats for this experiment id to frontend
                                        getAllChatsFilterbyExpIdSetChatbox();
                                    })
                                    .catch(err => {
                                        console.log("err--postChat",err);
                                    })
                                


                            }
                        })
                    
                
                }



            })
            .catch(err => {
                console.log("err--initailChatBoxSetting",err);
            })  

                

    }

    async function handleSubmit(e) {
        // prevent page from refreshing
        e.preventDefault();

        let url = window.location.href;
        let urlSplit = url.split("/");
        let experimentId = urlSplit[urlSplit.length - 1];


        let chatLogNew =[
            {
                user: "gpt",
                message: "How can I help you today?"
            }
        ]
        

        

        chatLogNew = [
            ...chatLog, {
                user: "me",
                message: `${chatInput}`
            }
        ]

        setChatInput("");
        setChatLog(chatLogNew)


        // GET http://localhost:5080/chatapi/v1/chats/experiment/${experimentId}

        await fetch(`/chatapi/v1/chats/experiment/${experimentId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            })
            .then(res => res.json())
            .then(async data => {
                // console.log("data--best--experiment", data);
                // filter the data using _experiment_id
                var filteredData= data.filter((item) => item._experiment_id === experimentId)

                if (chatCurrentTempId === 0){

                    setChatCurrentTempId(1);
                }

                if (chatInput !== undefined || chatInput !== ""){
                    postInChatlogs(filteredData[chatCurrentTempId-1]['_id'], chatInput, "text", "user");
                }

                const messages = chatLogNew
                .map((message) => message.message)
                .join("\n")

                // get the last message from the chatLogNew array
                let lastMessageFromUser = chatLogNew[chatLogNew.length - 1].message;

                // if (modeForChatOrCodeRunning === "code"){
                //     lastMessageFromUser += " Please give me the python code script. Please put the python code script between ``` and ```. For example, ```print('hello world')```"
                // }

            var feature_importances = {};
            for (var i = 0; i < experiment.data.feature_importances.length; i++) {
                feature_importances[experiment.data.feature_names[i]] = experiment.data.feature_importances[i];
            }

            let preSet =`assume you are a data scientist that only programs in python. You are given a model mod and dataframe df with the following performance:` + `{"params":`+ JSON.stringify(experiment.data.params) +`,"algorithm":`+ experiment.data.algorithm +`,"scores":`+ JSON.stringify(experiment.data.scores) +`feature_importance_type :`+ experiment.data.feature_importance_type +`,"feature_importances":`+ JSON.stringify(feature_importances) +`}` + `\n You are asked: ` + prompt + `\n Given this prompt if you are asked to make a plot, save the plot locally. If you are asked to show a dataframe or alter it, output the file as a csv to /data/lab/`+experiment.data._dataset_id;
            
            // jay's api 
            await fetch("openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(
                    {
                        "model": currentModel,
                        // "messages": [{"role": "user", "content": "Say this is a test!"},{"role": "user", "content": "Say this is a test!"}],
                        // original
                        "messages": [{"role": "user", "content":preSet+lastMessageFromUser}],

                        // "messages": [{"role": "user", "content": messages}],
                        // "temperature": 0.7
                        // "reset_context": "true"
                    }
                )
            })
            .then(res => res.json())
            .then(data => {
                
                var messageFromOpenai = data.choices[0].message['content'];
                
                // process the messageFromOpenai based on...
                // check if the messageFromOpenai contains python code.
                // if yes, then add "Do you want to run the code on Aliro?" to the messageFromOpenai in next line
                // if no, then do nothing
                
                let booleanPythonCode = checkIfCode(messageFromOpenai);

                if (booleanPythonCode){
                    let extractedCodeTemp = extractCode(messageFromOpenai);
                    // messageFromOpenai = "Running the below code on Aliro..." + "\n" + messageFromOpenai;
                    messageFromOpenai = "If you want to run the code on Aliro, please click the run button below." + "\n" + messageFromOpenai;

                    // function for running the code on aliro
                    // runCodeOnAliro(extractedCode);
                    setExtractedCode({...extractedCode, code: extractedCodeTemp});
                }

                // postInChatlogs(filteredData[chatCurrentTempId-1]['_id'], data.message, "text", "gpt");
                postInChatlogs(filteredData[chatCurrentTempId-1]['_id'], messageFromOpenai, "text", "gpt");
                
                // setChatLog([
                //     ...chatLogNew, {
                //         user: "gpt",
                //         message: `${data.message}`
                //     }
                // ])


                const regex = /```([^`]*)```/g;
                const matches = messageFromOpenai.matchAll(regex);
        
                for (const match of matches) {
                    //check if the first 6 characters are python
                    if(match[1].substring(0,6) === "python"){
                        //remove the first 6 characters
                        match[1] = match[1].substring(6);
                    }
                    console.log("python code:",match[1]);
            
                }

                // setChatLog([
                //     ...chatLogNew, {
                //         user: "assistant",
                //         messageType: "text",
                //         message: data.content.split(/\n/).map(line => <div key={line}>{line}</div>)
                //     }
                // ]);

                setChatLog([
                    ...chatLogNew, {
                        user: "gpt",
                        // message: `${messageFromOpenai}`
                        message: messageFromOpenai.split(/\n/).map(line => <div key={line}>{line}</div>)
                    }
                ])



                var scrollToTheBottomChatLog = document.getElementsByClassName("chat-log")[0];
                scrollToTheBottomChatLog.scrollTop = scrollToTheBottomChatLog.scrollHeight;
            })




                

            })
            .catch(err => {
                console.log("err--handleSubmit",err);
            })


            setLanModelReset(false);

        // setChatInput("");
        // setChatLog(chatLogNew)

    }

    function handleTemp(temp) {
        if (temp > 1) {
            setTemperature(1)
        } else if (temp < 0) {
            setTemperature(0)
        } else {
            setTemperature(temp)
        }

    }

    return (
        <div className="ChatGPT">
            {
                
                <SideMenu
                    currentModel={currentModel} 
                    setCurrentModel={setCurrentModel} 
                    models={models}
                    setTemperature={handleTemp}
                    temperature={temperature}
                    clearChat={clearChat}
                    
                    chatLog={chatLog}
                    setChatLog = {setChatLog}

                    chatCurrentTempId = {chatCurrentTempId}
                    setChatCurrentTempId = {setChatCurrentTempId}

                    
                    numChatBox={numChatBox}
                    setNumChatBox={setNumChatBox}

                    lanModelReset = {lanModelReset}
                    setLanModelReset = {setLanModelReset}

                    limitNumChatBox={limitNumChatBox}

                    currentExpId={currentExpId}
                    setCurrentExpId={setCurrentExpId}
                />
            }

            {/* chatLog, setChatInput, handleSubmit, chatInput */}
            <ChatBox
                chatInput={chatInput}
                chatLog={chatLog}
                // setChatLog={setChatLog}
                setChatInput={setChatInput}
                handleSubmit={handleSubmit}

                // experiment={experiment}

                modeForChatOrCodeRunning = {modeForChatOrCodeRunning}
                setModeForChatOrCodeRunning = {setModeForChatOrCodeRunning}

                extractedCode = {extractedCode}

                
            />


        </div>
    );
}
