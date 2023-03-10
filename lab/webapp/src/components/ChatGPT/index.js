// import "./normal.css";
// import "./ChatGPT.css";
import {useState, useEffect} from "react";
import React from 'react';
import SideMenu from "./SideMenu";
import ChatBox from "./ChatBox";


function readdatafromlocalstorage() {
    let data = Object.keys(localStorage);
    console.log(data);

    // console.log("readdatafromlocalstorage()");
    return data;
}

// export default function ChatGPT() {
//     return (
//         <div
//                     style={{
//                         overflowY: 'auto',
//                         maxHeight: '350px',
//                          // red color
//                         backgroundColor: '#ff0000'

//                     }}
                   
//                     className='table-sticky-header file-upload-table'>
//                     <p>new GPT!!!</p>
//                 </div>

//     );
// }





export default function ChatGPT({experiment}) {
    // readdatafromlocalstorage();


    console.log("experiment data in ChatGPT", experiment.data);


    const [chatInput, setChatInput] = useState("");
    const [models, setModels] = useState([]);
    const [temperature, setTemperature] = useState(0.5);
    const [currentModel, setCurrentModel] = useState("gpt-3.5-turbo");
    const [chatLog, setChatLog] = useState([
        {
            messageid : 0,
            user: "assistant",
            messageType:"text",
            message: "Select your algorithm:",
            buttons: ["Decision Tree Classifier", "Gradient Boosting Classifier","K Neighbors Classifier", "SVC", "Logistic Regression", "Random Forest Classifer"],
            selected: experiment.data.algorithm
        },
        {
            messageid : 1,
            user: "assistant",
            messageType:"text",
            message: "Hyperparameters:"+JSON.stringify(experiment.data.params)
        },
        {
            messageid : 2,
            user: "assistant",
            messageType:"text",
            message: "Starting Training... "+JSON.stringify(experiment.data.started)
        },
        {
            messageid : 3,
            user: "assistant",
            messageType:"text",
            message: "Finished Training! "+JSON.stringify(experiment.data.finished)
        },
        {
            messageid : 3,
            user: "assistant",
            messageType:"text",
            message: "Here are some information about your model:"
        },
        {
            messageid : 4,
            user: "assistant",
            messageType:"showMLpElement"
        },
        {
            messageid : 5,
            user: "assistant",
            messageType:"text",
            message: "Here are some information about your dataset:"
        },
        {
            messageid : 6,
            user: "assistant",
            messageType:"showEDAElement"
        }
    ]);
    const [chatID, setChatID] = useState();



    
    // clear chats
    function clearChat() {
        setChatLog([]);
    }

    function getCurrentChat(experiment){
        

        fetch("http://localhost:5080/chatapi/v1/chats/")
            .then(res => res.json())
            .then(data => {
                console.log("all chats ",data);
                console.log("experiment",experiment);
                //sear
                var chat = data.filter(chat => chat._experiment_id === experiment.data._id);
                if(chat.length === 0){
                    console.log("create new chat");
                    createNewChat(experiment);
                }else{
                    setChatID(chat[0]._id);
                    fetch("http://localhost:5080/chatapi/v1/chats/"+chat[0]._id)
                        .then(res => res.json())
                        .then(data => {
                            console.log("chat logs", data);
                            setChatLog( [
                                ...chatLog, ...data.chatlogs
                            ]);
                        });
                }
        });
    }
    // useEffect(() => {
    //     getCurrentChat(experiment);
    // }, [experiment]);
    // useEffect(() => {
    //     formatPrompt(experiment,"what is the most important feature?", chatID);
    // }, [chatID]);
    
    async function formatPrompt(experiment,prompt, chatID){

        console.log(chatID);
       
        // combine feature_importances and feature_names into a dictionary
        var feature_importances = {};
        for (var i = 0; i < experiment.data.feature_importances.length; i++) {
            feature_importances[experiment.data.feature_names[i]] = experiment.data.feature_importances[i];
        }
        const { Configuration, OpenAIApi } = require("openai");

        const configuration = new Configuration({
        apiKey: OPENAI_API_KEY,
        });
       
        const openai = new OpenAIApi(configuration);

        const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{role: "user", content: `assume you are a data scientist that only programs in python. You are given a model mod and dataframe df with the following performance:
        {"params": `+ JSON.stringify(experiment.data.params) +`,
           "algorithm": "`+ experiment.data.algorithm +`",
           "scores": `+ JSON.stringify(experiment.data.scores) +`,
           feature_importance_type : "`+ experiment.data.feature_importance_type +`",
           feature_importances: `+ JSON.stringify(feature_importances) +`
           }\n you are asked: `+ prompt}]
        });
        console.log("openai request: ", completion);
        return completion.data.choices[0].message;
    }


    function createNewChat(experiment){
        //        title: req.body.title,
        // _dataset_id: req.body._dataset_id,
        // _experiment_id: req.body._experiment_id,
        var details = {
            'title': 'main',
            '_dataset_id': experiment.data._dataset_id,
            '_experiment_id': experiment.data._id
        };
        var formBody = [];
        for (var property in details) {
            var encodedKey = encodeURIComponent(property);
            var encodedValue = encodeURIComponent(details[property]);
            formBody.push(encodedKey + "=" + encodedValue);
        }
        formBody = formBody.join("&");
        const response = fetch("http://localhost:5080/chatapi/v1/chats", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: formBody
        });
        const data = response.json();
    }

    
    async function handleSubmit(e) {
        e.preventDefault();
        let chatLogNew = [
            ...chatLog, {
                user: "me",
                messageType: "text",
                message: `${chatInput}`
            }
        ];
        console.log("chatLogNew", chatLogNew)
        setChatInput("");
        setChatLog(chatLogNew);
        window.scrollTo(0, document.body.scrollHeight);
        
        let data = await formatPrompt(experiment,`${chatInput}`, chatID);
        const regex = /```([^`]*)```/g;
        const matches = data.content.matchAll(regex);
        
        for (const match of matches) {
            //check if the first 6 characters are python
            if(match[1].substring(0,6) === "python"){
                //remove the first 6 characters
                match[1] = match[1].substring(6);
            }
          console.log("python code:",match[1]);
          
        }

        setChatLog([
            ...chatLogNew, {
                user: "assistant",
                messageType: "text",
                message: data.content.split(/\n/).map(line => <div key={line}>{line}</div>)
            }
        ]);

        // scroll to the bottom of the page
        window.scrollTo(0, document.body.scrollHeight);
        
    }

    function handleTemp(temp) {
        if (temp > 1) {
            setTemperature(1);
        } else if (temp < 0) {
            setTemperature(0);
        } else {
            setTemperature(temp);
        }
    }

    return (
        <div className="ChatGPT">
            {/* <SideMenu
                currentModel={currentModel}
                setCurrentModel={setCurrentModel}
                models={models}
                setTemperature={handleTemp}
                temperature={temperature}
                clearChat={clearChat}
                chatInput={chatInput}
                chatLog={chatLog}
                setChatLog = {setChatLog}
                setChatInput={setChatInput}
                handleSubmit={handleSubmit}
                /> */}
            <ChatBox
                chatInput={chatInput}
                chatLog={chatLog}
                setChatLog={setChatLog}
                setChatInput={setChatInput}
                handleSubmit={handleSubmit}
                experiment={experiment}
                />
        </div>
    );
}



