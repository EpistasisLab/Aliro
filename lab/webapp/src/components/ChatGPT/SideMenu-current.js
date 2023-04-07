import React from 'react'





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
    setNumChatBox

}
    
) {







    async function getAllChatsAndGetSpecificChatBasedOnExpID(clickedChatBoxNum, setChatLog) {

        // get current url
        let url = window.location.href;
        // split url by '/'
        let urlSplit = url.split('/');
        // get the last element of the array
        let experimentID = urlSplit[urlSplit.length - 1];


        // GET http://localhost:5080/chatapi/v1/chats
        await fetch(`/chatapi/v1/chats/experiment/${experimentID}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(res => res.json())
            .then(data => {
                console.log("clickedChatBoxNum",clickedChatBoxNum)
                console.log("data--best--getAllChatsAndGetSpecificChatBasedOnExpID", data);
                // console.log("data[clickedChatBoxNum][_id]", data[clickedChatBoxNum]['_id'])

                // filter data based on experiment id
                let dataFiltered = data.filter(function (el) {
                    return el._experiment_id == experimentID;
                });

                console.log("dataFiltered", dataFiltered);

                data=dataFiltered;

                console.log("data[clickedChatBoxNum]",data[clickedChatBoxNum])

                if (data[clickedChatBoxNum] == undefined) {
                    console.log("data[clickedChatBoxNum]['_id'] is undefined, which means it is new chatbox.")


                    // POST http://localhost:5080/chatapi/v1/chats
                    // Content-Type: application/json

                    // {
                    //     "title" : "Chat with experiment id 2",
                    //     "_experiment_id": "641e7a67c3386b002e521705",
                    //     "_dataset_id": "63f6e4947c5f93004a3e3ca7"
                    // }

                    // current url 
                    let url = window.location.href;
                    // split url by '/' 
                    let urlSplit = url.split('/');
                    // get the last element of the array
                    let experimentID = urlSplit[urlSplit.length - 1];


                    fetch("/chatapi/v1/chats", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            "title": "ChatBox",
                            "_experiment_id": `${experimentID}`,
                            "_dataset_id": `${experimentID}`
                        })
                    })
                    .then(res => res.json())
                    .then(data => {
                        console.log("data-newchat", data);


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

                        console.log("new-chatbox")
                        setChatLog(chatLogNew);




                    }) 

                    .catch(err => {
                        console.log("err", err);
                    }
                    )


                    
                }
                else{

                    console.log("data[clickedChatBoxNum]['_id'] is defined, which means it is existing chatbox.")
                

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
            
                            chatLogNew = [
                                ...chatLogNew, {
                                    user: data["chatlogs"][i]["who"],
                                    message: data["chatlogs"][i]["message"]
                                }
                            ]
            
                        }
                        console.log("chatLogNew-clicked",chatLogNew)

                        setChatLog(chatLogNew);
                        
                    })
                    .catch(err => {
                        console.log("err--best--getAllChatsAndGetSpecificChat-sidemenu", err);
                    });
                }


                
                
    
            })
            .catch(err => {
                console.log("err--best--getAllChatsAndGetSpecificChat-sidemenu", err);
            });
    
    }








    async function checkClickedChatboxTab(e) {
        console.log("e.target", e.target)
        console.log(
            "e.target.childNodes[1].nodeValue",
            e.target.childNodes[1].nodeValue
        )


        // if (e.target.childNodes[1]===undefined) {
        //     console.log("e.target.childNodes[1] is undefined")
        // }
        
        if (e.target.childNodes[1].nodeValue === 'New Chat') {
            console.log("e.target.childNodes[1].nodeValue is New Chat")

            // this is the number of chat boxes in the result page
            // numChatBox, setNumChatBox

            console.log("newchat--numChatBox",numChatBox)

            var countClickedChatBoxID = numChatBox+1

            // setNumChatBox(countClickedChatBoxID)
            
           

            // this is the current chat box id where user is typing
            // chatCurrentTempId, setChatCurrentTempId

            // console.log("newchat--chatCurrentTempId",chatCurrentTempId)

            // var currentClickedChatBoxID = chatCurrentTempId +1 ; 

            
        }
        else{
            var currentClickedChatBoxID = parseInt(e.target.childNodes[1].nodeValue);
            console.log("currentClickedChatBoxID",currentClickedChatBoxID)

        
            // Add 1 to currentClickedChatBoxID
            var countClickedChatBoxID = currentClickedChatBoxID + 1;
            console.log("countClickedChatBoxID",countClickedChatBoxID)
        } 

        
        // first chatbox is 1, second chatbox is 2, third chatbox is 3, etc.
        setChatCurrentTempId(countClickedChatBoxID)
        
        // the current number of chatboxes
        // setNumChatBox(countClickedChatBoxID)


        console.log("chatCurrentTempId-checkClickedChatboxTab",chatCurrentTempId)





        var clickedChatBoxNum = e
            .target
            .childNodes[1]
            .nodeValue;
        // getAllChatsAndGetSpecificChat(clickedChatBoxNum, setChatLog);
        getAllChatsAndGetSpecificChatBasedOnExpID(clickedChatBoxNum, setChatLog);




    
    }


    var limitNumChatBox = 5;



    function checkNumChatBox() {
        console.log("numChatBox", numChatBox)
        console.log("chatCurrentTempId", chatCurrentTempId)

        if (numChatBox + 1 >= limitNumChatBox) {
            // console.log("numChatBox === chatCurrentTempId")
            // setNumChatBox(numChatBox + 1)

            // make id newchatbutton is not clickable
            document.getElementById("newchatbutton").style.pointerEvents = "none";
        }
    }


    function removeCorChat(e) {
        console.log("e.target.parentNode.childNodes[1]", e.target.parentNode.childNodes[1])


        // var currentClickedChatBoxID = parseInt(e.target.parentNode.childNodes[1].nodeValue);
        // console.log("currentClickedChatBoxID",currentClickedChatBoxID)

        // // Add 1 to currentClickedChatBoxID
        // var countClickedChatBoxID = currentClickedChatBoxID + 1;
        // console.log("countClickedChatBoxID",countClickedChatBoxID)

        // // first chatbox is 1, second chatbox is 2, third chatbox is 3, etc.
        // setChatCurrentTempId(countClickedChatBoxID)

        // // the current number of chatboxes
        // setNumChatBox(numChatBox - 1)

        // // make id newchatbutton is clickable
        // document.getElementById("newchatbutton").style.pointerEvents = "auto";
    }






    return (
        <div>
            <aside className="sidemenu">

                {/* <div className="side-menu-button" onClick={() => setNumChatBox(numChatBox + 1)}> */}
                <div className="side-menu-button" id="newchatbutton" onClick={function (e) {
                    setNumChatBox(numChatBox + 1)
                    checkClickedChatboxTab(e)
                    checkNumChatBox()

                }}>
                    <span>+</span>
                    New Chat
                </div>

                {
                    Array(numChatBox)
                        .fill()
                        .map(
                            (_, i) =>
                            <div className="sidemenu"> 
                                <div className="side-menu-button" key={i} onClick={checkClickedChatboxTab}>
                                ChatBox_{i}

                                <span className="trash"
                                key ={i}
                                onClick={removeCorChat}
                                >🗑</span>
                               
                                </div>
                                {/* <div className="side-menu-button trash" 
                                key ={i} 
                                onClick={removeCorChat}

                                >🗑</div> */}
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
