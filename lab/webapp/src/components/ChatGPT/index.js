// import "./normal.css"; import "./ChatGPT.css";
import {useState, useEffect} from "react";
import React from 'react';
import SideMenu from "./SideMenu";
import ChatBox from "./ChatBox";
import { locales } from 'moment';



export default function ChatGPT({experiment}) {

    var limitNumChatBox = 5;

    useEffect(() => {
        console.log("useEffect-index.js")
        // getEngines();

        initailChatBoxSetting();
        getAllChatsFromDBFilterbyExpIdSetChatbox();

        //set tapTitles
        setTapTitlesFunc();
        setLanModelReset(true);
       
    }, 
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
    // 
    const [lanModelReset, setLanModelReset] = useState(false);

    // current experiment id
    const [currentExpId, setCurrentExpId] = useState("");

    // tap titles 
    // tapTitles is an object that contains the title of each chat box
    const [tapTitles, setTapTitles] = useState({
        "taptitles": ""
    });

    // modeforchatorcoderuning
    const [modeForChatOrCodeRunning, setModeForChatOrCodeRunning] = useState("chat");

    // extractedCode
    const [extractedCode, setExtractedCode] = useState({
        code: ""
      });

    // booleanCode for checking if the messageFromOpenai contains python code
    // const [booleanCode, setBooleanCode] = useState(false);

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

            let booleanCode = false;
            messageFromOpenai.split("\n").forEach(line => {
                console.log("line", line)
                if (line.includes("```")) {
                    booleanCode = true;
                }
            })

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
    async function postChats(experimentId){

        


        // POST http://localhost:5080/chatapi/v1/chats
        // Content-Type: application/json

        // {
        //     "title" : "Chat with experiment id 2",
        //     "_experiment_id": "63f6e4987c5f93004a3e3ca8",
        //     "_dataset_id": "63f6e4947c5f93004a3e3ca7"
        // }


        let data=await fetch("/chatapi/v1/chats", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: "ChatBox",
                _experiment_id: experimentId,
                _dataset_id: experiment.data._dataset_id
            })
            })
            .then(res => res.json())
            .then(data => {
                console.log("postChats", data);
                return data;
            })
            .catch(err => {
                console.log("err--postChats",err);
                return err;
            })

        return data;
    }

    async function getAllChatsFromDB(){
        // GET http://localhost:5080/chatapi/v1/chats

        let data=await fetch("/chatapi/v1/chats", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            })
            .then(res => res.json())
            .then(data => {
                console.log("step.1-getAllChatsFromDB", data);
                return data;
            })
            .catch(err => {
                console.log("err--getAllChatsFromDB",err);
                return err;
            })
        
        return data;

    }

    // get all chats and filter out the chats that has the same experiment id
    // function getAllChatsFromDBFilterbyExpIdSetChatbox(){
    //     // GET http://localhost:5080/chatapi/v1/chats

    //     fetch("/chatapi/v1/chats", {
    //         method: "GET",
    //         headers: {
    //             "Content-Type": "application/json"
    //         },
    //         })
    //         .then(res => res.json())
    //         .then(data => {
    //             // get the experiment id from the url
    //             let url = window.location.href;
    //             let urlSplit = url.split("/");
    //             let experimentId = urlSplit[urlSplit.length - 1];


    //             // map to filter out the chats that has the same experiment id 
    //             let filteredChats = data.map((chat) => {
                    
    //                 if (chat['_experiment_id'] === experimentId) {
    //                     return chat;
    //                 }
    //                 else {
    //                     return null;
    //                 }
    //             })

    //             // remove null from filteredChats
    //             let filteredChatsWithoutNull = filteredChats.filter((chat) => {
    //                 return chat !== null;
    //             })

    //             setNumChatBox(filteredChatsWithoutNull.length);
    //             setChatCurrentTempId(filteredChatsWithoutNull.length);


    //             if (filteredChatsWithoutNull.length >=limitNumChatBox )
    //             {
    //                 document.getElementById("newchatbutton").style.pointerEvents = "none";
    //             }


    //             fetch(`/chatapi/v1/chats/${filteredChatsWithoutNull[filteredChatsWithoutNull.length-1]['_id']}`, {
    //                 method: "GET",
    //                 headers: {
    //                     "Content-Type": "application/json"
    //                 }
    //             })
    //             .then(res => res.json())
    //             .then(data => {
            
    //                 let chatLogNew = [];
                    
    //                 // need to change
    //                 for (let i = 0; i < data["chatlogs"].length; i++) {
                        
    //                         if (data["chatlogs"][i]["who"]=="user"){
    //                         chatLogNew = [
    //                             ...chatLogNew, {
    //                                 user: data["chatlogs"][i]["who"],
    //                                 message: data["chatlogs"][i]["message"]
    //                             }
    //                         ]
    //                     }

    //                     else if (data["chatlogs"][i]["who"]=="gpt"){
    //                         chatLogNew =[
    //                             ...chatLogNew, {
    //                                 user: data["chatlogs"][i]["who"],
    //                                 // message: `${messageFromOpenai}`
    //                                 message: data["chatlogs"][i]["message"].split(/\n/).map(line => <div key={line}>{line}</div>)
    //                             }
    //                         ]
    //                     }
    //                 }

    //                 setChatLog(chatLogNew);
                    
    //             })
    //             .catch(err => {
    //                 console.log("err--getSpecificChatbyChatId",err);
    //             })
            
                



                
    //         })
    //         .catch(err => {
    //             console.log("err--getAllChatsFromDB",err);
    //         })

    // }


    // simple
    async function getAllChatsFromDBFilterbyExpIdSetChatbox(){
        // GET http://localhost:5080/chatapi/v1/chats

        let data=await getAllChatsFromDB();

        console.log("step.2", data)

        let experimentId = experiment.data._id;


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


        console.log("getAllChatsFromDBFilterbyExpIdSetChatbox", filteredChatsWithoutNull)

        setNumChatBox(filteredChatsWithoutNull.length);
        setChatCurrentTempId(filteredChatsWithoutNull.length);


        if (filteredChatsWithoutNull.length >=limitNumChatBox )
        {
            document.getElementById("newchatbutton").style.pointerEvents = "none";
        }



        
        data = await getSpecificChatbyChatId(filteredChatsWithoutNull[filteredChatsWithoutNull.length-1]['_id'])


        let chatLogNew = [];
            
        // need to change
        for (let i = 0; i < data["chatlogs"].length; i++) {
            
                if (data["chatlogs"][i]["who"]=="user"){
                chatLogNew = [
                    ...chatLogNew, {
                        user: data["chatlogs"][i]["who"],
                        message: data["chatlogs"][i]["message"],
                        execution_id: data["chatlogs"][i]["_execution_id"] === undefined ? "" : data["chatlogs"][i]["_execution_id"]

                        

                    }
                ]
            }

            else if (data["chatlogs"][i]["who"]=="gpt"){
                chatLogNew =[
                    ...chatLogNew, {
                        user: data["chatlogs"][i]["who"],
                        message: data["chatlogs"][i]["message"],
                        execution_id: data["chatlogs"][i]["_execution_id"] === undefined ? "" : data["chatlogs"][i]["_execution_id"]

                        // message: data["chatlogs"][i]["message"].split(/\n/).map(line => <div key={line}>{line}</div>)
                    }
                ]
            }
        }

        setChatLog(chatLogNew);

    }

    async function getSpecificChatbyChatId(chatId){
        // GET http://localhost:5080/chatapi/v1/chats/641e137ac5abc90a3b2b221e

        // datasetid
        // fetch(`

        let data=await fetch(`/chatapi/v1/chats/${chatId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            })
            .then(res => res.json())
            .then(data => {
                console.log("data--getSpecificChatbyChatId",data);

                return data;
  

            })
            .catch(err => {
                console.log("err--getSpecificChatbyChatId",err);
            })

        return data;

    }

    async function patchSpecificChat(chatId, title, experiment_id, dataset_id){ 
    
        // PATCH http://localhost:5080/chatapi/v1/chats/641e31ddb2663354ec5d52b8
        // Content-Type: application/json
        
        // {
        //     "title" : "Chat with experiment id!!!",
        //     "_experiment_id": "63f6e4987c5f93004a3e3ca8",
        //     "_dataset_id": "63f6e4947c5f93004a3e3ca7"
        
        // }

        await fetch(`/chatapi/v1/chats/${chatId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: title,
                _experiment_id: experiment_id,
                _dataset_id: experiment.data._dataset_id
            })
            })
            .then(res => res.json())
            .then(data => {
                console.log("data--patchSpecificChat", data);
            })
            .catch(err => {
                console.log("err--patchSpecificChat",err);
            })

    
    
    }

    async function deleteSpecificChat(chatId){
        // DELETE http://localhost:5080/chatapi/v1/chats/641e31ddb2663354ec5d52b8

        let data=await fetch(`/chatapi/v1/chats/${chatId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            })
            .then(res => res.json())
            .then(data => {
                console.log("data--deleteSpecificChat", data);
                return data;
            })
            .catch(err => {
                console.log("err--deleteSpecificChat",err);
                return err;
            })
        return data;

    }
    
    async function postInChatlogsToDB(chat_id, message, message_type, who){
        // POST http://localhost:5080/chatapi/v1/chatlogs
        // Content-Type: application/json

        // {
        //     "_chat_id" : "641e137ac5abc90a3b2b221e",
        //     "message" : "Hello there from my desk!!!!!!",
        //     "message_type" : "text",
        //     "who" : "user"
        // }

        let data = await fetch("/chatapi/v1/chatlogs", {
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
                console.log("data--postInChatlogsToDB", data);
                return data;
            })
            .catch(err => {
                console.log("err--postInChatlogsToDB",err);
                return err;
            })

        return data;




    }

    async function postInChatlogsToDBWithExeId(chat_id, message, message_type, who, exec_id=""){
        // POST http://localhost:5080/chatapi/v1/chatlogs
        // Content-Type: application/json

        // {
        //     "_chat_id" : "641e137ac5abc90a3b2b221e",
        //     "message" : "Hello there from my desk!!!!!!",
        //     "message_type" : "text",
        //     "who" : "user"
        // }

        let data = await fetch("/chatapi/v1/chatlogs", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "_chat_id": chat_id,
                "message": message,
                "message_type": message_type,
                "who": who,
                "_execution_id": exec_id

            })
            })
            .then(res => res.json())
            .then(data => {
                console.log("data--postInChatlogsToDBWithExeId", data);
                return data;
            })
            .catch(err => {
                console.log("err--postInChatlogsToDBWithExeId",err);
                return err;
            })

        return data;




    }

    async function patchChatlog(chatlogId, message, message_type, who){
        // PATCH http://localhost:5080/chatapi/v1/chatlogs/641e148dc5abc90a3b2b2221
        // Content-Type: application/json

        // {
        //     "message" : "Hello from cyberspace!",
        //     "message_type" : "text",
        //     "who" : "openai"
        // }

        await fetch("/chatapi/v1/chatlogs/641e148dc5abc90a3b2b2221", 
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

    async function getChatMessageByExperimentId(experiment_id){
        // GET http://localhost:5080/chatapi/v1/chats/experiment/641e148dc5abc90a3b2b2221

        let data = await fetch(`/chatapi/v1/chats/experiment/${experiment_id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            })
            .then(res => res.json())
            .then(data => {
                console.log("getChatMessageByExperimentId: ", data);
                return data;
                
            }
            )
            .catch(err => {
                console.log("err--getChatMessageByExperimentId",err);
                return err;
            }
            )

        return data;

    }
    
    // This function post initial chat message (How can I help you?, GPT) to DB
    // function initailChatBoxSetting()
    // {
    //     // the experiment id from the url
    //     let url = window.location.href;
    //     let urlSplit = url.split("/");
    //     let experimentId = urlSplit[urlSplit.length - 1];

    //     // GET http://localhost:5080/chatapi/v1/chats

    //     fetch("/chatapi/v1/chats", {
    //         method: "GET",
    //         headers: {
    //             "Content-Type": "application/json"
    //         },
    //         })
    //         .then(res => res.json())
    //         .then(data => {

    //             // filter the data by experiment id
    //             let dataFiltered = data.filter((item) => item._experiment_id === experimentId);

    //             // any chat id does not exist.
    //             // there are not any chatbox for this experiment id
    //             if (dataFiltered.length === 0){
                
    //                 // POST http://localhost:5080/chatapi/v1/chats
    //                 // Content-Type: application/json

    //                 // {
    //                 //     "title" : "Chat with experiment id 2",
    //                 //     "_experiment_id": experimentId,
    //                 //     "_dataset_id": experimentId
    //                 // }
                    
    //                 fetch("/chatapi/v1/chats", {
    //                     method: "POST",
    //                     headers: {
    //                         "Content-Type": "application/json"
    //                     },
    //                     body: JSON.stringify({
    //                         title: "ChatBox",
    //                         _experiment_id: experimentId,
    //                         _dataset_id: experimentId
    //                     })
    //                     })
    //                     .then(res => res.json())
    //                     .then(data => {
    //                         // there are no chatlogs
    //                         if (data['chatlogs'].length === 0){

    //                             // POST http://localhost:5080/chatapi/v1/chatlogs
    //                             // Content-Type: application/json
    //                             // {
    //                             //     "_chat_id" : "642076d7262c19d0be23448b",
    //                             //     "message" : "How are you?",
    //                             //     "message_type" : "text",
    //                             //     "who" : "gpt"
    //                             // }
                                
    //                                 fetch("/chatapi/v1/chatlogs", {
    //                                     method: "POST",
    //                                     headers: {
    //                                         "Content-Type": "application/json"
    //                                     },
    //                                     body: JSON.stringify({
    //                                         _chat_id: data._id,
    //                                         "message": "How can I help you today?",
    //                                         "message_type": "text",
    //                                         "who": "gpt"
    //                                     })
    //                                 })
    //                                 .then(res => res.json())
    //                                 .then(async data => {
    //                                     // console.log("success1")
    //                                     // get all chats for this experiment id to frontend
    //                                     // getAllChatsFromDBFilterbyExpIdSetChatbox();

    //                                     await getAllChatsFromDBFilterbyExpIdSetChatbox_simple();
    //                                 })
    //                                 .catch(err => {
    //                                     console.log("err--postChat",err);
    //                                 })
                                


    //                         }
    //                     })
                    
                
    //             }



    //         })
    //         .catch(err => {
    //             console.log("err--initailChatBoxSetting",err);
    //         })  

                

    // }

    //simple
    async function initailChatBoxSetting()
    {
        
        let experimentId = experiment.data._id;

        // experimentId = experiment.data._id

        console.log("experiment.data._id", experiment.data._id )
        console.log("experimentId",experimentId)

        // experimentId = urlSplit[urlSplit.length - 1]

        // GET http://localhost:5080/chatapi/v1/chats

        let data= await getAllChatsFromDB(); 
        
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
            
            // let data = await fetch("/chatapi/v1/chats", {
            //     method: "POST",
            //     headers: {
            //         "Content-Type": "application/json"
            //     },
            //     body: JSON.stringify({
            //         title: "ChatBox",
            //         _experiment_id: experimentId,
            //         _dataset_id: experimentId
            //     })
            //     })
            //     .then(res => res.json())
            //     .then(data => {
            //         return data;
            //     })
            //     .catch(err => {
            //         console.log("err--postChat",err);
            //     })

            
            let data = await postChats(experimentId)

            

            
                // there are no chatlogs
                if (data['chatlogs'].length === 0){

                    await postInChatlogsToDB(data._id, "How can I help you today?", "text", "gpt")

                    // await postInChatlogsToDBWithExeId(data._id, "How can I help you today?", "text", "gpt","")

                    await getAllChatsFromDBFilterbyExpIdSetChatbox();
                    


                }
                
            
        
        }



            

                

    }
    // ==================== openai api ====================
    async function openaiChatCompletions(currentModel,preSetLastMessageFromUser){

        // jay's
        let data=await fetch("openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(
                {
                    "model": currentModel,
                    // "messages": [{"role": "user", "content": "Say this is a test!"},{"role": "user", "content": "Say this is a test!"}],
                    // original
                    "messages": [{"role": "user", "content":preSetLastMessageFromUser}],

                    // "messages": [{"role": "user", "content": messages}],
                    // "temperature": 0.7
                    // "reset_context": "true"
                }
            )
        })
        .then(res => res.json())
        .then(data => {
            return data;
        })
        .catch(err => {
            console.log("err--openaiChatCompletions",err);
            return err;
        })

        return data;


    }







    // async function handleSubmit(e) {
    //     // prevent page from refreshing
    //     e.preventDefault();

    //     let url = window.location.href;
    //     let urlSplit = url.split("/");
    //     let experimentId = urlSplit[urlSplit.length - 1];


    //     let chatLogNew =[
    //         {
    //             user: "gpt",
    //             message: "How can I help you today?"
    //         }
    //     ]
        

        

    //     chatLogNew = [
    //         ...chatLog, {
    //             user: "me",
    //             message: `${chatInput}`
    //         }
    //     ]

    //     setChatInput("");
    //     setChatLog(chatLogNew)


    //     // GET http://localhost:5080/chatapi/v1/chats/experiment/${experimentId}

    //     await fetch(`/chatapi/v1/chats/experiment/${experimentId}`, {
    //         method: "GET",
    //         headers: {
    //             "Content-Type": "application/json"
    //         },
    //         })
    //         .then(res => res.json())
    //         .then(async data => {
    //             // console.log("data--best--experiment", data);
    //             // filter the data using _experiment_id
    //             var filteredData= data.filter((item) => item._experiment_id === experimentId)

    //             console.log("filteredData-handleSubmit", filteredData)
    //             console.log("experimentId-handleSubmit", experimentId)
    //             console.log("chatCurrentTempId-handleSubmit",chatCurrentTempId)

    //             if (chatCurrentTempId === 0){

    //                 setChatCurrentTempId(1);
    //             }

    //             if (chatInput !== undefined || chatInput !== ""){
    //                 postInChatlogsToDB(filteredData[chatCurrentTempId-1]['_id'], chatInput, "text", "user");
    //             }

    //             const messages = chatLogNew
    //             .map((message) => message.message)
    //             .join("\n")

    //             // get the last message from the chatLogNew array
    //             let lastMessageFromUser = chatLogNew[chatLogNew.length - 1].message;

    //             // if (modeForChatOrCodeRunning === "code"){
    //             //     lastMessageFromUser += " Please give me the python code script. Please put the python code script between ``` and ```. For example, ```print('hello world')```"
    //             // }

    //         var feature_importances = {};
    //         for (var i = 0; i < experiment.data.feature_importances.length; i++) {
    //             feature_importances[experiment.data.feature_names[i]] = experiment.data.feature_importances[i];
    //         }

    //         // let preSet =`assume you are a data scientist that only programs in python. You are given a model mod and dataframe df with the following performance:` + `{"params":`+ JSON.stringify(experiment.data.params) +`,"algorithm":`+ experiment.data.algorithm +`,"scores":`+ JSON.stringify(experiment.data.scores) +`feature_importance_type :`+ experiment.data.feature_importance_type +`,"feature_importances":`+ JSON.stringify(feature_importances) +`}` + `\n You are asked: ` + prompt + `\n Given this prompt if you are asked to make a plot, save the plot locally. If you are asked to show a dataframe or alter it, output the file as a csv to /data/lab/`+experiment.data._dataset_id;

    //         let preSet =`assume you are a data scientist that only programs in python. You are given a model mod and dataframe df with the following performance:` + `{"params":`+ JSON.stringify(experiment.data.params) +`,"algorithm":`+ experiment.data.algorithm +`,"scores":`+ JSON.stringify(experiment.data.scores) +`feature_importance_type :`+ experiment.data.feature_importance_type +`,"feature_importances":`+ JSON.stringify(feature_importances) +`}` + `\n You are asked: ` + prompt + `\n Given this prompt if you are asked to make a plot, save the plot locally. If you are asked to show a dataframe or alter it, output the file as a csv locally`;
            
    //         // jay's api 
    //         await fetch("openai/v1/chat/completions", {
    //             method: "POST",
    //             headers: {
    //                 "Content-Type": "application/json",
    //             },
    //             body: JSON.stringify(
    //                 {
    //                     "model": currentModel,
    //                     // "messages": [{"role": "user", "content": "Say this is a test!"},{"role": "user", "content": "Say this is a test!"}],
    //                     // original
    //                     "messages": [{"role": "user", "content":preSet+lastMessageFromUser}],

    //                     // "messages": [{"role": "user", "content": messages}],
    //                     // "temperature": 0.7
    //                     // "reset_context": "true"
    //                 }
    //             )
    //         })
    //         .then(res => res.json())
    //         .then(data => {
                
    //             var messageFromOpenai = data.choices[0].message['content'];
                
    //             // process the messageFromOpenai based on...
    //             // check if the messageFromOpenai contains python code.
    //             // if yes, then add "Do you want to run the code on Aliro?" to the messageFromOpenai in next line
    //             // if no, then do nothing
                
    //             let booleanPythonCode = checkIfCode(messageFromOpenai);

    //             if (booleanPythonCode){
    //                 let extractedCodeTemp = extractCode(messageFromOpenai);
    //                 // messageFromOpenai = "Running the below code on Aliro..." + "\n" + messageFromOpenai;
    //                 messageFromOpenai = "If you want to run the code on Aliro, please click the run button below." + "\n" + messageFromOpenai;

    //                 // function for running the code on aliro
    //                 // runCodeOnAliro(extractedCode);
    //                 setExtractedCode({...extractedCode, code: extractedCodeTemp});
    //             }

    //             // postInChatlogsToDB(filteredData[chatCurrentTempId-1]['_id'], data.message, "text", "gpt");
    //             postInChatlogsToDB(filteredData[chatCurrentTempId-1]['_id'], messageFromOpenai, "text", "gpt");
                
    //             // setChatLog([
    //             //     ...chatLogNew, {
    //             //         user: "gpt",
    //             //         message: `${data.message}`
    //             //     }
    //             // ])


    //             const regex = /```([^`]*)```/g;
    //             const matches = messageFromOpenai.matchAll(regex);
        
    //             for (const match of matches) {
    //                 //check if the first 6 characters are python
    //                 if(match[1].substring(0,6) === "python"){
    //                     //remove the first 6 characters
    //                     match[1] = match[1].substring(6);
    //                 }
    //                 console.log("python code:",match[1]);
            
    //             }

    //             // setChatLog([
    //             //     ...chatLogNew, {
    //             //         user: "assistant",
    //             //         messageType: "text",
    //             //         message: data.content.split(/\n/).map(line => <div key={line}>{line}</div>)
    //             //     }
    //             // ]);

    //             setChatLog([
    //                 ...chatLogNew, {
    //                     user: "gpt",
    //                     // message: `${messageFromOpenai}`
    //                     message: messageFromOpenai.split(/\n/).map(line => <div key={line}>{line}</div>)
    //                 }
    //             ])



    //             var scrollToTheBottomChatLog = document.getElementsByClassName("chat-log")[0];
    //             scrollToTheBottomChatLog.scrollTop = scrollToTheBottomChatLog.scrollHeight;
    //         })

    //         })
    //         .catch(err => {
    //             console.log("err--handleSubmit",err);
    //         })

        
    //     // getChatMessageByExperimentId(experimentId);


    //         setLanModelReset(false);

    //     // setChatInput("");
    //     // setChatLog(chatLogNew)

    // }

    
    
    
    
    
    // simple
    async function handleSubmit(e) {
        // prevent page from refreshing
        e.preventDefault();

        let experimentId = experiment.data._id;;

        // let chatLogNew =[
        //     {
        //         user: "gpt",
        //         message: "How can I help you today?"
        //     }
        // ]

        let chatLogNew = [];
        
        chatLogNew = [
            ...chatLog, {
                user: "me",
                message: `${chatInput}`

            }
        ]

        setChatInput("");
        setChatLog(chatLogNew)

        // GET http://localhost:5080/chatapi/v1/chats/experiment/${experimentId}
        let data = await getChatMessageByExperimentId(experimentId);

        // filter the data using _experiment_id
        var filteredData= data.filter((item) => item._experiment_id === experimentId)

        // chatCurrentTempId is 1,2,3, ...
        // there is no 0 chatCurrentTempId.
        if (chatCurrentTempId === 0){

            setChatCurrentTempId(1);
        }

        if (chatInput !== undefined || chatInput !== ""){
            await postInChatlogsToDB(filteredData[chatCurrentTempId-1]['_id'], chatInput, "text", "user");

            // await postInChatlogsToDBWithExeId(filteredData[chatCurrentTempId-1]['_id'], chatInput, "text", "user","");
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

        // let preSet =`assume you are a data scientist that only programs in python. You are given a model mod and dataframe df with the following performance:` + `{"params":`+ JSON.stringify(experiment.data.params) +`,"algorithm":`+ experiment.data.algorithm +`,"scores":`+ JSON.stringify(experiment.data.scores) +`feature_importance_type :`+ experiment.data.feature_importance_type +`,"feature_importances":`+ JSON.stringify(feature_importances) +`}` + `\n You are asked: ` + prompt + `\n Given this prompt if you are asked to make a plot, save the plot locally. If you are asked to show a dataframe or alter it, output the file as a csv to /data/lab/`+experiment.data._dataset_id;

        let preSet =`assume you are a data scientist that only programs in python. You are given a model mod and dataframe df with the following performance:` + `{"params":`+ JSON.stringify(experiment.data.params) +`,"algorithm":`+ experiment.data.algorithm +`,"scores":`+ JSON.stringify(experiment.data.scores) +`feature_importance_type :`+ experiment.data.feature_importance_type +`,"feature_importances":`+ JSON.stringify(feature_importances) +`}` + `\n You are asked: ` + prompt + `\n Given this prompt if you are asked to make a plot, save the plot locally. If you are asked to show a dataframe or alter it, output the file as a csv locally`;

        // my prompt eng
        // let preSet =`assume you are a data scientist that only programs in python. You are given a model mod and dataframe df with the following performance:` + `{"params":`+ JSON.stringify(experiment.data.params) +`,"algorithm":`+ experiment.data.algorithm +`,"scores":`+ JSON.stringify(experiment.data.scores) +`feature_importance_type :`+ experiment.data.feature_importance_type +`,"feature_importances":`+ JSON.stringify(feature_importances) +`}` + `\n You are asked: ` + prompt + `\n Given this prompt if you are asked to make a plot, save the plot locally. If you are asked to show a dataframe or alter it, output the file as a csv locally. In the case, new dataframe is saved as csv or tsv file format. please always return first 10 rows in the result.`;
    
        data= await openaiChatCompletions(currentModel,preSet+lastMessageFromUser)

        var messageFromOpenai = data.choices[0].message['content'];
            
        // process the messageFromOpenai based on...
        // check if the messageFromOpenai contains python code.
        // if yes, then add "Do you want to run the code on Aliro?" to the messageFromOpenai in next line
        // if no, then do nothing
        
        let booleanCode = checkIfCode(messageFromOpenai);

        if (booleanCode){
            let extractedCodeTemp = extractCode(messageFromOpenai);
            // messageFromOpenai = "Running the below code on Aliro..." + "\n" + messageFromOpenai;
            messageFromOpenai = "If you want to run the code on Aliro, please click the run button below." + "\n" + messageFromOpenai;

            // function for running the code on aliro
            // runCodeOnAliro(extractedCode);
            setExtractedCode({...extractedCode, code: extractedCodeTemp});
        }


        await postInChatlogsToDB(filteredData[chatCurrentTempId-1]['_id'], messageFromOpenai, "text", "gpt");

        // await postInChatlogsToDBWithExeId(filteredData[chatCurrentTempId-1]['_id'], messageFromOpenai, "text", "gpt", "");
        
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
            // console.log("python code:",match[1]);
        }





        setChatLog([
            ...chatLogNew, {
                user: "gpt",
                message: `${messageFromOpenai}`
                // message: messageFromOpenai.split(/\n/).map(
                //     line => 
                //     <div key={line}>
                //     {line}</div>
                // )
            }
        ])

        var scrollToTheBottomChatLog = document.getElementsByClassName("chat-log")[0];
        scrollToTheBottomChatLog.scrollTop = scrollToTheBottomChatLog.scrollHeight;

        setLanModelReset(false);
    }

    async function getFilesURLs(file_id)
    {
        console.log("step-1.getFiles")
        // GET http://localhost:5080/api/v1/files/6435c790d48f033fde87242b

        const response = await fetch(`/api/v1/files/${file_id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then(response => {
            console.log("step-2.getFiles-response", response)
            return response;
        })
        
        .catch((error) => {
            console.error('getFiles-Error:', error);
            return error;
        }
        );

        return response;




    }


    

    async function updateAfterRuningCode(e,resp) {


        console.log("updateAfterRuningCode-resp['result']", resp['result'])

        console.log("updateAfterRuningCode-resp", resp)

        console.log("updateAfterRuningCode-resp['dataset_file_id']", resp['_dataset_file_id'])

        


        // prevent page from refreshing
        e.preventDefault();


        let resultMessage = resp['result'];

        // if (resultMessage === "" && resp['files'].length!==0){
        if (resp['files'].length!==0){
            

            // resultMessage = "The result is empty. But the file is saved locally." + "\n" ;

            resultMessage =  "\n" ;

            let filesarray = [];
            resp['files'].forEach((file) => {
                let filename = file['filename']
                filename += ","
                // resultMessage += filename

                filesarray.push(filename)
                
            })

            // "The file name is: "
            // resultMessage += "the URL is:";

            let filesURLsarray = [];
            for (const file of resp['files']) {
                
                const resp2 = await getFilesURLs(file['_id']);
                
                // resultMessage += resp2['url'];
                // resultMessage += "\n";

                filesURLsarray.push(resp2['url'])
              }

            let fni =  "The file name is: ";
            let tui = "the URL is:";
            let fni_tui = "";
            for (let i=0; i<filesarray.length; i++)
            {
                fni = filesarray[i];
                // console.log("fni", fni)
                tui = filesURLsarray[i];


                fni_tui = fni+ " "+ tui + "\n";

                resultMessage += fni_tui;

            }


            console.log("step-3.resultMessage", resultMessage)
            

        }

        let experimentId = experiment.data._id;

        // let chatLogNew =[
        //     {
        //         user: "gpt",
        //         message: "How can I help you today?"
        //     }
        // ]

        let chatLogNew = [];
        
        // chatLogNew = [
        //     ...chatLog, {
        //         user: "me",
        //         message: `${chatInput}`
        //     }
        // ]

        // setChatInput("");
        // setChatLog(chatLogNew)

        // GET http://localhost:5080/chatapi/v1/chats/experiment/${experimentId}
        let data = await getChatMessageByExperimentId(experimentId);

        // filter the data using _experiment_id
        var filteredData= data.filter((item) => item._experiment_id === experimentId)

        // chatCurrentTempId is 1,2,3, ...
        // there is no 0 chatCurrentTempId.
        if (chatCurrentTempId === 0){

            setChatCurrentTempId(1);
        }

        // if (chatInput !== undefined || chatInput !== ""){
        //     await postInChatlogsToDB(filteredData[chatCurrentTempId-1]['_id'], chatInput, "text", "user");
        // }

        // test
        const messages = chatLogNew
        .map((message) => message.message)
        .join("\n")

        // get the last message from the chatLogNew array
        // let lastMessageFromUser = chatLogNew[chatLogNew.length - 1].message;

        // if (modeForChatOrCodeRunning === "code"){
        //     lastMessageFromUser += " Please give me the python code script. Please put the python code script between ``` and ```. For example, ```print('hello world')```"
        // }

        // var feature_importances = {};
        // for (var i = 0; i < experiment.data.feature_importances.length; i++) {
        //     feature_importances[experiment.data.feature_names[i]] = experiment.data.feature_importances[i];
        // }

        // let preSet =`assume you are a data scientist that only programs in python. You are given a model mod and dataframe df with the following performance:` + `{"params":`+ JSON.stringify(experiment.data.params) +`,"algorithm":`+ experiment.data.algorithm +`,"scores":`+ JSON.stringify(experiment.data.scores) +`feature_importance_type :`+ experiment.data.feature_importance_type +`,"feature_importances":`+ JSON.stringify(feature_importances) +`}` + `\n You are asked: ` + prompt + `\n Given this prompt if you are asked to make a plot, save the plot locally. If you are asked to show a dataframe or alter it, output the file as a csv to /data/lab/`+experiment.data._dataset_id;

        // let preSet =`assume you are a data scientist that only programs in python. You are given a model mod and dataframe df with the following performance:` + `{"params":`+ JSON.stringify(experiment.data.params) +`,"algorithm":`+ experiment.data.algorithm +`,"scores":`+ JSON.stringify(experiment.data.scores) +`feature_importance_type :`+ experiment.data.feature_importance_type +`,"feature_importances":`+ JSON.stringify(feature_importances) +`}` + `\n You are asked: ` + prompt + `\n Given this prompt if you are asked to make a plot, save the plot locally. If you are asked to show a dataframe or alter it, output the file as a csv locally`;
    
        // data= await openaiChatCompletions(currentModel,preSet+lastMessageFromUser)

        // var messageFromOpenai = data.choices[0].message['content'];
            
        // process the messageFromOpenai based on...
        // check if the messageFromOpenai contains python code.
        // if yes, then add "Do you want to run the code on Aliro?" to the messageFromOpenai in next line
        // if no, then do nothing
        
        // let booleanCode = checkIfCode(messageFromOpenai);

        // if (booleanCode){
        //     let extractedCodeTemp = extractCode(messageFromOpenai);
        //     // messageFromOpenai = "Running the below code on Aliro..." + "\n" + messageFromOpenai;
        //     messageFromOpenai = "If you want to run the code on Aliro, please click the run button below." + "\n" + messageFromOpenai;

        //     // function for running the code on aliro
        //     // runCodeOnAliro(extractedCode);
        //     setExtractedCode({...extractedCode, code: extractedCodeTemp});
        // }

        // postInChatlogsToDB(filteredData[chatCurrentTempId-1]['_id'], data.message, "text", "gpt");




        
        // await postInChatlogsToDB(filteredData[chatCurrentTempId-1]['_id'], resultMessage, "text", "gpt");

        await postInChatlogsToDBWithExeId(filteredData[chatCurrentTempId-1]['_id'], resultMessage, "text", "gpt", resp['_id']);
        
        // setChatLog([
        //     ...chatLogNew, {
        //         user: "gpt",
        //         message: `${data.message}`
        //     }
        // ])


        


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





        setChatLog([
            ...chatLog, {
                user: "gpt",
                execution_id: resp['_id'],
                message: resultMessage
                // message: messageFromOpenai.split(/\n/).map(
                //     line => 
                //     <div key={line}>
                //     {line}</div>
                // )
            }
        ])

        var scrollToTheBottomChatLog = document.getElementsByClassName("chat-log")[0];
        scrollToTheBottomChatLog.scrollTop = scrollToTheBottomChatLog.scrollHeight;

        // setLanModelReset(false);
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


async function setTapTitlesFunc(){
        console.log("setTapTitlesFunc");
        let tempTapTitles = [];
        let url = window.location.href;
        let urlSplit = url.split('/');
        let experimentID = experiment.data._id;
        
        // test
        let data = await getChatMessageByExperimentId(experimentID);

        // filter data based on experiment id
        let dataFiltered = data.filter(function (el) {
            return el._experiment_id == experimentID;
        });
        
        // get the title of each chat from data
        for (let i = 0; i < dataFiltered.length; i++){
            tempTapTitles[i] = dataFiltered[i]['title'];
        }

        setTapTitles({...tapTitles, taptitles: tempTapTitles});   
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

                    tapTitles = {tapTitles}
                    setTapTitles = {setTapTitles}
                    setTapTitlesFunc = {setTapTitlesFunc}

                    getChatMessageByExperimentId = {getChatMessageByExperimentId}

                    getSpecificChatbyChatId = {getSpecificChatbyChatId}

                    getAllChatsFromDB = {getAllChatsFromDB}

                    postChats = {postChats}
                    postInChatlogsToDB = {postInChatlogsToDB}
                    // postInChatlogsToDBWithExeId = {postInChatlogsToDBWithExeId}

                    deleteSpecificChat={deleteSpecificChat}
                    patchSpecificChat = {patchSpecificChat}

                    experiment = {experiment}
                    
                />
            }

            {/* chatLog, setChatInput, handleSubmit, chatInput */}
            <ChatBox
                chatInput={chatInput}
                chatLog={chatLog}
                // setChatLog={setChatLog}
                setChatInput={setChatInput}
                // handleSubmit={handleSubmit}
                handleSubmit={handleSubmit}

                // experiment={experiment}

                modeForChatOrCodeRunning = {modeForChatOrCodeRunning}
                setModeForChatOrCodeRunning = {setModeForChatOrCodeRunning}

                // extractedCode = {extractedCode}
                // checkIfCode = {checkIfCode}
                // extractCode = {extractCode}

                datasetId = {experiment.data._dataset_id}
                experimentId = {experiment.data._id}

                updateAfterRuningCode = {updateAfterRuningCode}

                

                
            />


        </div>
    );
}
