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
    const [chatLog, setChatLog] = useState();
    const [chatID, setChatID] = useState();



    getCurrentChat(experiment);
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
                    setChatLog([]);
                }else{
                    setChatID(chat[0]._id);
                    fetch("http://localhost:5080/chatapi/v1/chats/"+chat[0]._id)
                        .then(res => res.json())
                        .then(data => {
                            console.log("chat logs", data);
                            setChatLog(data.chatlogs);
                        });
                }
        });
    }
    formatPrompt(experiment);
    async function formatPrompt(experiment,prompt){
        /**
         * assume you are a data scientist. You are given a model mod and dataframe df with the following performance:
         * {"params": {
                "criterion": "gini",
                "max_depth": 3,
                "min_samples_split": 2,
                "min_samples_leaf": 1,
                "min_weight_fraction_leaf": 0,
                "max_features": "sqrt"
            },
            "algorithm": "DecisionTreeClassifier",
            "scores": {
                "roc_auc_score": "not supported for multiclass",
                "train_roc_auc_score": "not supported for multiclass",
                "train_score": 0.9794444444444445,
                "test_score": 0.9549999999999998,
                "accuracy_score": 0.9549999999999998,
                "exp_table_score": 0.9549999999999998,
                "train_balanced_accuracy_score": 0.9794444444444445,
                "balanced_accuracy_score": 0.9549999999999998,
                "train_precision_score": 0.9733009645824623,
                "precision_score": 0.9488095238095239,
                "train_recall_score": 0.9725925925925925,
                "recall_score": 0.9400000000000001,
                "train_f1_score": 0.97257547205857,
                "f1_score": 0.9389730639730638,
                "dtree_train_score": 1
            },
            feature_importance_type,
            features_names: ['sepal-length', 'sepal-width', 'petal-length', 'petal-width'],
            feature_importances: [0.         0.         0.42105263 0.57894737]
            }

         */
        const { Configuration, OpenAIApi } = require("openai");

        const configuration = new Configuration({
        apiKey: "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",
        });
       
        const openai = new OpenAIApi(configuration);

        const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [{role: "user", content: "Hello world"}],
        });
        console.log(completion.data.choices[0].message);

        console.log(chatID);

        console.log(experiment.data.params);
        console.log(experiment.data.algorithm);
        console.log(experiment.data.scores);
        console.log(experiment.data.feature_importance_type);
        console.log(experiment.data.feature_importances);
        console.log(experiment.data.feature_names);
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
                message: `${chatInput}`
            }
        ];
        console.log("chatLogNew", chatLogNew)
        setChatInput("");
        setChatLog(chatLogNew);
        // fetch response to the api combining the chat log array of messages and
        // seinding it as a message to localhost:3000 as a post
        const messages = chatLogNew
            .map((message) => message.message)
            .join("\n");


        const data = await response.json();
        setChatLog([
            ...chatLogNew, {
                user: "gpt",
                message: `${data.message}`
            }
        ]);
        var scrollToTheBottomChatLog = document.getElementsByClassName("chat-log")[0];
        scrollToTheBottomChatLog.scrollTop = scrollToTheBottomChatLog.scrollHeight;
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



