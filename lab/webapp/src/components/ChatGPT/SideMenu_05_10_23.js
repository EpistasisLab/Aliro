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

    tapTitles, 
    setTapTitles,
    setTapTitlesFunc,

    getChatMessageByExperimentId,
    getSpecificChatbyChatId,
    getAllChatsFromDB,
    
    postChats,
    postInChatlogsToDB,
    // postInChatlogsToDBWithExeId,

    deleteSpecificChat,
    patchSpecificChat,

    experiment


}
    
) {

    useEffect(() => {
        console.log("useEffect-SideMenu")

        let experimentID = experiment.data._id ;

        checkNumChatBox();
        
        setBoldUnderlineAndInitTraIc();
        setCurrentExpId(experimentID);

        // //set tapTitles
        setTapTitlesFunc();



        
    },
    [window.location.href, numChatBox]

    );


async function getAllChatsAndGetSpecificChatBasedOnExpID(clickedChatBoxNum, setChatLog) {

    
    let experimentID = experiment.data._id ;

    let data = await getChatMessageByExperimentId(experimentID)

    // filter data based on experiment id
    let dataFiltered = data.filter(function (el) {
        return el._experiment_id == experimentID;
    });

    // data=dataFiltered;

    console.log("clickedChatBoxNum",clickedChatBoxNum)

    // console.log("data[clickedChatBoxNum]", data[clickedChatBoxNum])

    // when user click + + New Chat button
    if (clickedChatBoxNum == "+ New Chat" ) {
        
        // POST http://localhost:5080/chatapi/v1/chats
        // Content-Type: application/json

        // {
        //     "title" : "`${experimentID}`",
        //     "_experiment_id": "641e7a67c3386b002e521705",
        //     "_dataset_id": "63f6e4947c5f93004a3e3ca7"
        // }

        let experimentID = experiment.data._id ;

        data = await postChats(experimentID)
        

        // POST http://localhost:5080/chatapi/v1/chatlogs
        // Content-Type: application/json

        // {
        //     "_chat_id" : "641f26a1b2663354ec5d634f",
        //     "message" : "Hello there from my desk!!!!!!b",
        //     "message_type" : "text",
        //     "who" : "user"
        // }

        
        await postInChatlogsToDB(data['_id'], "How can I help you today?", "text", "gpt")

        // await postInChatlogsToDBWithExeId(experimentID, data['_id'], "How can I help you today?", "text", "gpt","")

        let chatLogNew = [
            {
                user: "gpt",
                message: "How can I help you today?"
            }
        ]
        setChatLog(chatLogNew);
    }
    // when user click existing chat button
    else{

        // Get existing chatlogs
        // GET http://localhost:5080/chatapi/v1/chats/${data[clickedChatBoxNum]['_id']}
        data = await getSpecificChatbyChatId(dataFiltered[clickedChatBoxNum]['_id'])

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
                        message: data["chatlogs"][i]["message"]
                        // message: data["chatlogs"][i]["message"].split(/\n/).map(line => <div key={line}>{line}</div>)
                    }
                ]
            }
        }
        setChatLog(chatLogNew);
    }
}

async function checkClickedChatboxTab(e) {

    // first, clear the context of the chat completions endpoint. (refer to the jay's message on slack)
        // in the openai api, is there a way to clear the context of the chat completions endpoint?
        // Yes, in the OpenAI API, you can clear the context of the chat completions endpoint by sending an empty string as the value for the context parameter.
        // For example, if you're using the Python client, you can make a request to the completions method with an empty string as the context parameter like this:
        
            
            // In getAllChatsAndGetSpecificChatBasedOnExpID function, in the case where data[clickedChatBoxNum] == undefined,
            // clear the context of the chat completions endpoint. And then, post with "How can I help you today?" to the openai api (chat/completions).
    
    // second, feed current chatlog of clicked chatbox to the chat completions endpoint. 

            // In getAllChatsAndGetSpecificChatBasedOnExpID function, in the case where data[clickedChatBoxNum] != undefined, // clear the context of the chat completions endpoint. And then, post with chatlog of clicked chatbox to the openai api (chat/completions).
    
    if (e.target.childNodes[0].nodeValue === '+ New Chat') {

        // this is the number of chat boxes in the result page
        // numChatBox, setNumChatBox

        var countClickedChatBoxID = numChatBox+1

            
    }
    else{

        var siblings = e.target.parentNode.parentNode.childNodes;

        for (var i = 1; i < siblings.length-1; i++) {
            // console.log("siblings[i]",siblings[i])

            if (e.target.parentNode === siblings[i]) {
                siblings[i].style.fontWeight = "bold";
                // siblings[i].style.textDecoration = "underline";
            }
            else{
                siblings[i].style.fontWeight = "normal";
                // siblings[i].style.textDecoration = "none";
            }
        }

        // var currentClickedChatBoxID = parseInt(e.target.childNodes[1].nodeValue);

        var currentClickedChatBoxID = parseInt(e.target.childNodes[2].childNodes[0].childNodes[1].nodeValue);
    
        // Add 1 to currentClickedChatBoxID
        var countClickedChatBoxID = currentClickedChatBoxID + 1;

        
    } 
    // first chatbox is 1, second chatbox is 2, third chatbox is 3, etc.
    setChatCurrentTempId(countClickedChatBoxID)

    // user clicks chatbox tap
    if (e.target.childNodes.length == 3){
        var clickedChatBoxNum = e.target.childNodes[2].childNodes[0].childNodes[1].nodeValue;
    }

    // user clicks + New Chat
    else if (e.target.childNodes.length == 1){

        var clickedChatBoxNum = e.target.childNodes[0].nodeValue;

    }

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


function clearAllCheckIcons (nodes) {

    for (var i = 1; i < nodes.childNodes.length-1; i++) {
        nodes.childNodes[i].childNodes[2].style.display = "none";
        nodes.childNodes[i].childNodes[2].innerHTML = "🖋";
    }
}


// This function is to check if the number of chat boxes is equal to or greater than the limit, and if so, make the + New Chat button not clickable
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
        // console.log("node.innerHTML",node.innerHTML)
    }
}

function changePenToCheck(node, reverse) {
    if (reverse==true){
        node.innerHTML = "🖋";
        // console.log("node.innerHTML",node.innerHTML)
    }
    else{
        node.innerHTML = "✔︎";
        // console.log("node.innerHTML",node.innerHTML)
    }
}

async function removeCorChat(e) {

    if(e.target.parentNode.childNodes[1].innerHTML == "✔︎")
    {
        if (e.target.parentNode.childNodes[0].childNodes.length === 2){

            // var textClickedChatBox = e.target.parentNode.childNodes[0].childNodes[1].childNodes[0].textContent;

                alert("Error: You cannot delete the chatbox tap. Please name the chatbox tap first.")

            //  Uncaught TypeError: Cannot read properties of undefined (reading 'split')

            throw new Error("Error: You cannot delete the chatbox tap. Please name the chatbox tap first.")

            // receive the error message in the console

        }

        else if(e.target.parentNode.childNodes[0].childNodes.length === 3){

            var textClickedChatBox = e.target.parentNode.childNodes[0].childNodes[2].childNodes[0].textContent;
        }


        // parse textClickedChatBox with _
        var textClickedChatBoxIdString = textClickedChatBox.split("_")[1];

        // convert textClickedChatBoxIdString to integer
        var textClickedChatBoxId = parseInt(textClickedChatBoxIdString);

        // remove the clicked chatbox tap from DB
        // To do this, first get the experiment id from the url
        // After that, get the all chats from the DB using the experiment id
        // Then, remove the chat using the textClickedChatBox
        
        let data = await getAllChatsFromDB()


        let experimentId = experiment.data._id ;

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
    await deleteSpecificChat(filteredChatsWithoutNull[textClickedChatBoxId]['_id'])

    filteredChatsWithoutNull.splice(textClickedChatBoxId,1)

    if (filteredChatsWithoutNull.length>0)
    {

        let data = await getSpecificChatbyChatId(filteredChatsWithoutNull[filteredChatsWithoutNull.length-1]['_id'])

        let chatLogNew = [];

        for (let i = 0; i < data["chatlogs"].length; i++) {

            chatLogNew = [
                ...chatLogNew, {
                    user: data["chatlogs"][i]["who"],
                    message: data["chatlogs"][i]["message"]
                }
            ]

        }
    
        setChatLog(chatLogNew);
        setNumChatBox(numChatBox-1)
        setChatCurrentTempId(numChatBox-1)

    }
    else
    {   
        // When filteredChatsWithoutNull.length == 0, if user remove the chatbox_0, it will reset the chatbox_0 with How can I help you today? by gpt. And this should be posted to the DB with the experimentId.

        let data = await postChats(experimentId)
        if (data['chatlogs'].length === 0){

            // POST http://localhost:5080/chatapi/v1/chatlogs
            // Content-Type: application/json
            // {
            //     "_chat_id" : "642076d7262c19d0be23448b",
            //     "message" : "How are you?",
            //     "message_type" : "text",
            //     "who" : "gpt"
            // }
            
            await postInChatlogsToDB(data._id, "How can I help you today?", "text", "gpt")

            // await postInChatlogsToDBWithExeId(experimentId, "How can I help you today?", "text", "gpt","")
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

        setTapTitlesFunc();

    }

        // if the chatbox tap was only one, when user remove the chat, it will remove from the DB, but the chatbox will show "How can I help you today?"

        // if the chatbox tap was more than one, when user remove the chat, it will remove from the DB, and the chatbox will show the left chatbox tap or the right chatbox tap.

    }
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
            
            // trash emoji 
            sidemenu[i].childNodes[1].style.display = "none";
            // check emoji
            sidemenu[i].childNodes[2].style.display = "none";
            

        }
        // trash emoji for the last chatboxtap
        sidemenu[sidemenu.length-1].childNodes[1].style.display = "block";
        // check emoji for each chatboxtap
        sidemenu[sidemenu.length-1].childNodes[2].style.display = "block";
    }
}

async function postChatNameToDB(chatboxtapname){

    // get current url
    let url = window.location.href;
    let urlSplit = url.split('/');
    let experimentID = experiment.data._id ;

    // GET http://localhost:5080/chatapi/v1/chats
    let data =await getChatMessageByExperimentId(experimentID)
    // filter data based on experiment id
    let dataFiltered = data.filter(function (el) {
        return el._experiment_id == experimentID;
    });


    // PATCH http://localhost:5080/chatapi/v1/chats/640bd7290674aa751483658b
    // Content-Type: application/json

    // {
    //     "title" : chatboxtapname,
    //     "_experiment_id": experimentID,
    //     "_dataset_id": experimentID
    // }

    await patchSpecificChat(dataFiltered[chatCurrentTempId-1]['_id'],chatboxtapname,experimentID,experimentID)

    setTapTitles({
        taptitles: tapTitles.taptitles.map((title, index) => {
            if (index === chatCurrentTempId-1) {
                return chatboxtapname;
            }
            return title;
        })
    })

}

    return (
        <div className="divsidemenu">
            <aside className="sidemenu">

                {/* <div className="side-menu-button" onClick={() => setNumChatBox(numChatBox + 1)}> */}
                <div className="side-menu-button" id="newchatbutton" onClick={ 
                    async (e) =>
                    {   
                        
                        checkClickedChatboxTab(e)
                        setNumChatBox(numChatBox + 1)
                        
                        // checkNumChatBox()

                        //set tapTitles
                        // setTapTitlesFunc();
                    }
                }>
                    {/* <span></span> */}
                    + New Chat 
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
                                        // console.log("One clicked!")
                                        // console.log("e.target",e.target)

                                        // console.log("wer-e.target.parentNode.parentNode",e.target.parentNode.parentNode)

                                        checkClickedChatboxTab(e)
                                        
                                        clearAllTrashIcons(e.target.parentNode.parentNode)

                                        clearAllCheckIcons(e.target.parentNode.parentNode)


                                        e.target.parentNode.childNodes[1].style.display = 'block'

                                        e.target.parentNode.childNodes[2].style.display = 'block'
                                    }
                                }

                                onDoubleClick={
                                    (e)=>{



                                        
                                        // console.log("Double clicked!")
                                        // console.log("e.target.parentNode.parentNode",e.target.parentNode.parentNode)

                                        // find the child node with id newchatbutton
                                        let newchatbutton = document.getElementById("newchatbutton");

                                        // make it unclickable
                                        newchatbutton.style.pointerEvents = "none";

                                        // console.log("e.keyCode",e.keyCode)

                                        // e.keyCode
                                        // e.mouse


                                        // change e.target.parentNode.childNodes[1]  to 
                                        // ✔︎
                                        // add new div to e.target.parentNode.childNodes




                                        // e.target.parentNode.childNodes[1].textContent = "✔︎"

                                        // allow to change the text in div
                                        e.target.contentEditable = true;
                                        e.target.focus();

                                        // do not allow user to use delete key when the text is empty
                                        e.target.onkeydown = function(e) {
                                            // split e.target.textContent with & and _ to get the text
                                            // console.log("0509-e.target.childNodes[0].textContent",e.target.textContent)
                                            let tempString = e.target.textContent.split("&")[0].split("_")[0];

                                            // e.keyCode === 8 is the delete key
                                            if(tempString === "" && e.keyCode === 8) {
                                                // console.log("tempString ===  && e.keyCode === 8)")
                                                e.preventDefault();
                                                

                                                // e.target.textContent 
                                            }
                                            // enter key is not allowed
                                            if(e.keyCode === 13) {
                                            // if(e.keyCode === 13) {
                                                // console.log("e.keyCode === 13 enter key is not allowed")
                                                e.preventDefault();
                                                e.target.contentEditable = false;
                                                e.target.focus();

                                                // post the + New Chat name to the DB
                                                postChatNameToDB(tempString)
                                            }

                                           



                                            // cannot enter more than 20 characters
                                            if(e.target.textContent.length >25) {
                                                console.log("Please do not enter more than 25")
                                                e.preventDefault();
                                            }

                                            
                                        }

                                        

                                        
                                    }
                                
                                }

                                // when user click outside the div, the div will not be editable anymore
                                

                                // onMouseEnter={
                                //     (e)=> {
                                //         e.target.contentEditable = true;
                                //         e.target.focus();
                                //         // make the current e contentEditable  not any children
                                //         // e.target.childNodes[0].contentEditable = false;
                                        
                                        
                                        
                                        
                                //         // ChatBox_
                                //         console.log("e.target.childNodes[0]",e.target.childNodes[0])

                                //         e.target.childNodes[0].contentEditable = true;
                                        
                                        
                                //         // 1
                                //         console.log("e.target.childNodes[1]",e.target.childNodes[1])

                                //         // e.target.childNodes[1].contentEditable = true;
                                        
                                //         //  span
                                //         console.log("e.target.childNodes[2]",e.target.childNodes[2])

                                //         // e.target.childNodes[2].contentEditable = false;


                                //     }

                                // }

                                // onMouseLeave={
                                //     (e)=> {
                                //         // tempTaptitle
                                //         console.log("e.target.childNodes[0].textContent",e.target.childNodes[0].textContent)

                                //         let tempTaptitle = e.target.childNodes[0].textContent;

                                //         console.log("tempTaptitle",tempTaptitle)

                                //         e.preventDefault();
                                //         e.target.contentEditable = false;
                                //         e.target.focus();

                                //          // post the + New Chat name to the DB
                                //          postChatNameToDB(tempTaptitle)
                                //     }
                                // }   
                                >
                                    {/* ChatBox_{i} */}

                                    {/* ChatBox<p style={{display: 'none'}}
                                    contentEditable={false}>_{i}</p> */}

                                    {tapTitles.taptitles[i]}<p style={{display: 'none'}}
                                    contentEditable={false}>_{i}</p>
                                    
                                    {/* <p>ChatBox</p>
                                    <p className ="numUnvisPele" style={{display: 'none'}}
                                    contentEditable={false}>_{i}</p> */}


                                    {/* ChatBox{i} */}
                                    {/* ChatBox */}
                                    
                                    <div className ="numUnvisPele" style={{display: 'none'}}
                                    contentEditable={false}>
                                        <span>&ChatBox_{i}</span>
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

                                            try {
                                                removeCorChat(e);


                                            } catch (error) {
                                                // console.log("error",error)
                                                console.log("error-removeCorChat")
                                            }
                                        }
                                    }
                                    style={{display: 'none'}}
                                    >🗑</div>
                                

                                {/* make unvisible */}
                                <div className="side-menu-button-trash check" style={{display: 'none'}}

                                onMouseEnter={
                                    (e) => {
                                        changePenToCheck(e.target.parentNode.childNodes[2], false);
                                    }
                                }
                                onMouseLeave={
                                    (e) => {
                                        changePenToCheck(e.target.parentNode.childNodes[2], true);
                                    }
                                }
                                
                                onClick={
                                    (e)=> {


                                        let newchatbutton = document.getElementById("newchatbutton");

                                        // make it clickable
                                        newchatbutton.style.pointerEvents = "auto";


                                        // find element by className side-menu-button from the e.target.parentNode

                                        let tempSideMenuButtonText = e.target.parentNode.getElementsByClassName("side-menu-button")[0].textContent.split("&")[0].split("_")[0];

                                        postChatNameToDB(tempSideMenuButtonText)



                                    }
                                }>🖋</div>


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
