// import "./normal.css"; import "./ChatGPT.css";
import {useState, useEffect} from "react";
import React from 'react';
import SideMenu from "./SideMenu";
import ChatBox from "./ChatBox";
// import { locales } from 'moment';

import TestPage from './TestPage';

import {chatLogContext} from "./context/chatLogContext";

import {ThemeContext} from "./context/ThemeContext";

import {AllContext} from "./context/AllContext";


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

    const [tabluerData, setTabluerData] = useState([]);

    const [modeForTabluerData, setModeForTabluerData] = useState(false);

    const [booleanPackageInstall, setBooleanPackageInstall] = useState(false);

    // booleanCode for checking if the messageFromOpenai contains python code
    // const [booleanCode, setBooleanCode] = useState(false);


    const [isDark, setIsDark] = useState(false);

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
                console.log("checkIfCode-line", line)
                if (line.includes("```python")) {
                    booleanCode = true;
                }
            })

            return booleanCode;

    }

    
    function extractCode(messageFromOpenai) {



        const regex = /```([\s\S]+?)```/;
        const match = regex.exec(messageFromOpenai);
        const code = match[1];

        // console.log("extractCode",code);

        // console.log("match", match);

        return code;


        // const regex = /```([^`]*)```/g;
        // const matches = messageFromOpenai.matchAll(regex);

        // for (const match of matches) {
        //     //check if the first 6 characters are python
        //     if(match[1].substring(0,6) === "python"){
        //         //remove the first 6 characters
        //         match[1] = match[1].substring(6);
        //     }
        //     console.log("python code:",match[1]);
        // }

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
                // console.log("postChats", data);
                return data;
            })
            .catch(err => {
                // console.log("err--postChats",err);
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
                // console.log("step.1-getAllChatsFromDB", data);
                return data;
            })
            .catch(err => {
                // console.log("err--getAllChatsFromDB",err);
                return err;
            })
        
        return data;

    }



    // simple
    async function getAllChatsFromDBFilterbyExpIdSetChatbox(){
        // GET http://localhost:5080/chatapi/v1/chats

        let data=await getAllChatsFromDB();

        // console.log("step.2", data)

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


        // console.log("getAllChatsFromDBFilterbyExpIdSetChatbox", filteredChatsWithoutNull)

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

    async function patchChatToDB(chatId, message, message_type, who){
        // PATCH http://localhost:5080/chatapi/v1/chatlogs/641e148dc5abc90a3b2b2221
        // Content-Type: application/json

        // {
        //     "message" : "Hello from cyberspace!",
        //     "message_type" : "text",
        //     "who" : "openai"
        // }

        await fetch(`/chatapi/v1/chatlogs/${chatId}`, 
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
    
    

    //simple
    async function initailChatBoxSetting()
    {
        
        let experimentId = experiment.data._id;

        // experimentId = experiment.data._id

        // console.log("experiment.data._id", experiment.data._id )
        // console.log("experimentId",experimentId)

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


    async function openaiChatCompletionsWithChatLog(currentModel,chatLogNew,preSet,lastMessageFromUser){

        let preSetLastMessageFromUser = preSet + lastMessageFromUser;

        // make chatLogNew as the format of chatLog {"role": "user", "content": "Say this is a test!"},{"role": "user", "content": "Say this is a test!"}
        // what i mean is that replace the "user" with "role" and message with content

        let chatLogNewFormat = chatLogNew.map((item) => {

            // console.log("item",item)
            return {
                "role": item.user,
                "content": item.message
            }})

        
        
        // console.log("chatLogNewFormat",chatLogNewFormat)

        // replace gpt with system if role is gpt
        chatLogNewFormat = chatLogNewFormat.map((item) => {
            if (item.role === "gpt"){
                item.role = "assistant"
            }
            else if (item.role === "me"){
                item.role = "user"
            }
            return item
        })

        // remove 

        // console.log("chatLogNewFormat",chatLogNewFormat)

        // please remove "Please wait while I am thinking.." by system from chatLogNewFormat
        let chatLogNewFormatFiltered = chatLogNewFormat.filter((item) => item.content !== "Please wait while I am thinking..")

        console.log("chatLogNewFormatFiltered",chatLogNewFormatFiltered)

        // remove the last message from user
        chatLogNewFormat.pop()



        // push {"role": "system", "content":preSet} to the head of chatLogNewFormat
        // {"role": "system", "content":preSet} should be located at the head of chatLogNewFormat
        chatLogNewFormat.unshift({"role": "system", "content":preSet})
        chatLogNewFormat.push({"role": "user", "content":lastMessageFromUser})

        // console.log("preSetLastMessageFromUser",preSetLastMessageFromUser)
        console.log("chatLogNewFormat",chatLogNewFormat)


        // get only message by user from chatLogNewFormat

        let anotherTest = chatLogNewFormat.filter((item) => item.role === "user") 

        // calculate token of chatLogNewFormat
        let token = 0
        chatLogNewFormat.forEach((item) => {
            token = token + item.content.length
        })


        let data=await fetch("openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(
                {
                    "model": currentModel,
                    "messages": chatLogNewFormatFiltered,

                    // "messages": [
                    //     {"role": "user", "content": "Hi!"},{"role": "user", "content": "Say this is a test!"}
                    // ],
                    
                    
                    // original
                    // "messages": [{"role": "user", "content":preSetLastMessageFromUser}],

                    // "messages": [{"role": "user", "content": messages}],
                    // "temperature": 0.7
                    // "reset_context": "true",

                    // new
                    // "messages": chatLogNewFormat

                    // last two messages
                    // "messages": lastTwoMessages

                    // new test
                    // "messages": chatLogNewFormatFiltered,

                }
            )
        })
        .then(res => res.json())
        .then(data => {
            console.log("data--openaiChatCompletions",data)
            return data;
        })
        .catch(err => {
            console.log("err--openaiChatCompletions",err);
            return err;
        })

        return data;


    }


    function extractPackagesOfCode(code){
        let packages = [];
        let codeSplit = code.split("\n");
        codeSplit.forEach((item) => {
            if ((item.includes("import") && item.includes("as")) || (item.includes("from") && item.includes("import")) ){
                let itemSplit = item.split(" ");
                // import sklearn.datasets as datasets 
                // for the above case.
                let pack = itemSplit[1].split(".")[0];

                packages.push(pack);
            }
        })

        console.log("packages",packages)
        return packages;
    }

    async function checkCodePackages(packagesArray)
    {

        // console.log("packagesArray",packagesArray)

        // POST http://localhost:5080/execapi/v1/executions/install
        // Content-Type: application/json

        // {
        // "command": "freeze"
        // }

        let data = await fetch("/execapi/v1/executions/install", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                command: "freeze"
            })
            })
            .then(res => res.json())
            .then(data => {

                console.log("data-executions/install",data)
                return data;
            }
            )
            .catch(err => {
                console.log("err--checkCodePackages",err);
            }
            )

        let allInstalledPackages=data['exec_results']['stdout'].split("\n")

        for (let i=0;i<allInstalledPackages.length;i++){

            allInstalledPackages[i] = allInstalledPackages[i].split("==")[0];
            
        }

        //  packagesArray , allInstalledPackages
        //  set substract
        // let packagesNotInstalled = packagesArray - allInstalledPackages

        let requiredPackages = new Set(packagesArray);
        let installedPackages = new Set(allInstalledPackages);

        const result = new Set(requiredPackages);

        //  set substract
        for (const elem of installedPackages) {
            result.delete(elem);
          }

        // console.log("checkCodePackages-packagesNotInstalled",packagesNotInstalled)

        // console.log("checkCodePackages-allInstalledPackages",allInstalledPackages)

        // console.log("checkCodePackages-result",result)

        // convert result to array
        let packagesNotInstalled = Array.from(result);

        return packagesNotInstalled;


    }


    // simple
    async function handleSubmit(e) {
        // prevent page from refreshing
        e.preventDefault();

        let experimentId = experiment.data._id;

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
        var filteredData = data.filter((item) => item._experiment_id === experimentId)

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

        var feature_importances = {};
        for (var i = 0; i < experiment.data.feature_importances.length; i++) {
            feature_importances[experiment.data.feature_names[i]] = experiment.data.feature_importances[i];
        }

        // let preSet =`assume you are a data scientist that only programs in python. You are given a model mod and dataframe df with the following performance:` + `{"params":`+ JSON.stringify(experiment.data.params) +`,"algorithm":`+ experiment.data.algorithm +`,"scores":`+ JSON.stringify(experiment.data.scores) +`feature_importance_type :`+ experiment.data.feature_importance_type +`,"feature_importances":`+ JSON.stringify(feature_importances) +`}` + `\n You are asked: ` + prompt + `\n Given this prompt if you are asked to make a plot, save the plot locally. If you are asked to show a dataframe or alter it, output the file as a csv to /data/lab/`+experiment.data._dataset_id;

        // let preSet =`assume you are a data scientist that only programs in python. You are given a model mod and dataframe df with the following performance:` + `{"params":`+ JSON.stringify(experiment.data.params) +`,"algorithm":`+ experiment.data.algorithm +`,"scores":`+ JSON.stringify(experiment.data.scores) +`feature_importance_type :`+ experiment.data.feature_importance_type +`,"feature_importances":`+ JSON.stringify(feature_importances) +`}` + `\n You are asked: ` + prompt + `\n Given this prompt if you are asked to make a plot, save the plot locally. If you are asked to show a dataframe or alter it, output the file as a csv locally`;

        // my prompt eng
        let preSet =`assume you are a data scientist that only programs in python. You are given a model named model and dataframe df with the following performance:` + `{"params":`+ JSON.stringify(experiment.data.params) +`,"algorithm":`+ experiment.data.algorithm +`,"scores":`+ JSON.stringify(experiment.data.scores) +`feature_importance_type :`+ experiment.data.feature_importance_type +`,"feature_importances":`+ JSON.stringify(feature_importances) +`}` + `\n The dataframe df has 'target' as the output. You are asked: ` + `${chatInput}` + `\n Given this question if you are asked to make a plot, save the plot locally. If you are asked to show a dataframe or alter it, output the file as a csv locally. And generate a script of python code. Put the code between three backticks python and three backticks. For example, \`\`\`python \n print("hello world") \n \`\`\` and when users want to see the dataframe, save it as a csv file locally. However do not use temparary file paths. For example, pd.read_csv('path/to/your/csv/file.csv') is not allowed. There is already df variable in the code. You can use it. For example, df.head() is allowed. And when users want to see plot, please save it locally. For example, plt.savefig('file.png') is allowed. 
        In the case where you need to save csv, for each colum name, if it has _ in the name, replace _ with -.
        please make sure that any commenets should be in the form of #. For example, # this is a comment. or # Note: Please make sure to install the necessary libraries before running this code such as imblearn, pandas, matplotlib and sklearn.

        Please also make sure thant when you return python script, please comment out any explanation between \`\`\`python \n and \n \`\`\` . For example, 
        # Sure, here's an example code to create violin plots using seaborn library, where each column of a pandas dataframe is plotted as a separate violin plot and saved as a png file.
        
        import pandas as pd
        import seaborn as sns
        import matplotlib.pyplot as plt
        # Load sample data
        df = sns.load_dataset("tips")
        # Get column names
        cols = df.columns
        
        `;

        // console.log("preSet",preSet);

        let waitingMessage = "Please wait while I am thinking..";
        let typingDelay = 10; // milliseconds per character
        
        // Before making the API call
        setChatLog(chatLogNew => [
            ...chatLogNew,
            {
            user: "gpt",
            message: "",
            className: "blinking"
            }
        ]);
  
        // Gradually update the message (waitingMessage) with a delay
        let messageIndex = 0;
        let intervalId = setInterval(() => {
        if (messageIndex < waitingMessage.length) {
            setChatLog(chatLogNew => [
            ...chatLogNew.slice(0, -1),
            {
                user: "gpt",
                message: waitingMessage.slice(0, messageIndex + 1),
                className: "blinking"
            }
            ]);
            messageIndex++;
        } else {
            clearInterval(intervalId);
        }
        }, typingDelay);


        console.log("chatLogNew",chatLogNew)


        await postInChatlogsToDB(filteredData[chatCurrentTempId-1]['_id'], waitingMessage, "text", "gpt");

        
        // data= await openaiChatCompletions(currentModel,preSet+lastMessageFromUser)

        // make chatLogNew 
        
        data = await openaiChatCompletionsWithChatLog(currentModel,chatLogNew,preSet,lastMessageFromUser)

        console.log("returned-data",data)



        var messageFromOpenai = data.choices[0].message['content'];
            
        // process the messageFromOpenai based on...
        // check if the messageFromOpenai contains python code.
        // if yes, then add "Do you want to run the code on Aliro?" to the messageFromOpenai in next line
        // if no, then do nothing
        
        let booleanCode = checkIfCode(messageFromOpenai);

        if (booleanCode){
            let extractedCodeTemp = extractCode(messageFromOpenai);
            let packagesOfCode = extractPackagesOfCode(extractedCodeTemp); 

            let packagesNotInstalled = await checkCodePackages(packagesOfCode)
            

            if (packagesNotInstalled.length > 0){
                setBooleanPackageInstall(true);

                messageFromOpenai = packagesNotInstalled+" "+"package(s) is (are) not installed."+" "+"If you want to install the packages to run the below code, please click the button below. Conversely, if you want to modify the code, simply double-click on it, make the necessary changes, and then save by pressing the esc key." + "\n" + messageFromOpenai;

                
                
            }
            
            else{
                setBooleanPackageInstall(false);
                messageFromOpenai = "If you wish to execute the code on Aliro, please click on the button located below. Conversely, if you want to modify the code, simply double-click on it, make the necessary changes, and then save by pressing the esc key." + "\n" + messageFromOpenai;
            }

            // function for running the code on aliro
            // runCodeOnAliro(extractedCode);
            setExtractedCode({...extractedCode, code: extractedCodeTemp});
        }




        


        // const regex = /```([^`]*)```/g;
        // const matches = messageFromOpenai.matchAll(regex);

        // for (const match of matches) {
        //     //check if the first 6 characters are python
        //     if(match[1].substring(0,6) === "python"){
        //         //remove the first 6 characters
        //         match[1] = match[1].substring(6);
        //     }
        //     console.log("python code:",match[1]);
        // }



          // Set up the initial blinking message
        //   setChatLog(prevChatLog => [
        //     ...prevChatLog, {
        //     user: "gpt",
        //     message: "",
        //     className: "blinking"
        //     }
        // ]);

        // setChatLog([
        //     ...chatLogNew, {
        //         user: "gpt",
        //         message: `${messageFromOpenai}`
        //     }
        // ])

        // setChatLog(prevChatLog => prevChatLog.slice(0, -1).concat({
        //     user: "gpt",
        //     message: `${messageFromOpenai}`,
        //     className: ""
        //   }));







          // Set up the initial blinking message
        // setChatLog(prevChatLog => [
        //     ...prevChatLog, {
        //     user: "gpt",
        //     message: "",
        //     className: "blinking"
        //     }
        // ]);


        // setChatLog(prevChatLog => [
        //     ...prevChatLog, {
        //     user: "gpt",
        //     message: messageFromOpenai,
        //     className: ""
        //     }
        // ]);

        setChatLog(chatLog => [
            ...chatLog, {
            user: "gpt",
            message: messageFromOpenai,
            className: ""
            }
        ]);
  
        // let messageIndex2 = 0;
        // let intervalId2 = setInterval(() => {
        // setChatLog(prevChatLog => {
        //     let lastMessage = prevChatLog[prevChatLog.length - 1];
        //     if (lastMessage.user === "gpt" && lastMessage.className === "blinking") {
        //     let currentMessage = lastMessage.message;
        //     if (messageIndex2 < messageFromOpenai.length) {
        //         currentMessage += messageFromOpenai[messageIndex2];
        //         messageIndex2++;
        //     }
        //     return prevChatLog.slice(0, -1).concat({
        //         user: "gpt",
        //         message: currentMessage,
        //         className: "blinking"
        //     });
        //     } else {
        //     clearInterval(intervalId2);
        //     if (lastMessage.message === "Please wait while I am thinking..") {
        //         // Add a delay before showing the message
        //         setTimeout(() => {
        //         setChatLog(prevChatLog => [
        //             ...prevChatLog, {
        //             user: "gpt",
        //             message: messageFromOpenai,
        //             className: ""
        //             }
        //         ]);
        //         }, typingDelay * 2);
        //         // Return the previous chat log for now
        //         return prevChatLog;
        //     } else {
        //         // Show the message immediately
        //         return [
        //         ...prevChatLog, {
        //             user: "gpt",
        //             message: messageFromOpenai,
        //             className: ""
        //         }
        //         ];
        //     }
        //     }
        // });
        // }, typingDelay);






        await postInChatlogsToDB(filteredData[chatCurrentTempId-1]['_id'], messageFromOpenai, "text", "gpt");

        // await postInChatlogsToDBWithExeId(filteredData[chatCurrentTempId-1]['_id'], messageFromOpenai, "text", "gpt", "");
        
        // setChatLog([
        //     ...chatLogNew, {
        //         user: "gpt",
        //         message: `${data.message}`
        //     }
        // ])



          

        var scrollToTheBottomChatLog = document.getElementsByClassName("chat-log")[0];
        scrollToTheBottomChatLog.scrollTop = scrollToTheBottomChatLog.scrollHeight;

        setLanModelReset(false);
    }


    // modified handleSubmit to generate code for error handling of running code
    async function submitErrorWithCode(e, code) {
        // prevent page from refreshing
        e.preventDefault();

        let experimentId = experiment.data._id;

        

        let chatLogNew = chatLog;
        
        // chatLogNew = [
        //     ...chatLog, {
        //         user: "me",
        //         message: `${chatInput}`
        //     }
        // ]

        setChatInput("");
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

        const messages = chatLogNew
        .map((message) => message.message)
        .join("\n")

        // get the last message from the chatLogNew array
        // in this case, for example, it is "[Errno 2] File theta.csv does not exist: 'theta.csv'"
        let errorMessageFromMachine = chatLogNew[chatLogNew.length - 1].message;

        var feature_importances = {};
        for (var i = 0; i < experiment.data.feature_importances.length; i++) {
            feature_importances[experiment.data.feature_names[i]] = experiment.data.feature_importances[i];
        }


        // my prompt eng
        let preSet =`assume that you already ran the ${code}. However, you got the following error message: ${errorMessageFromMachine}. Please give me another code which does not have the error message. The code should be able to run on Aliro. 
        When the error is related to the missing file, please use the current df as the input. However this does not mean df is csv file or tsv file. df is a variable name. 
        For example, if the error is related to the missing file "theta.csv", please use the current df as the input. Here is another code example. pd.read_csv('path/to/your/csv/file'). This code will cause error because the file does not exist. However, if you change the code to pd.read_csv(df), it will not cause error.
        Please write the code between 3 backticks python and 3backticks. For example, the format is like this: \`\`\`python\nimport pandas as pd\nimport numpy as np\nimport matplotlib.pyplot as plt\nimport seaborn as sns\n\`\`\`
        `;




        let waitingMessage = "Please wait while I am thinking..";
        let typingDelay = 10; // milliseconds per character
        
        // Before making the API call
        setChatLog(chatLogNew => [
            ...chatLogNew,
            {
            user: "gpt",
            message: "",
            className: "blinking"
            }
        ]);
  
        // Gradually update the message (waitingMessage) with a delay
        let messageIndex = 0;
        let intervalId = setInterval(() => {
        if (messageIndex < waitingMessage.length) {
            setChatLog(chatLogNew => [
            ...chatLogNew.slice(0, -1),
            {
                user: "gpt",
                message: waitingMessage.slice(0, messageIndex + 1),
                className: "blinking"
            }
            ]);
            messageIndex++;
        } else {
            clearInterval(intervalId);
        }
        }, typingDelay);



        await postInChatlogsToDB(filteredData[chatCurrentTempId-1]['_id'], waitingMessage, "text", "gpt");



        data= await openaiChatCompletions(currentModel,preSet)

        var messageFromOpenai = data.choices[0].message['content'];
            
        // process the messageFromOpenai based on...
        // check if the messageFromOpenai contains python code.
        // if yes, then add "Do you want to run the code on Aliro?" to the messageFromOpenai in next line
        // if no, then do nothing
        
        let booleanCode = checkIfCode(messageFromOpenai);

        if (booleanCode){
            let extractedCodeTemp = extractCode(messageFromOpenai);
            let packagesOfCode = extractPackagesOfCode(extractedCodeTemp); 

            let packagesNotInstalled = await checkCodePackages(packagesOfCode)
            

            if (packagesNotInstalled.length > 0){
                setBooleanPackageInstall(true);

                messageFromOpenai = packagesNotInstalled+" "+"package(s) is (are) not installed!" 
                + "\n" +
                +" "+"If you want to install the packages to run the below code, please click the button below" + "\n" + messageFromOpenai;

                
                
            }
            

            // console.log("extractedCodeTemp: ", extractedCodeTemp)
            else{
                setBooleanPackageInstall(false);
                messageFromOpenai = "If you wish to execute the code on Aliro, please click on the button located below. Conversely, if you want to modify the code, simply double-click on it, make the necessary changes, and then save by pressing the esc key." + "\n" + messageFromOpenai;
            }

            // function for running the code on aliro
            // runCodeOnAliro(extractedCode);
            setExtractedCode({...extractedCode, code: extractedCodeTemp});
        }


        
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





        // setChatLog([
        //     ...chatLogNew, {
        //         user: "gpt",
        //         message: `${messageFromOpenai}`
        //         // message: messageFromOpenai.split(/\n/).map(
        //         //     line => 
        //         //     <div key={line}>
        //         //     {line}</div>
        //         // )
        //     }
        // ])


        setChatLog(chatLog => [
            ...chatLog, {
            user: "gpt",
            message: messageFromOpenai,
            className: ""
            }
        ]);





        await postInChatlogsToDB(filteredData[chatCurrentTempId-1]['_id'], messageFromOpenai, "text", "gpt");

        // await postInChatlogsToDBWithExeId(filteredData[chatCurrentTempId-1]['_id'], messageFromOpenai, "text", "gpt", "");

        var scrollToTheBottomChatLog = document.getElementsByClassName("chat-log")[0];
        scrollToTheBottomChatLog.scrollTop = scrollToTheBottomChatLog.scrollHeight;

        setLanModelReset(false);
    }


    async function showCodeRunningMessageWhenClickRunBtn(e) {

        console.log("star-0. showCodeRunningMessageWhenClickRunBtn")
        // prevent page from refreshing
        e.preventDefault();

        let experimentId = experiment.data._id;

        

        let chatLogNew = chatLog;
        
        // chatLogNew = [
        //     ...chatLog, {
        //         user: "me",
        //         message: `${chatInput}`
        //     }
        // ]

        setChatInput("");
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

        // const messages = chatLogNew
        // .map((message) => message.message)
        // .join("\n")

        // get the last message from the chatLogNew array
        // in this case, for example, it is "[Errno 2] File theta.csv does not exist: 'theta.csv'"
        // let errorMessageFromMachine = chatLogNew[chatLogNew.length - 1].message;

        




        let waitingMessage = "Please wait while I am running your code on Aliro..";
        let typingDelay = 10; // milliseconds per character
        
        // Before making the API call
        setChatLog(chatLogNew => [
            ...chatLogNew,
            {
            user: "gpt",
            message: "",
            className: "blinking"
            }
        ]);
  
        // Gradually update the message (waitingMessage) with a delay
        let messageIndex = 0;
        let intervalId = setInterval(() => {
        if (messageIndex < waitingMessage.length) {
            setChatLog(chatLogNew => [
            ...chatLogNew.slice(0, -1),
            {
                user: "gpt",
                message: waitingMessage.slice(0, messageIndex + 1),
                className: "blinking"
            }
            ]);
            messageIndex++;
        } else {
            clearInterval(intervalId);
        }
        }, typingDelay);



        await postInChatlogsToDB(filteredData[chatCurrentTempId-1]['_id'], waitingMessage, "text", "gpt");



        // data= await openaiChatCompletions(currentModel,preSet)

        // var messageFromOpenai = data.choices[0].message['content'];
            
        // process the messageFromOpenai based on...
        // check if the messageFromOpenai contains python code.
        // if yes, then add "Do you want to run the code on Aliro?" to the messageFromOpenai in next line
        // if no, then do nothing
        
        // let booleanCode = checkIfCode(messageFromOpenai);

        // if (booleanCode){
        //     let extractedCodeTemp = extractCode(messageFromOpenai);
        //     let packagesOfCode = extractPackagesOfCode(extractedCodeTemp); 

        //     let packagesNotInstalled = await checkCodePackages(packagesOfCode)
            

        //     if (packagesNotInstalled.length > 0){
        //         setBooleanPackageInstall(true);

        //         messageFromOpenai = packagesNotInstalled+" "+"package(s) is (are) not installed!" 
        //         + "\n" +
        //         +" "+"If you want to install the packages to run the below code, please click the button below" + "\n" + messageFromOpenai;

                
                
        //     }
            

        //     // console.log("extractedCodeTemp: ", extractedCodeTemp)
        //     else{
        //         setBooleanPackageInstall(false);
        //         messageFromOpenai = "If you wish to execute the code on Aliro, please click on the button located below. Conversely, if you want to modify the code, simply double-click on it, make the necessary changes, and then save by pressing the esc key." + "\n" + messageFromOpenai;
        //     }

        //     // function for running the code on aliro
        //     // runCodeOnAliro(extractedCode);
        //     setExtractedCode({...extractedCode, code: extractedCodeTemp});
        // }


        
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





        // setChatLog([
        //     ...chatLogNew, {
        //         user: "gpt",
        //         message: `${messageFromOpenai}`
        //         // message: messageFromOpenai.split(/\n/).map(
        //         //     line => 
        //         //     <div key={line}>
        //         //     {line}</div>
        //         // )
        //     }
        // ])


        // setChatLog(chatLog => [
        //     ...chatLog, {
        //     user: "gpt",
        //     message: messageFromOpenai,
        //     className: ""
        //     }
        // ]);





        // await postInChatlogsToDB(filteredData[chatCurrentTempId-1]['_id'], messageFromOpenai, "text", "gpt");

        // await postInChatlogsToDBWithExeId(filteredData[chatCurrentTempId-1]['_id'], messageFromOpenai, "text", "gpt", "");

        // var scrollToTheBottomChatLog = document.getElementsByClassName("chat-log")[0];
        // scrollToTheBottomChatLog.scrollTop = scrollToTheBottomChatLog.scrollHeight;

        // setLanModelReset(false);
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

        console.log("star-2. updateAfterRuningCode")


        console.log("updateAfterRuningCode-resp['result']", resp['result'])

        console.log("updateAfterRuningCode-resp", resp)

        console.log("updateAfterRuningCode-resp['dataset_file_id']", resp['_dataset_file_id'])

        


        // prevent page from refreshing
        e.preventDefault();


        let resultMessage = resp['result'];

        // if resultMessage is undefined, resultMessage = "Undefined"
        if (resultMessage === undefined || resultMessage === null || resultMessage === ""){
            resultMessage = "The code isn't generating any output."
        }



        // if (resultMessage === "" && resp['files'].length!==0){
        if (resp['files'].length!==0)
        {
            

            resultMessage = "Please review the content below. If the output contains any files, you can download them by clicking on the respective links." + "\n" ;

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
            let tableDataText = "";
            for (const file of resp['files']){

                // console.log("temp-file",file)
                
                const resp2 = await getFilesURLs(file['_id']);


                filesURLsarray.push(resp2['url'])
                // for now i assume that it generates one csv or tsv.

                if (file['filename'].includes(".csv") || file['filename'].includes(".tsv"))
                {
                    tableDataText = await fetch(resp2['url'])
                    .then((response) => response.text())
                    .then((text) => {
                        
                        const rows = text.split("\n");
                        const data = rows.map((row) => row.split(","));
                        setTabluerData(data)
                        return text;
                    });

                    
                    

                    // tableDataText into an array of rows
                    const rows = tableDataText.split('\n');

                    // top 11 rows
                    const top10Rows = rows.slice(0, 11);

                    // const top10RowsText = top10Rows.join('\n');
                    tableDataText = top10Rows.join('\_');

                    // tableDataText = top10RowsText;
                }

            
            
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

            if (tableDataText !== "")
            {
                resultMessage += "\n";
                resultMessage += "The tabular data is: ";
                resultMessage += "\n";
                // please maintain the format of the table 
                // otherwise it will not be displayed correctly
                resultMessage += tableDataText
            }

            resultMessage += "\n";
            resultMessage += "This is the end of the tabular data.";

            // console.log("step-3.resultMessage", resultMessage)

            console.log("step-4.resultMessage", resultMessage.substring(resultMessage.indexOf("The tabular data is:") + 19))
            
            

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
        //     messageFromOpenai = "If you wish to execute the code on Aliro, please click on the button located below. Conversely, if you want to modify the code, simply double-click on it, make the necessary changes, and then save by pressing the esc key." + "\n" + messageFromOpenai;

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





        // setChatLog([
        //     ...chatLog, {
        //         user: "gpt",
        //         execution_id: resp['_id'],
        //         message: resultMessage
        //     }
        // ])

        setChatLog(chatLog=>[
            ...chatLog, {
                user: "gpt",
                execution_id: resp['_id'],
                message: resultMessage
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
        let experimentID = experiment.data._id;
        
         
        let data = await getChatMessageByExperimentId(experimentID);

        // console.log("setTapTitlesFunc-data", data)

        // if numChatBox > dataFiltered.length, call getChatMessageByExperimentId again
        // filter data based on experiment id
        let dataFiltered = data.filter(function (el) {
            return el._experiment_id == experimentID;
        });

        // console.log("setTapTitlesFunc-dataFiltered", dataFiltered)

        // console.log("setTapTitlesFunc-numChatBox", numChatBox)
        // console.log("setTapTitlesFunc-dataFiltered.length", dataFiltered.length)
        
        // console.log("setTapTitlesFunc-experimentID", experimentID)
        if (numChatBox > dataFiltered.length) {
            // console.log("setTapTitlesFunc-numChatBox > dataFiltered.length")
            // console.log("setTapTitlesFunc-numChatBox", numChatBox)
            // console.log("setTapTitlesFunc-dataFiltered.length", dataFiltered.length)
            const newData = await getChatMessageByExperimentId(experimentID);
            data = data.concat(newData);
            dataFiltered = data.filter(function (el) {
                return el._experiment_id == experimentID;
            });

            // console.log("setTapTitlesFunc-inwhile-dataFiltered", dataFiltered)

            // for some reason, the data is redundant, so we need to remove the redundant data...

            // remove redundant data
            dataFiltered = dataFiltered.filter((v,i,a)=>a.findIndex(t=>(t._id === v._id))===i)

            // console.log("setTapTitlesFunc-inwhile-nonredundant-dataFiltered", dataFiltered)
        }


        // console.log(`setTapTitlesFunc-data length: ${data.length}`);
        // console.log(`setTapTitlesFunc-filtered data length: ${dataFiltered.length}`);
        
        // get the title of each chat from data
        for (let i = 0; i < dataFiltered.length; i++){
            tempTapTitles[i] = dataFiltered[i]['title'];
        }

        //

        // console.log("setTapTitlesFunc-tempTapTitles", tempTapTitles)

        setTapTitles({...tapTitles, taptitles: tempTapTitles});   

        // console.log("setTapTitlesFunc-tapTitles", tapTitles)
    }

    function checkStatus(response) {
        console.log("checkStatus-response", response)
        if (response.status >= 400) {
          //console.log(`error: ${response.error}`)
          var error = new Error(`${response.status}: ${response.statusText} : ${response.url}`);
          error.response = response;
          throw error;
        } else {
          return response
        }
      };
    
    let data_id = experiment.data._dataset_id;
    let experiment_data_id = experiment.data._id;

    return (
        <div className="ChatGPT">
            {
                // <AllContext.Provider value={{}}>
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
                // </AllContext.Provider>
            }

            {/* chatLog, setChatInput, handleSubmit, chatInput */}
            <ChatBox
                chatInput={chatInput}
                chatLog={chatLog}
                // setChatLog={setChatLog}
                setChatInput={setChatInput}
                // handleSubmit={handleSubmit}
                handleSubmit={handleSubmit}

                

                modeForChatOrCodeRunning = {modeForChatOrCodeRunning}
                setModeForChatOrCodeRunning = {setModeForChatOrCodeRunning}

                // extractedCode = {extractedCode}
                // checkIfCode = {checkIfCode}
                // extractCode = {extractCode}

                datasetId = {experiment.data._dataset_id}
                experimentId = {experiment.data._id}

                updateAfterRuningCode = {updateAfterRuningCode}

                modeForTabluerData = {modeForTabluerData}
                setModeForTabluerData = {setModeForTabluerData}

                booleanPackageInstall = {booleanPackageInstall}
                setBooleanPackageInstall = {setBooleanPackageInstall}


                submitErrorWithCode = {submitErrorWithCode}

                showCodeRunningMessageWhenClickRunBtn = {showCodeRunningMessageWhenClickRunBtn}

                getChatMessageByExperimentId = {getChatMessageByExperimentId}
                chatCurrentTempId = {chatCurrentTempId}

                getSpecificChatbyChatId = {getSpecificChatbyChatId}

                patchChatToDB = {patchChatToDB}

                checkCodePackages = {checkCodePackages}

            />
            <ThemeContext.Provider value={{isDark, setIsDark, currentModel,setCurrentModel,experiment_data_id}}>
                <TestPage/>
            </ThemeContext.Provider>




        </div>
    );
}