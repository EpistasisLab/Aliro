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

    limitNumChatBox

}
    
) {

    useEffect(() => {

        checkNumChatBox();
        console.log("window.location.href", window.location.href)


        setBoldUnderlineAndInitTraIc();
        

    }, [window.location.href, numChatBox]);





    // async function getAllChatsAndGetSpecificChat(clickedChatBoxNum, setChatLog) {

    //     // GET http://localhost:5080/chatapi/v1/chats
    //     await fetch("/chatapi/v1/chats", {
    //         method: "GET",
    //         headers: {
    //             "Content-Type": "application/json"
    //         }
    //     })
    //         .then(res => res.json())
    //         .then(data => {
    //             console.log("clickedChatBoxNum",clickedChatBoxNum)
    //             console.log("data--best--getAllChatsAndGetSpecificChat-sidemenu", data);
    //             // console.log("data[clickedChatBoxNum][_id]", data[clickedChatBoxNum]['_id'])

    //             if (data[clickedChatBoxNum] == undefined) {
    //                 console.log("data[clickedChatBoxNum]['_id'] is undefined, which means it is new chatbox.")


    //                 // POST http://localhost:5080/chatapi/v1/chats
    //                 // Content-Type: application/json

    //                 // {
    //                 //     "title" : "`${experimentID}`",
    //                 //     "_experiment_id": "641e7a67c3386b002e521705",
    //                 //     "_dataset_id": "63f6e4947c5f93004a3e3ca7"
    //                 // }

    //                 // current url 
    //                 let url = window.location.href;
    //                 // split url by '/' 
    //                 let urlSplit = url.split('/');
    //                 // get the last element of the array
    //                 let experimentID = urlSplit[urlSplit.length - 1];


    //                 fetch("/chatapi/v1/chats", {
    //                     method: "POST",
    //                     headers: {
    //                         "Content-Type": "application/json"
    //                     },
    //                     body: JSON.stringify({
    //                         "title": "`${experimentID}`",
    //                         "_experiment_id": `${experimentID}`,
    //                         "_dataset_id": `${experimentID}`
    //                     })
    //                 })
    //                 .then(res => res.json())
    //                 .then(data => {
    //                     // console.log("data-newchat", data);


    //                     // POST http://localhost:5080/chatapi/v1/chatlogs
    //                     // Content-Type: application/json

    //                     // {
    //                     //     "_chat_id" : "641f26a1b2663354ec5d634f",
    //                     //     "message" : "Hello there from my desk!!!!!!b",
    //                     //     "message_type" : "text",
    //                     //     "who" : "user"
    //                     // }

    //                     fetch("/chatapi/v1/chatlogs", {
    //                         method: "POST",
    //                         headers: {
    //                             "Content-Type": "application/json"
    //                         },
    //                         body: JSON.stringify({
    //                             "_chat_id": `${data['_id']}`,
    //                             "message": "How can I help you today?",
    //                             "message_type": "text",
    //                             "who": "gpt"
    //                         })
    //                     })





    //                     let chatLogNew = [
    //                         {
    //                             user: "gpt",
    //                             message: "How can I help you today?"
    //                         }
    //                     ]

    //                     // console.log("new-chatbox")
    //                     setChatLog(chatLogNew);




    //                 }) 

    //                 .catch(err => {
    //                     console.log("err", err);
    //                 }
    //                 )


                    
    //             }
    //             else{

    //                 console.log("data[clickedChatBoxNum]['_id'] is defined, which means it is existing chatbox.")
                

    //                 // Get existing chatlogs
    //                 // GET http://localhost:5080/chatapi/v1/chats/${data[clickedChatBoxNum]['_id']}

    //                 fetch(`/chatapi/v1/chats/${data[clickedChatBoxNum]['_id']}`, {
    //                     method: "GET",
    //                     headers: {
    //                         "Content-Type": "application/json"
    //                     }
    //                 })
    //                 .then(res => res.json())
    //                 .then(data => {
    //                     console.log("data['chatlogs']", data['chatlogs']);

    //                     let chatLogNew = [
    //                         {
    //                             user: "gpt",
    //                             message: "How can I help you today?"
    //                         }
    //                     ]
            

    //                     for (let i = 0; i < data["chatlogs"].length; i++) {
            
    //                         chatLogNew = [
    //                             ...chatLogNew, {
    //                                 user: data["chatlogs"][i]["who"],
    //                                 message: data["chatlogs"][i]["message"]
    //                             }
    //                         ]
            
    //                     }
    //                     console.log("chatLogNew-clicked",chatLogNew)

    //                     setChatLog(chatLogNew);
                        
    //                 })
    //                 .catch(err => {
    //                     console.log("err--best--getAllChatsAndGetSpecificChat-sidemenu", err);
    //                 });
    //             }


                
                
    
    //         })
    //         .catch(err => {
    //             console.log("err--best--getAllChatsAndGetSpecificChat-sidemenu", err);
    //         });
    
    // }

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
                // console.log("clickedChatBoxNum",clickedChatBoxNum)
                // console.log("data--best--getAllChatsAndGetSpecificChatBasedOnExpID", data);
                // console.log("data[clickedChatBoxNum][_id]", data[clickedChatBoxNum]['_id'])

                // filter data based on experiment id
                let dataFiltered = data.filter(function (el) {
                    return el._experiment_id == experimentID;
                });

                // console.log("dataFiltered", dataFiltered);

                data=dataFiltered;

                console.log("data[clickedChatBoxNum]",data[clickedChatBoxNum])

                if (data[clickedChatBoxNum] == undefined) {
                    console.log("data[clickedChatBoxNum]['_id'] is undefined, which means it is new chatbox.")

                    




                    // POST http://localhost:5080/chatapi/v1/chats
                    // Content-Type: application/json

                    // {
                    //     "title" : "`${experimentID}`",
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

                        // console.log("new-chatbox")
                        setChatLog(chatLogNew);



                        
                        
                        
                        // In getAllChatsAndGetSpecificChatBasedOnExpID function, in the case where data[clickedChatBoxNum] == undefined,
                        // clear the context of the chat completions endpoint. And then, post with "How can I help you today?" to the openai api (chat/completions).

                        // clear the context of the chat completions endpoint.

                        
                    
                        // console.log("hey-if")
                        
                        
                        // fetch("openai/v1/chat/completions", {
                        //     method: "POST",
                        //     headers: {
                        //         "Content-Type": "application/json",
                        //     },
                        //     body: JSON.stringify(
                        //         {
                        //             "model": "gpt-3.5-turbo",
                        //             // "messages": [{"role": "user", "content": "Say this is a test!"},{"role": "user", "content": "Say this is a test!"}],
                        //             "messages": [{"role": "gpt", "content": "How can I help you today?"}],
                        //             "temperature": 0.7
                        //             // "reset": true
                        //         }
                        //     )
                        // })
                        // .then(res => res.json())
                        // .then(data => {
                        //     console.log("reset-model", data);
                        // })
                        // .catch(err => {
                        //     console.log("err--best--openai/v1/chat/completions", err);
                        // });



                        //test
                        // fetch(`/chatapi/v1/chats/experiment/${experimentID}`, {
                        //     method: "GET",
                        //     headers: {
                        //         "Content-Type": "application/json"
                        //     }
                        // })
                        //     .then(res => res.json())
                        //     .then(data => {
                        //         console.log("data--best--getAllChatsAndGetSpecificChatBasedOnExpID", data);
                        //     })



                        // another test (It works!)
                        // fetch("/openai/v1/connections", {
                        //     method: "POST",
                        //     headers: {
                        //         "Content-Type": "application/json"
                        //     }
                        // })
                        // .then((response) => {
                        //     console.log("response.ok", response.ok);
                        //     return response.json();
                        // })
                        // .then((data) => {
                        //     console.log("data-response.json()", data);
                        // })












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

                        console.log("hey!!!!!")



                        // In getAllChatsAndGetSpecificChatBasedOnExpID function, in the case where data[clickedChatBoxNum] != undefined, // clear the context of the chat completions endpoint. And then, post with chatlog of clicked chatbox to the openai api (chat/completions).

                        // fetch("openai/v1/chat/completions", {
                        //     method: "POST",
                        //     headers: {
                        //         "Content-Type": "application/json",
                        //     },
                        //     body: JSON.stringify(
                        //         {
                        //             "model": currentModel,
                        //             // "messages": [{"role": "user", "content": "Say this is a test!"},{"role": "user", "content": "Say this is a test!"}],
                        //             "messages": [{"role": "gpt", "content": "How can I help you today?"}],
                        //             // "temperature": 0.7
                        //             // "reset": true
                        //         }
                        //     )
                        // })
                        // .then(res => res.json())
                        // .then(data => {
                        //     console.log("reset-model", data);
                        // })
                        // .catch(err => {
                        //     console.log("err--best--openai/v1/chat/completions", err);
                        // });





                        // test
                        // fetch(`chatapi/v1/chats/experiment/${experimentID}`, {
                        //     method: "GET",
                        //     headers: {
                        //         "Content-Type": "application/json"
                        //     }
                        // })
                        // .then(res => res.json())
                        // .then(data => {
                        //     console.log("data--best--getAllChatsAndGetSpecificChatBasedOnExpID", data);
                        // })



                        // another test (It works!)
                        // fetch("/openai/v1/connections", {
                        //     method: "POST",
                        //     headers: {
                        //         "Content-Type": "application/json"
                        //     }
                        // })
                        // .then((response) => {
                        //     console.log("response.ok", response.ok);
                        //     return response.json();
                        // })
                        // .then((data) => {
                        //     console.log("data-response.json()", data);
                        // })



                        
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


        // 
        // first, clear the context of the chat completions endpoint. (refer to the jay's message on slack)
            // in the openai api, is there a way to clear the context of the chat completions endpoint?
            // Yes, in the OpenAI API, you can clear the context of the chat completions endpoint by sending an empty string as the value for the context parameter.
            // For example, if you're using the Python client, you can make a request to the completions method with an empty string as the context parameter like this:
            
                
                // In getAllChatsAndGetSpecificChatBasedOnExpID function, in the case where data[clickedChatBoxNum] == undefined,
                // clear the context of the chat completions endpoint. And then, post with "How can I help you today?" to the openai api (chat/completions).
        
        // second, feed current chatlog of clicked chatbox to the chat completions endpoint. 

                
                // In getAllChatsAndGetSpecificChatBasedOnExpID function, in the case where data[clickedChatBoxNum] != undefined, // clear the context of the chat completions endpoint. And then, post with chatlog of clicked chatbox to the openai api (chat/completions).



        
        
        // console.log("e.target", e.target)
        // console.log(
        //     "e.target.childNodes[1].nodeValue",
        //     e.target.childNodes[1].nodeValue
        // )

        // console.log(
        //     "e.target.parentNode", e.target.parentNode
        // )



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

        // console.log("chatCurrentTempId-checkClickedChatboxTab",chatCurrentTempId)





        var clickedChatBoxNum = e
            .target
            .childNodes[1]
            .nodeValue;
        // getAllChatsAndGetSpecificChat(clickedChatBoxNum, setChatLog);
        getAllChatsAndGetSpecificChatBasedOnExpID(clickedChatBoxNum, setChatLog);


        // lanModelReset, 
        // setLanModelReset,

        // make lanModelReset true
        setLanModelReset(lanModelReset=true)


        


    }

    function clearAllTrashIcons (nodes) {

        // console.log("nodes",nodes)
        // console.log("nodes.childNodes",nodes.childNodes)
        // console.log("nodes.childNodes[1]",nodes.childNodes[1])
        // console.log("nodes.childNodes[1].childNodes",nodes.childNodes[1].childNodes)
        // console.log("nodes.childNodes[1].childNodes[1]",nodes.childNodes[1].childNodes[1])

        for (var i = 1; i < nodes.childNodes.length-1; i++) {
            // console.log("nodes.childNodes[i].childNodes[1]",nodes.childNodes[i].childNodes[1])

            nodes.childNodes[i].childNodes[1].style.display = "none";

            nodes.childNodes[i].childNodes[1].innerHTML = "🗑️";
        }
    }




    // This function is to check if the number of chat boxes is equal to or greater than the limit, and if so, make the new chat button not clickable
    function checkNumChatBox() {
        

        if (numChatBox + 1 > limitNumChatBox) {
            
            document.getElementById("newchatbutton").style.pointerEvents = "none";
        }
    }


    function changeTrashCheck(node) {

        // extract the trash emoji from the node 
        // node is div

        node.innerHTML = "✔︎";

        // 👩‍⚖️
        // console.log("trashIcon",trashIcon)

    }

    function removeCorChat(e) {
        // console.log("e.target.parentNode.childNodes[1]", e.target.parentNode.childNodes[1])

        // console.log("window.location.href-removeCorChat",window.location.href)

        
        console.log("e.target", e.target)

        console.log("e.target.parentNode", e.target.parentNode)

        console.log("e.target.parentNode.childNodes[0]", e.target.parentNode.childNodes[0])

        console.log("e.target.parentNode.childNodes[1]", e.target.parentNode.childNodes[1])

        changeTrashCheck(e.target.parentNode.childNodes[1])

        console.log("e.target.parentNode.childNodes", e.target.parentNode.childNodes)


        console.log("e.target.parentNode.childNodes[0].childNodes", e.target.parentNode.childNodes[0].childNodes)

        console.log("e.target.parentNode.childNodes[0].childNodes[2]", e.target.parentNode.childNodes[0].childNodes[2])

        console.log("e.target.parentNode.childNodes[0].childNodes[1]", e.target.parentNode.childNodes[0].childNodes[1])

        console.log("e.target.parentNode.childNodes[0].childNodes[2].childNodes", e.target.parentNode.childNodes[0].childNodes[2].childNodes)

        console.log("e.target.parentNode.childNodes[0].childNodes[2].childNodes[0]", e.target.parentNode.childNodes[0].childNodes[2].childNodes[0])


        console.log("e.target.parentNode.childNodes[0].childNodes[2].childNodes[0].textContent", e.target.parentNode.childNodes[0].childNodes[2].childNodes[0].textContent)

        var textClickedChatBox = e.target.parentNode.childNodes[0].childNodes[2].childNodes[0].textContent;

        console.log("textClickedChatBox",textClickedChatBox)


        console.log("chatCurrentTempId",chatCurrentTempId)

        
        // remove the clicked chatbox tap from DB
        // To do this, first get the experiment id from the url
        // After that, get the all chats from the DB using the experiment id
        // Then, remove the chat using the textClickedChatBox


        // if the chatbox tap was only one, when user remove the chat, it will remove from the DB, but the chatbox will show "How can I help you today?"

        // if the chatbox tap was more than one, when user remove the chat, it will remove from the DB, and the chatbox will show the left chatbox tap or the right chatbox tap.






    }


    function setBoldUnderlineAndInitTraIc() {

        // console.log("setBoldUnderlineAndInitTraIc()")

        //get div with class name sidemenu
        var sidemenu = document.getElementsByClassName("chatboxtap");

        // console.log("sidemenu-setBoldUnderlineAndInitTraIc()",sidemenu)

        // length of sidemenu
        var sidemenuLength = sidemenu.length;

        // console.log("sidemenuLength-setBoldUnderlineAndInitTraIc()",sidemenuLength)

        if (sidemenuLength>0) {

        
      
        // sidemenu is a html collection. I want to see all elements in the collection. Please print out each element in the collection.
      
        console.log("sidemenu", sidemenu)
        console.log("sidemenu length --t", sidemenu.length)
        
        for (var i = 0; i < sidemenu.length-1; i++) {
            sidemenu[i].style.fontWeight = "normal";
            // sidemenu[i].style.textDecoration = "none";
        }
      
      
        sidemenu[sidemenu.length-1].style.fontWeight = "bold";
        // sidemenu[sidemenu.length-1].style.textDecoration = "underline";


        // console.log("sidemenu[sidemenu.length-1]",sidemenu[sidemenu.length-1])

        for (var i = 0; i < sidemenu.length; i++) {
            // sidemenu[i].chidNodes[1].style.display = "none";

            // console.log("sidemenu[i]",sidemenu[i])
            console.log("sidemenu[i].chidNodes[1]",sidemenu[i].childNodes[1])

            
            sidemenu[i].childNodes[1].style.display = "none";
            
            
        }

        sidemenu[sidemenu.length-1].childNodes[1].style.display = "block";
        
        // console.log("sidemenu[sidemenu.length-1].chidNodes[1]",sidemenu[sidemenu.length-1].chidNodes[1])
        // sidemenu[sidemenu.length-1].chidNodes[1].style.display = "block";

    }
        
        
      
      
      
      
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
                                        checkClickedChatboxTab(e)
                                        

                                        clearAllTrashIcons(e.target.parentNode.parentNode)

                                        
                                        e.target.parentNode.childNodes[1].style.display = 'block'
                                    
                                    }

                                    

                                }

                            //     onMouseEnter={
                            //         (e) => {
                            //         console.log("[e.target.parentNode.childNodes[1]",e.target.parentNode.childNodes[1])
                            //         // e.target.style.display = 'block'

                                    
                            //         e.target.parentNode.childNodes[1].style.display = 'block'
                                    
                            //     }
                            
                            // }

                                // onMouseLeave={(e) => {
                                //     console.log("[e.target.parentNode.childNodes[1]",e.target.parentNode.childNodes[1])
                                //     // e.target.style.display = 'block'

                                    
                                //     e.target.parentNode.childNodes[1].style.display = 'none'
                                    
                                // }}
                                
                                >
                                    ChatBox_{i}
                                    <div style={{display: 'none'}}>
                                        <span>ChatBox_{i}</span>
                                    </div>
                                

                                {/* <span className="trash"
                                key ={i}
                                onClick={removeCorChat}
                                >🗑</span> */}
                               
                                </div>

                                


                                <div className="side-menu-button-trash trash" 
                                    key ={i} 
                                    onClick={removeCorChat}
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
