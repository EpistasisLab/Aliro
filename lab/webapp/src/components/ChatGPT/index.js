// import "./normal.css"; import "./ChatGPT.css";
import {useState, useEffect} from "react";
import React from 'react';
import SideMenu from "./SideMenu";
import ChatBox from "./ChatBox";
import { locales } from 'moment';

// export default function ChatGPT() {     return (         <div
// style={{                         overflowY: 'auto',
// maxHeight: '350px',                           red color
// backgroundColor: '#ff0000'                     }}
// className='table-sticky-header file-upload-table'>                     <p>new
// GPT!!!</p>                 </div>     ); }

export default function ChatGPT({experiment}) {
    // readdatafromlocalstorage();

    var limitNumChatBox = 5;

    useEffect(() => {




        var url = window.location.href;
        var urlSplit = url.split("/");
        var experimentId = urlSplit[urlSplit.length - 1];

        getEngines();
        // postChats();
        // getAllChats();


        initailChatBoxSetting();
        
        getAllChatsFilterbyExpIdSetChatbox();

        console.log("chatCurrentTempId-useEffect", chatCurrentTempId);

        console.log("numChatBox-useEffect", numChatBox);

        // Promise.then(() => {
        //     console.log("Promise.then");
        //     con



        // getSpecificChat("641e954eb2663354ec5d62ab");
        
        // getSpecificChat(`${experimentId}`);
        // patchSpecificChat("641e2fc2b2663354ec5d5276", "Choi's chat", "63f6e4947c5f93004a3e3ca7", "63f6e4947c5f93004a3e3ca7")
        // deleteSpecificChat("641e31ddb2663354ec5d52b8");






        // postInChatlogs();
        // patchChatlog();
        // getChatMessage();
    }, 
    // make useEffect run when numChatBox changes or when experimentId changes
    // [numChatBox],
    [window.location.href],
    // [chatBoxTrigger]
    // [chatLog]
    // []
    )


    const [chatInput, setChatInput] = useState("");
    const [models, setModels] = useState([]);
    const [temperature, setTemperature] = useState(0.5);
    // const [currentModel, setCurrentModel] = useState("text-davinci-003");
    const [currentModel, setCurrentModel] = useState("gpt-3.5-turbo");
    const [chatLog, setChatLog] = useState([
        {
            user: "gpt",
            message: "How can I help you today?"
        }
    ]);



    // this is the number of chat boxes in the result page
    const [numChatBox, setNumChatBox] = useState(1);
    // const [numChatBox, setNumChatBox] = useState([0]);

    // this is the current chat box id where user is typing
    const [chatCurrentTempId, setChatCurrentTempId] = useState(1);

    // const [testID, setTestID] = useState(0);
    // true or false trigger for chat box
    // const [chatBoxTrigger, setChatBoxTrigger] = useState(false);

    // get chatlogs from db 
    // let chatId = localStorage.getItem("chatId");
    // getSpecificChat(chatId);

    // console.log("testID", testID);

    // 

    // clear chats
    function clearChat() {
        setChatLog([]);
    }




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
                // console.log("allChat", data);

                

                // get the experiment id from the url
                let url = window.location.href;
                // split url by /
                let urlSplit = url.split("/");
                // console.log("urlSplit", urlSplit);
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

                console.log("filteredChatsWithoutNull.length", filteredChatsWithoutNull.length);

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
                    
                    // console.log("allSpecificChat", data);

                    // let chatLogNew =[
                    //     {
                    //         user: "gpt",
                    //         message: "How can I help you today?"
                    //     }
                    // ]

                    let chatLogNew = [];
    
                    for (let i = 0; i < data["chatlogs"].length; i++) {
                        
                        chatLogNew = [
                            ...chatLogNew, {
                                user: data["chatlogs"][i]["who"],
                                message: data["chatlogs"][i]["message"]
                            }
                        ]
    
    
                    }
    
                    // console.log("chatLogNew-loop", chatLogNew);
    
                    setChatLog(chatLogNew);
                    
                    // console.log("success2")
                })
                .catch(err => {
                    console.log("err--best--getSpecificChat",err);
                })
            
                



                
            })
            .catch(err => {
                console.log("err--best--getAllChats",err);
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
                console.log("data--best--postInChatlogs", data);
            })
            .catch(err => {
                console.log("err--best--postInChatlogs",err);
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


            console.log("initailChatBoxSetting");
          

                // get the experiment id from the url
                let url = window.location.href;
                // split url by /
                let urlSplit = url.split("/");
                // console.log("urlSplit", urlSplit);
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
                                                console.log("success1")
                                                // get all chats for this experiment id to frontend
                                                getAllChatsFilterbyExpIdSetChatbox();
                                            })
                                            .catch(err => {
                                                console.log("err--best--postChat",err);
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
        // split url by /
        let urlSplit = url.split("/");
        // console.log("urlSplit", urlSplit);
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

        
        // var chatCurrentId=chatCurrentTempId-1;
        // var chatCurrentId=chatCurrentTempId;

        

        console.log("experimentId", experimentId);


        

        // find chat_id "641e954eb2663354ec5d62ab" using experiment_id experimentId 642075a730975a002cef29b5

        // GET http://localhost:5080/chatapi/v1/chats/experiment/${experimentId}

        fetch(`/chatapi/v1/chats/experiment/${experimentId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            })
            .then(res => res.json())
            .then(data => {
                console.log("data--best--experiment", data);
                // filter the data using _experiment_id
                var filteredData= data.filter((item) => item._experiment_id === experimentId)

                console.log("filteredData", filteredData);

                console.log("chatCurrentTempId-han", chatCurrentTempId-1);

                console.log("filteredData[chatCurrentTempId",filteredData[chatCurrentTempId-1])

                console.log("filteredData[chatCurrentTempId]['_id']",filteredData[chatCurrentTempId-1]['_id'])

                if (chatInput !== undefined || chatInput !== ""){
                    postInChatlogs(filteredData[chatCurrentTempId-1]['_id'], chatInput, "text", "user");

                    // console.log("chatInput", chatInput);
                }


                console.log("after-filteredData[chatCurrentTempId",filteredData[chatCurrentTempId-1])






                // fetch response to the api combining the chat log array of messages and
                // seinding it as a message to localhost:3000 as a post
                const messages = chatLogNew
                .map((message) => message.message)
                .join("\n")

                console.log("chatLogNew", chatLogNew)

                // get the last message from the chatLogNew array
                let lastMessageFromUser = chatLogNew[chatLogNew.length - 1].message;

                console.log("lastMessageFromUser", lastMessageFromUser);

                



                
            
            // jay's api
            fetch("openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(
                    {
                        "model": currentModel,
                        // "messages": [{"role": "user", "content": "Say this is a test!"},{"role": "user", "content": "Say this is a test!"}],
                        "messages": [{"role": "user", "content": lastMessageFromUser}],
                        // "temperature": 0.7
                    }
                )
            })
            

                

            
            // original
            // fetch("http://localhost:3080/", {
              
            //     method: "POST",
            //     headers: {
            //         "Content-Type": "application/json"
            //     },
            //     body: JSON.stringify({message: messages, currentModel})
            // })





            // to use current below, i need to use the below code in the openai.js file
            // chat completions to use text-davinci-003 models
            // router.post('/chat/completions', async (req, res) => {
            // 	const { message, currentModel, temperature } = req.body;
            // 	const response = await openai.createCompletion({
            // 		model: `${currentModel}`,// "text-davinci-003",
            // 		prompt: `${message}`,
            // 		max_tokens: 100, 
            // 		temperature,
            // 	  });
            // 	res.json({
            // 		message: response.data.choices[0].text,
            // 	})
            // });

            // current
            // fetch("openai/v1/chat/completions/", {
              
            //     method: "POST",
            //     headers: {
            //         "Content-Type": "application/json"
            //     },
            //     body: JSON.stringify({message: messages, currentModel})
            // })



            .then(res => res.json())
            .then(data => {

                // console.log("data--best--openai", data);
                // console.log("data--best--openai--data.choices", data.choices);

                console.log("data--best--openai--data.choices.message[0]", data.choices[0].message['content']);

                var messageFromOpenai = data.choices[0].message['content'];
                



                // postInChatlogs(filteredData[chatCurrentTempId-1]['_id'], data.message, "text", "gpt");

                postInChatlogs(filteredData[chatCurrentTempId-1]['_id'], messageFromOpenai, "text", "gpt");
                
                // setChatLog([
                //     ...chatLogNew, {
                //         user: "gpt",
                //         message: `${data.message}`
                //     }
                // ])

                setChatLog([
                    ...chatLogNew, {
                        user: "gpt",
                        message: `${messageFromOpenai}`
                    }
                ])



                var scrollToTheBottomChatLog = document.getElementsByClassName("chat-log")[0];
                scrollToTheBottomChatLog.scrollTop = scrollToTheBottomChatLog.scrollHeight;


                // let newChat =[
                //     ...chatLogNew, {
                //         user: "gpt",
                //         message: `${data.message}`
                //     }
                // ]

                // console.log("chatLogNew--best", newChat);
            })




                

            })
            .catch(err => {
                console.log("err--handleSubmit",err);
            })




        // setChatInput("");
        // setChatLog(chatLogNew)




        

        // // fetch response to the api combining the chat log array of messages and
        // // seinding it as a message to localhost:3000 as a post
        // const messages = chatLogNew
        //     .map((message) => message.message)
        //     .join("\n")

        // const response = await fetch("http://localhost:3080/", {
        //     method: "POST",
        //     headers: {
        //         "Content-Type": "application/json"
        //     },
        //     body: JSON.stringify({message: messages, currentModel})
        // });
        // const data = await response.json();


        // postInChatlogs("641e954eb2663354ec5d62ab", data.message, "text", "gpt");
        
        // setChatLog([
        //     ...chatLogNew, {
        //         user: "gpt",
        //         message: `${data.message}`
        //     }
        // ])



        // var scrollToTheBottomChatLog = document.getElementsByClassName("chat-log")[0];
        // scrollToTheBottomChatLog.scrollTop = scrollToTheBottomChatLog.scrollHeight;


        // let newChat =[
        //     ...chatLogNew, {
        //         user: "gpt",
        //         message: `${data.message}`
        //     }
        // ]

        // console.log("chatLogNew--best", newChat);



        



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
                // <SideMenu
                // currentModel={currentModel}
                // setCurrentModel={setCurrentModel}
                // models={models}
                // setTemperature={handleTemp}
                // temperature={temperature}
                // clearChat={clearChat}
                // chatInput={chatInput}
                // chatLog={chatLog}
                // setChatLog = {setChatLog}
                // setChatInput={setChatInput}
                // handleSubmit={handleSubmit}
                // /> 
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

                    limitNumChatBox={limitNumChatBox}
                />
            }
            <ChatBox
                chatInput={chatInput}
                chatLog={chatLog}
                setChatLog={setChatLog}
                setChatInput={setChatInput}
                handleSubmit={handleSubmit}
                experiment={experiment}/>

            {/* <button onClick={()=>setNumChatBox(chatTempId + 1)} >click</button> */}
            
            {/* chatBoxTrigger, setChatBoxTrigger */}
            {/* <button onClick = {()=>setChatBoxTrigger(!chatBoxTrigger)} >click</button> */}
        </div>
    );
}
