import React, {useEffect} from "react";

export default function PopUpAPI(
    {checkConnShowGPT, openaiApiState, setopenaiApiState}
) {

    useEffect(() => {

        // In this fetch, it will check if the connection to OpenAI is already established.
        checkConnectionOpenAIandSetPopUpAPI()

    }, [window.location.href]);

    // check if the connection to OpenAI is already established.
    function checkConnectionOpenAIandSetPopUpAPI(){
        fetch("/openai/v1/connections", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then((response) => {
                
                if (!response.ok) {

                    // throw new Error(`HTTP error: ${response.status}`);
                    // alert("Connection to OpenAI is not established")

                    // when it render, in the case where the connection is not established, we will require user to input the API key in the box.
                    var modal = document.getElementsByClassName("modal")[0];
                    modal.style.display = "block";
                    

                } else {

                    document.getElementById("expertChatGPT").style.backgroundColor = "#1056c0";
                    var modal = document.getElementsByClassName("modal")[0];
                    // make it unvisible
                    modal.style.display = "none";
                    setopenaiApiState(openaiApiState => openaiApiState + 1);

                }
        });
    }

    
    function handleClick() {
        // modal
        var modal = document.getElementsByClassName("modal")[0];
        // make it unvisible
        modal.style.display = "none";
    };




    async function postOpenAIkey(openaiKey)
    {
        // console.log("openaiKey", openaiKey); currently working but when user close
        // the window and open it again, it will not work. In this case, by using the
        // error throw and catch, we can make it work again. POST
        // http://localhost:5080/openai/v1/configs Content-Type: application/json {
        // "api_key" : "",
        // "org_id" : "Personal" }

        let resp=await fetch("/openai/v1/configs", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({api_key: openaiKey, org_id: "Personal"})
            })
            .then((response) => {
                console.log("63-postOpenAIkey-response", response)
                if (!response.ok) {

                    alert("Connection to OpenAI is not established")
                    // throw new Error(`HTTP error: ${response.status}`);
                    return 0;
                    // setopenaiApiState(0);
                    // dbconnection = false;

                } else {

                    // dbconnection = true;
                    return response.json();

                }

            })
        
        return resp;
    }


    async function postOpenAIConnectionCheck(){
        // POST http://localhost:5080/openai/v1/connections
        await fetch("/openai/v1/connections", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then((response) => {
                console.log("63-connections-response.ok", response.ok)
                if (!response.ok) {

                    // throw new Error(`HTTP error: ${response.status}`);
                    alert("Connection to OpenAI is not established")

                } else {
                    // console.log("response_checkConnectionOpenAI", response)
                    // return response.text();
                    // let parsed = JSON.parse(text);
                    // console.log("connections", parsed)
                    setopenaiApiState(openaiApiState => openaiApiState + 1);

                    alert("Connection to OpenAI is established")

                    var modal = document.getElementsByClassName("modal")[0];
                    // make it unvisible
                    modal.style.display = "none";


                    // document.getElementById("expertChatGPT").style.backgroundColor = "red";

                    document.getElementById("expertChatGPT").style.backgroundColor = "#1056c0";


                    // alert("Connection to OpenAI is established")

                }
        })
    }

    async function handleSubmit(e) {

        e.preventDefault();
        
        var openaiKey = document
            .getElementById("openaikey")
            .value;

        console.log("spec-step-1")
        await postOpenAIkey(openaiKey);
        await postOpenAIConnectionCheck();

    };


    return (
        <div className="modal" style={{ display: "none" }}>
            <div className="modal_content">
                <span className="close" onClick={handleClick}>
                    &times;
                </span>
                <form>
                    <h3>Please provide your OpenAI key!</h3>
                    <h4>You can work with ChatGPT.</h4>
                    {/* <div>Register!</div> */}
                    <label>
                        {/* Name: */}
                        <input id="openaikey" type="text" name="name"/>
                    </label>
                    {/* <br /> */}
                    <input className="popupAPI" type="submit" onClick={handleSubmit}/>
                </form>
            </div>
        </div>
    );

}
