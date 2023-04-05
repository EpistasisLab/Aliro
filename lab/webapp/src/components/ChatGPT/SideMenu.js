import React, { useState, useEffect } from "react";





export default function SideMenu({
    clearChat,
    currentModel,
    setCurrentModel,
    models,
    setTemperature,
    temperature,

    chatLog,
    setChatLog,

    chatCurrentTempId, 
    setChatCurrentTempId,

    
    numChatBox,
    setNumChatBox,

    lanModelReset, 
    setLanModelReset,

    limitNumChatBox,

    currentExpId,
    setCurrentExpId,

}
    
) {

    useEffect(() => {

        // get experiment id from url
        let url = window.location.href;
        let urlSplit = url.split('/');
        let experimentID = urlSplit[urlSplit.length - 1];

        
        checkNumChatBox();
        setBoldUnderlineAndInitTraIc();
        setCurrentExpId(experimentID);

    }, 
    [window.location.href, numChatBox]
    // [window.location.href]
    
    );






   function getAllChatsAndGetSpecificChatBasedOnExpID(clickedChatBoxNum, setChatLog) {

        // get current url
        let url = window.location.href;
        let urlSplit = url.split('/');
        let experimentID = urlSplit[urlSplit.length - 1];


        // GET http://localhost:5080/chatapi/v1/chats
       fetch(`/chatapi/v1/chats/experiment/${experimentID}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(res => res.json())
            .then(data => {
                

                // filter data based on experiment id
                let dataFiltered = data.filter(function (el) {
                    return el._experiment_id == experimentID;
                });

                data=dataFiltered;

                console.log("data[clickedChatBoxNum]", data[clickedChatBoxNum])

                if (data[clickedChatBoxNum] == undefined ) {
                    
                    // POST http://localhost:5080/chatapi/v1/chats
                    // Content-Type: application/json

                    // {
                    //     "title" : "`${experimentID}`",
                    //     "_experiment_id": "641e7a67c3386b002e521705",
                    //     "_dataset_id": "63f6e4947c5f93004a3e3ca7"
                    // }

                    // current url 
                    let url = window.location.href;
                    let urlSplit = url.split('/');
                    let experimentID = urlSplit[urlSplit.length - 1];


                    fetch("/chatapi/v1/chats", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            "title": `${experimentID}`,
                            "_experiment_id": `${experimentID}`,
                            "_dataset_id": `${experimentID}`
                        })
                    })
                    .then(res => res.json())
                    .then(data => {
                        // console.log("data-newchat", data);


                        // POST http://localhost:5080/chatapi/v1/chatlogs
                        // Content-Type: application/json

                        // {
                        //     "_chat_id" : "641f26a1b2663354ec5d634f",
                        //     "message" : "Hello there from my desk!!!!!!b",
                        //     "message_type" : "text",
                        //     "who" : "user"
                        // }

                        fetch("/chatapi/v1/chatlogs", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                "_chat_id": `${data['_id']}`,
                                "message": "How can I help you today?",
                                "message_type": "text",
                                "who": "gpt"
                            })
                        })



                        let chatLogNew = [
                            {
                                user: "gpt",
                                message: "How can I help you today?"
                            }
                        ]

                        setChatLog(chatLogNew);

                    }) 
                    .catch(err => {
                        console.log("err", err);
                    }
                    )


                    
                }
                else{

                    // Get existing chatlogs
                    // GET http://localhost:5080/chatapi/v1/chats/${data[clickedChatBoxNum]['_id']}

                    fetch(`/chatapi/v1/chats/${data[clickedChatBoxNum]['_id']}`, {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json"
                        }
                    })
                    .then(res => res.json())
                    .then(data => {
                        console.log("data['chatlogs']", data['chatlogs']);

                        // let chatLogNew = [
                        //     {
                        //         user: "gpt",
                        //         message: "How can I help you today?"
                        //     }
                        // ]

                        let chatLogNew = []
            
                        
                        for (let i = 0; i < data["chatlogs"].length; i++) {
            
                            // chatLogNew = [
                            //     ...chatLogNew, {
                            //         user: data["chatlogs"][i]["who"],
                            //         message: data["chatlogs"][i]["message"]
                            //     }
                            // ]

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
                        console.log("err--getAllChatsAndGetSpecificChat-sidemenu-in", err);
                    });
                }

            })
            .catch(err => {
                console.log("err--getAllChatsAndGetSpecificChat-sidemenu-out", err);
            });
    
    }


    async function checkClickedChatboxTab(e) {


        // 
        // first, clear the context of the chat completions endpoint. (refer to the jay's message on slack)
            // in the openai api, is there a way to clear the context of the chat completions endpoint?
            // Yes, in the OpenAI API, you can clear the context of the chat completions endpoint by sending an empty string as the value for the context parameter.
            // For example, if you're using the Python client, you can make a request to the completions method with an empty string as the context parameter like this:
            
                
                // In getAllChatsAndGetSpecificChatBasedOnExpID function, in the case where data[clickedChatBoxNum] == undefined,
                // clear the context of the chat completions endpoint. And then, post with "How can I help you today?" to the openai api (chat/completions).
        
        // second, feed current chatlog of clicked chatbox to the chat completions endpoint. 

                
                // In getAllChatsAndGetSpecificChatBasedOnExpID function, in the case where data[clickedChatBoxNum] != undefined, // clear the context of the chat completions endpoint. And then, post with chatlog of clicked chatbox to the openai api (chat/completions).

        
        if (e.target.childNodes[1].nodeValue === 'New Chat') {
            console.log("e.target.childNodes[1].nodeValue is New Chat")

            // this is the number of chat boxes in the result page
            // numChatBox, setNumChatBox

            var countClickedChatBoxID = numChatBox+1

            // setNumChatBox(countClickedChatBoxID)
             
        }
        else{

            
            var siblings = e.target.parentNode.parentNode.childNodes;

            for (var i = 1; i < siblings.length-1; i++) {
                console.log("siblings[i]",siblings[i])

                if (e.target.parentNode === siblings[i]) {
                    siblings[i].style.fontWeight = "bold";
                    // siblings[i].style.textDecoration = "underline";
                }
                else{
                    siblings[i].style.fontWeight = "normal";
                    // siblings[i].style.textDecoration = "none";
                }
            }

            var currentClickedChatBoxID = parseInt(e.target.childNodes[1].nodeValue);
            console.log("currentClickedChatBoxID",currentClickedChatBoxID)

        
            // Add 1 to currentClickedChatBoxID
            var countClickedChatBoxID = currentClickedChatBoxID + 1;
            console.log("countClickedChatBoxID",countClickedChatBoxID)

            
        } 
        // first chatbox is 1, second chatbox is 2, third chatbox is 3, etc.
        setChatCurrentTempId(countClickedChatBoxID)

        var clickedChatBoxNum = e
            .target
            .childNodes[1]
            .nodeValue;
        // getAllChatsAndGetSpecificChat(clickedChatBoxNum, setChatLog);
        getAllChatsAndGetSpecificChatBasedOnExpID(clickedChatBoxNum, setChatLog);

        // make lanModelReset true
        setLanModelReset(lanModelReset=true)
    }

    function clearAllTrashIcons (nodes) {

        for (var i = 1; i < nodes.childNodes.length-1; i++) {
            nodes.childNodes[i].childNodes[1].style.display = "none";
            nodes.childNodes[i].childNodes[1].innerHTML = "🗑️";
        }
    }




    // This function is to check if the number of chat boxes is equal to or greater than the limit, and if so, make the new chat button not clickable
    function checkNumChatBox() {
        
        if (numChatBox + 1 > limitNumChatBox) {
            
            document.getElementById("newchatbutton").style.pointerEvents = "none";
        }
        else{
            document.getElementById("newchatbutton").style.pointerEvents = "auto";
        }
    }


    function changeTrashToCheck(node, reverse) {
        if (reverse==true){
            node.innerHTML = "🗑️";
            // console.log("node.innerHTML",node.innerHTML)
        }
        else{
            node.innerHTML = "✔︎";
            console.log("node.innerHTML",node.innerHTML)
        }
    }

    function removeCorChat(e) {

        if(e.target.parentNode.childNodes[1].innerHTML == "✔︎")
        {
           
            var textClickedChatBox = e.target.parentNode.childNodes[0].childNodes[2].childNodes[0].textContent;

            console.log("textClickedChatBox",textClickedChatBox)

            // parse textClickedChatBox with _
            var textClickedChatBoxIdString = textClickedChatBox.split("_")[1];

            // convert textClickedChatBoxIdString to integer
            var textClickedChatBoxId = parseInt(textClickedChatBoxIdString);

            // remove the clicked chatbox tap from DB
            // To do this, first get the experiment id from the url
            // After that, get the all chats from the DB using the experiment id
            // Then, remove the chat using the textClickedChatBox
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

                    // filter out the chats that has the same experiment id 
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

                // DELETE /chatapi/v1/chats/6421ebd85dc44d80542362c4

                // remove the chat from DB
                fetch("/chatapi/v1/chats/" + filteredChatsWithoutNull[textClickedChatBoxId]['_id'], {
                    method: "DELETE",
                    headers: {
                    "Content-Type": "application/json"
                },
                })
                .then(res => res.json())
                .then(data => {
                   
                    filteredChatsWithoutNull.splice(textClickedChatBoxId,1)

                    if (filteredChatsWithoutNull.length>0)
                    {
                        fetch("/chatapi/v1/chats/" + filteredChatsWithoutNull[filteredChatsWithoutNull.length-1]['_id'], {
                            method: "GET",
                            headers: {
                            "Content-Type": "application/json"
                        },
                        })
                        .then(res => res.json())
                        .then(data => {
                            console.log("data-get",data)

                            let chatLogNew = [];

                            for (let i = 0; i < data["chatlogs"].length; i++) {
                
                                chatLogNew = [
                                    ...chatLogNew, {
                                        user: data["chatlogs"][i]["who"],
                                        message: data["chatlogs"][i]["message"]
                                    }
                                ]
                
                            }
                            console.log("chatLogNew-clicked",chatLogNew)

                            setChatLog(chatLogNew);

                            setNumChatBox(numChatBox-1)
                            setChatCurrentTempId(numChatBox-1)

                        })
                        .catch(err => {
                            console.log("err-get",err)
                        })
                    }
                    else
                    {   
                        // When filteredChatsWithoutNull.length == 0, if user remove the chatbox_0, it will reset the chatbox_0 with How can I help you today? by gpt. And this should be posted to the DB with the experimentId.

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

                                    
    
    
                                }

                                
                                
                                let chatLogNew = [
                                    {
                                        user: "gpt",
                                        message: "How can I help you today?"
                                    }
                                ]
                                setChatLog(chatLogNew);
                                setNumChatBox(1)
                                setChatCurrentTempId(1)
                            })
                            .catch(err => {
                                console.log("err--best",err);
                            })

                        
                        
                    }

                })
                .catch(err => {
                    console.log("err-delete-chatboxtap",err)
                })

                })

                .catch(err => {
                    console.log("err--best--getAllChats",err);
                })
            






            // if the chatbox tap was only one, when user remove the chat, it will remove from the DB, but the chatbox will show "How can I help you today?"

            // if the chatbox tap was more than one, when user remove the chat, it will remove from the DB, and the chatbox will show the left chatbox tap or the right chatbox tap.


        }
        // console.log("e.target", e.target)

        // console.log("e.target.parentNode", e.target.parentNode)

        // console.log("e.target.parentNode.childNodes[0]", e.target.parentNode.childNodes[0])

        // console.log("e.target.parentNode.childNodes[1]", e.target.parentNode.childNodes[1])

        // changeTrashToCheck(e.target.parentNode.childNodes[1])

        

        // console.log("e.target.parentNode.childNodes", e.target.parentNode.childNodes)


        // console.log("e.target.parentNode.childNodes[0].childNodes", e.target.parentNode.childNodes[0].childNodes)

        // console.log("e.target.parentNode.childNodes[0].childNodes[2]", e.target.parentNode.childNodes[0].childNodes[2])

        // console.log("e.target.parentNode.childNodes[0].childNodes[1]", e.target.parentNode.childNodes[0].childNodes[1])

        // console.log("e.target.parentNode.childNodes[0].childNodes[2].childNodes", e.target.parentNode.childNodes[0].childNodes[2].childNodes)

        // console.log("e.target.parentNode.childNodes[0].childNodes[2].childNodes[0]", e.target.parentNode.childNodes[0].childNodes[2].childNodes[0])


        // console.log("e.target.parentNode.childNodes[0].childNodes[2].childNodes[0].textContent", e.target.parentNode.childNodes[0].childNodes[2].childNodes[0].textContent)

        

        
        






    }

    function setBoldUnderlineAndInitTraIc() {

        //get div with class name sidemenu
        var sidemenu = document.getElementsByClassName("chatboxtap");
       // length of sidemenu
        var sidemenuLength = sidemenu.length;

        if (sidemenuLength>0) {
            
            for (var i = 0; i < sidemenu.length-1; i++) {
                sidemenu[i].style.fontWeight = "normal";
            }
        
        
            sidemenu[sidemenu.length-1].style.fontWeight = "bold";

            // Trash emoji for each chatboxtap
            for (var i = 0; i < sidemenu.length; i++) {
                
                sidemenu[i].childNodes[1].style.display = "none";
                        
            }

            sidemenu[sidemenu.length-1].childNodes[1].style.display = "block";

        }
        
        
      
      
      
      
      }

    return (
        <div>
            <aside className="sidemenu">

                {/* <div className="side-menu-button" onClick={() => setNumChatBox(numChatBox + 1)}> */}
                <div className="side-menu-button" id="newchatbutton" onClick={ 
                    (e) =>
                    {
                        setNumChatBox(numChatBox + 1)
                        checkClickedChatboxTab(e)
                        checkNumChatBox()
                    }
                }>
                    <span>+</span>
                    New Chat 
                    {/* <div style={{display: 'hidden'}}>🗑</div> */}
                </div>

                {
                    Array(numChatBox)
                        .fill()
                        .map(
                            (_, i) =>
                            <div className="sidemenu chatboxtap"> 
                                <div className="side-menu-button" 
                                key={i} 
                                onClick={
                                    
                                    (e)=>{
                                        console.log("One clicked!")
                                        checkClickedChatboxTab(e)
                                        clearAllTrashIcons(e.target.parentNode.parentNode)
                                        e.target.parentNode.childNodes[1].style.display = 'block'
                                    }
                                }
                                // onDoubleClick={
                                //     (e)=>{
                                //         console.log("Double clicked!")
                                //         console.log("e.target",e.target)

                                //         // allow to change the text in div
                                //         e.target.contentEditable = true;
                                //         e.target.focus();
                                //         // e.target.style.backgroundColor = "white";
                                //         // e.target.style.border = "1px solid black";
                                //         // e.target.style.borderRadius = "5px";
                                //         // e.target.style.padding = "5px";
                                //         // e.target.style.margin = "5px";
                                //         // e.target.style.width = "100px";


                                //     }
                                // }
                                
                                
                                >
                                    ChatBox_{i}
                                    <div style={{display: 'none'}}>
                                        <span>ChatBox_{i}</span>
                                    </div>     
                                </div>

                                <div className="side-menu-button-trash trash" 
                                    key ={i} 
                                    // onClick={removeCorChat}
                                    onMouseEnter={
                                        (e) => {
                                            changeTrashToCheck(e.target.parentNode.childNodes[1], false);
                                        }
                                    }
                                    onMouseLeave={
                                        (e) => {
                                            changeTrashToCheck(e.target.parentNode.childNodes[1], true);
                                        }
                                    }
                                    onClick={
                                        (e)=> {
                                            // changeTrashToCheck(e.target.parentNode.childNodes[1]);

                                            removeCorChat(e);
                                        }
                                    }
                                    style={{display: 'none'}}
                                    >🗑</div>
                            </div>
                        )
                }

                <div
                    className="models"
                    style={{
                        display: 'none'
                    }}>
                    <label className="side-label">Model</label>
                    <select
                        // active if model is select is currentModel
                        value={currentModel} className="select-models" onChange={(e) => {
                            setCurrentModel(e.target.value)
                        }}>
                        {
                            models && models.length
                                ? models.map(
                                    (model, index) => (<option key={model.id} value={model.id}>{model.id}</option>)
                                )
                                : <option key={"text-davinci-003"} value={"text-davinci-003"}>{"text-davinci-003"}</option>
                        }
                    </select>

                    <Button
                        text="Smart - Davinci"
                        onClick={() => setCurrentModel("text-davinci-003")}/>
                    <Button
                        text="Code - Crushman"
                        onClick={() => setCurrentModel("code-cushman-001")}/>
                    <span className="info">
                        The model parameter controls the engine used to generate the response. Davinci
                        produces best results.
                    </span>
                    <label className="side-label">Temperature</label>
                    <input
                        className="select-models"
                        type="number"
                        onChange={(e) => setTemperature(e.target.value)}
                        min="0"
                        max="1"
                        step="0.1"
                        value={temperature}/>
                    <Button text="0 - Logical" onClick={() => setTemperature(0)}/>
                    <Button text="0.5 - Balanced" onClick={() => setTemperature(0.5)}/>
                    <Button text="1 - Creative" onClick={() => setTemperature(1)}/>
                    <span className="info">
                        The temperature parameter controls the randomness of the model. 0 is the most
                        logical, 1 is the most creative.
                    </span>
                </div>
            </aside>
        </div>
    );
}

const Button = ({onClick, text}) => <div className="button-picker" onClick={onClick}>
    {text}
</div>
