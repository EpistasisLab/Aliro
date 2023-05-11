import AISVGLogo from './AISVGLogo'
import React from 'react';
import {useState, useEffect} from "react";

// import './style.css';

// import Prism from "prismjs";
// import "prismjs/themes/prism.css";
// import "../../../node_modules/prismjs/


// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { faThumbsUp } from '@fortawesome/free-solid-svg-icons'



// import * as labApi from '../../../../../tests/integration/jest/labApi.js';
// // import * as util from "./util/testUtils";
// var fs = require("../../../node_modules/fs/lib/index.js");
// import * as fs from 'fs/promises';
// import * as fs from 'fs';
// import FormData from 'form-data';


// class CustomFile extends File {
//     constructor(blobParts, filename, options) {
//       super(blobParts, filename, options);
//       this.path = options.path;
//     }
//   }


// Primary Chat Window
const ChatBox = ({chatLog, setChatInput, handleSubmit, chatInput,  modeForChatOrCodeRunning, setModeForChatOrCodeRunning,datasetId,experimentId, updateAfterRuningCode, modeForTabluerData, setModeForTabluerData, booleanPackageInstall, setBooleanPackageInstall,submitErrorWithCode,showCodeRunningMessageWhenClickRunBtn,getChatMessageByExperimentId,chatCurrentTempId,getSpecificChatbyChatId,patchChatToDB,checkCodePackages}) => 

{
    useEffect(() => {
    //     const highlightScript = document.createElement('script');
    // highlightScript.src = 'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.7.0/build/highlight.min.js';
    // document.body.appendChild(highlightScript);

    // const highlightStylesheet = document.createElement('link');
    // highlightStylesheet.rel = 'stylesheet';
    // highlightStylesheet.href = 'https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.7.0/build/styles/default.min.css';
    // document.head.appendChild(highlightStylesheet);

    // // <script>hljs.highlightAll();</script>

    // const highlightAll = document.createElement('script');
    // highlightAll.innerHTML = 'hljs.highlightAll();';
    // document.body.appendChild(highlightAll);

    // return () => {
    //   document.body.removeChild(highlightScript);
    //   document.head.removeChild(highlightStylesheet);
    //     document.body.removeChild(highlightAll);
    // };





//     <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/default.min.css">
// <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/highlight.min.js"></script>
// <!-- and it's easy to individually load additional languages -->
// <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/languages/go.min.js"></script>

    //  const highlightlink = document.createElement('link');
    //     highlightlink.rel = 'stylesheet';
    //     highlightlink.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/default.min.css';
    //     document.head.appendChild(highlightlink);

    // const highlightScript = document.createElement('script');
    // highlightScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/highlight.min.js';
    // document.body.appendChild(highlightScript);

    // const highlightGoScript = document.createElement('script');
    // highlightGoScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/languages/go.min.js';
    // document.body.appendChild(highlightGoScript);

    // return () => {
    //     document.head.removeChild(highlightlink);
    //     document.body.removeChild(highlightScript);
    //     document.body.removeChild(highlightGoScript);
    // };

    
        
      }, []);


    return (
    <section className="chatbox">
    <div className="chat-log">
        {
            chatLog.map(
                (message, index) => (
                    <ChatMessage key={index} 
                    message={message}
                    datasetId={datasetId}
                    experimentId={experimentId}
                    updateAfterRuningCode={updateAfterRuningCode}
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
                    
                />)
            )
        }
    </div>




    

    <div className="chat-input-holder">
        
            {/* toggle button for chat mode or coding mode */}
  
            {/* <button className="toggle-button-chat-code" onClick={
                        (e)=>{

                            if (e.target.textContent === "chat mode") {
                                setModeForChatOrCodeRunning("code")
                                //  background:
                                e.target.style.background = "#ae5211";
                            } else {
                                setModeForChatOrCodeRunning("chat")
                                e.target.style.background = "#2185D0";
                            }

                        }
                    }>{modeForChatOrCodeRunning} mode
            </button> */}
        

        <form className="chatSubmitForm" onSubmit={handleSubmit}>

            <input
                rows="1"
                value={chatInput}
                onChange={(e) => 
                    setChatInput(e.target.value)
                }
                className="chat-input-textarea"
                placeholder="Type your message here. "
                ></input>
            <button className="submit" type="submit">Submit</button>
        </form>

        
    </div>
    </section>
)
}

// Individual Chat Message
const ChatMessage = ({key,message,datasetId,experimentId,updateAfterRuningCode,modeForTabluerData, setModeForTabluerData,booleanPackageInstall, setBooleanPackageInstall, submitErrorWithCode,showCodeRunningMessageWhenClickRunBtn,getChatMessageByExperimentId, chatCurrentTempId,getSpecificChatbyChatId,patchChatToDB,checkCodePackages}) => {
    

    let codeIncluded = checkIncludeCode(message.message)
    let extractedCode = extractCodeFromMess(message.message)

    console.log("message.message", message.message)
    console.log("extractedCode-ChatMessage", extractedCode)


    // Nick's code
    // const regex = /```([^`]*)```/g;
    // const matches = messageFromOpenai.matchAll(regex);

    // for (const match of matches) {
    //     //check if the first 6 characters are python
    //     if(match[1].substring(0,6) === "python"){
    //         //remove the first 6 characters
    //         match[1] = match[1].substring(6);
    //     }
    //     // // console.log("python code:",match[1]);
    // }

    // message: messageFromOpenai.split(/\n/).map(
    //     line => 
    //     <div key={line}>
    //     {line}</div>
    // )







    const [isExpanded, setIsExpanded] = useState(false);

    // temp
    // const [tabluerData, setTabluerData] = useState([]);

    const handleDoubleClick = () => {

        // console.log("handleDoubleClick")
        setIsExpanded(!isExpanded);
    };

    async function runExtractedCode(code,datasetId,experimentId) {
        // POST http://localhost:5080/execapi/v1/executions/experiment/6431c4a9df7aa3004a1b8e18
        // Content-Type: application/json

        // {
        //   # "src_code": "import csv\n\ndata = [\n    ['Name', 'Age', 'Gender'],\n    ['Alice', 25, 'Female'],\n    ['Bob', 30, 'Male'],\n    ['Charlie', 35, 'Male'],\n    ['David', 40, 'Male'],\n]\n\nfilename = 'test.csv'\nfilepath = ''\n\nwith open(filepath + filename, mode='w', newline='') as file:\n    writer = csv.writer(file)\n    writer.writerows(data)\n\nprint(f'CSV file {filename} has been created and saved to {filepath}.')",
        //   "dataset_id": "6431c4a6df7aa3004a1b8e17",
        // }




        // let resultFromRuningCode= await fetch(`/execapi/v1/executions/${experimentId}`, {
        //     method: "POST",
        //     headers: {
        //         "Content-Type": "application/json"
        //     },
        //     body: JSON.stringify({
        //         "src_code": code,
        //         "dataset_id": datasetId,
        //     })
        // })
        // .then(response => response.json())
        // .then(data => {
        //     // console.log("response-data-result", data['result'])
        //     return data;
        // })
        // .catch(error => {
        //     // console.log("runExtractedCode-fetch-error", error)
        //     return error;
        // })


                // POST http://localhost:5080/execapi/v1/executions
        // Content-Type: application/json

        // {
        // "src_code": "import sklearn.decomposition\nimport matplotlib.pyplot as plt\n\npca = sklearn.decomposition.PCA(n_components=2)\ndf = pca.fit_transform(df.drop('target', axis=1))\n\nplt.scatter(df[:, 0], df[:, 1])\nplt.xlabel('PC 1')\nplt.ylabel('PC 2')\nplt.title('PCA Plot of Iris Dataset')\nplt.savefig('iris_pca.png')\n",
        // "dataset_id": "6434a0fe9c33cd004aa10011",
        // "experiment_id": "6434a1039c33cd004aa10012"
        // }

        let resultFromRuningCode= await fetch(`/execapi/v1/executions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "src_code": code,
                "dataset_id": datasetId,
                "experiment_id": experimentId
            })
        })
        .then(response => response.json())
        .then(data => {
            // console.log("response-data-result", data['result'])
            // console.log("response-data", data)
            // e.target.textContent = "Completed";
            console.log('star-1. runExtractedCode', data)
            return data;
        })
        .catch(error => {
            // console.log("runExtractedCode-fetch-error", error)
            return error;
        })


        return resultFromRuningCode;
        
        


        

        


    }

    function checkIncludeCode(message) {

        // if message is not undefined

        if (message !== undefined) {

            // console.log("message-checkIncludeCode", message)
            let codeIncluded = false;
            if (message.includes("```python")) {
                codeIncluded = true;
            }
            return codeIncluded
        }
        else
        {
            let codeIncluded = false;
            return codeIncluded
        }

    }

    function extractCodeFromMess(message) {

        // console.log("message-extractCodeFromMess", message)
        if (message === undefined) {
            return "";
        }
        let code = "";
        const regex = /```([^`]*)```/g;
        const matches = message.matchAll(regex);

        for (const match of matches) {
            // console.log("match-extractCodeFromMess", match)
            //check if the first 6 characters are python
            if(match[1].substring(0,6) === "python"){
                //remove the first 6 characters
                match[1] = match[1].substring(6);
            }
            // console.log("python code:",match[1]);
            code = match[1];

        }

        return code;

        



        // const code = match[1];

        // // console.log("extractCode",code);

        // // console.log("match-extractCodeFromMess[0]", match[0]);
        // // console.log("match-extractCodeFromMess[1]", match[1]);

        // for 

        // return code;

    }

    async function installPackages(packagesArray,e)
    {
        // POST http://localhost:5080/execapi/v1/executions/install
        // Content-Type: application/json

        // {
        //     "command": "install",
        //     "packages": packagesArray
        // }


        let resultFromInstallingPackages= await fetch(`/execapi/v1/executions/install`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "command": "install",
                "packages": packagesArray
            })
        })
        .then(response => response.json())
        .then(data => {
            // // console.log("installPackages-response-data-result", data['result'])
            // // console.log("resultFromInstallingPackages-response-data", data)
            return data;
        }
        )
        .catch(error => {
            // console.log("installPackages-fetch-error", error)
            return error;
        }
        )


        // console.log("resultFromInstallingPackages", resultFromInstallingPackages)
        // console.log("resultFromInstallingPackages[exec_results][stdout]",resultFromInstallingPackages["exec_results"]["stdout"])
        // resultFromInstallingPackages["exec_results"]["stdout"]
    }

    function findTheLastCodeMessageFromHTML(element)
    {
        // console.log("element-findTheLastCodeMessageFromHTML", element)
        // element is e.target.parentElement.parentElement.parentElement.parentElement.parentElement.children[e.target.parentElement.parentElement.parentElement.parentElement.parentElement.children.length-2]

        // extract all text from element
        let text = element.innerText;

        return text;

    }


    function booleanErrorMessageorNot(line)
    {
       if (line.includes("Errno") || line.includes("Error") || line.includes("No module named")|line.includes("invalid syntax") ||line.includes("not"))
       {
        return true;
       }

       else
       {
        return false;
       }
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
    


    

    // get packages from the tempCode

    // function getPackagesFromTempCode(tempCode)
    // {
    
    //     pattern = r"import\s+(\w+)\s+as\s+\w+"
    
    //     matches = re.findall(pattern, code)
    
    //     return set(matches)
    // }


    // function getPackagesFromTempCode(tempCode)
    // {
    //     // Regular expression pattern to match package imports
    //     const pattern = /import\s+(\w+)\s+/g;
        
    //     // Find all matches of the pattern in the code
    //     const matches = tempCode.matchAll(pattern);
        
    //     // Initialize an empty set to store the package names
    //     const packages = new Set();
        
    //     // Loop through each match and add the package name to the set
    //     for (const match of matches) {
    //       packages.add(match[1]);
    //     }
        
    //     // Return an array of unique package names
    //     return Array.from(packages);
    //   }


    function getPackagesFromTempCode(tempCode)
    {
        const packageRegex = /(import|from) (\w+)/g;
        const matches = tempCode.match(packageRegex);
        console.log("matches", matches)
        const packages = new Set();
        if (matches) {
          for (let match of matches) {
            const [importType, packageName] = match.split(' ');
            console.log("importType, packageName", importType, packageName)
            if (importType === 'import') {
              packages.add(packageName);
            } else if (importType === 'from') {
              packages.add(packageName.split('.')[0]);
            }
          }
        }
        return Array.from(packages);
      }




   
    

    return (
        <div className={`chat-message ${message.user === "gpt" && "alirogpt"}`}>
            <div className="chat-message-center">
                <div className={`avatar ${message.user === "gpt" && "alirogpt"}`}>
                    {
                        message.user === "gpt"
                            ? <AISVGLogo/>
                            : <div>You</div>
                    }
                </div>
                {/* origin */}
                {/* <div className="message">
                        {message.message}
                </div>  */}


                {/* In this case, it shows normal string message. */}
                {/* if code is false then show  */}
                {
                    codeIncluded === false ?
                    // non code message
                    <div className="message">
                        {/* origin */}
                        {/* {message.message} */}

                        
                

                        {/* v7 */}
                        {   
                            message.message.split(/\n/).map((line,index) => {
                                
                                
                                // non code message which includes image
                                if (line.includes(".png") && line.includes("http") || line.includes(".jpg") && line.includes("http")) {
                                    // console.log("1-if", line)
                                  return (
                                    

                                    <a href={line.substring(line.indexOf("http"))} download>
                                        <div style={{ position: 'relative', width: '100%', paddingBottom: '100%' }}>
                                            <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                                            <image href={line.substring(line.indexOf("http"))} height="100%" width="100%" />
                                            </svg>
                                        </div>
                                    </a>

                                  );
                                } 
                                // non code message which includes csv or tsv
                                else if (line.includes(".csv") && line.includes("http") || line.includes(".tsv") && line.includes("http")) 
                                {
                                    // console.log("2-if", line)
                                    return (
                                        <div>
                                            {/* show me preview of the file  */}

                                            {/* make below unvisible */}
                                            <a style={{marginRight: '10px',fontWeight
                                            :'bold'}} onClick={async (e) => {
                                            

                                                

                                                if (e.target.parentElement.parentElement.children[3].style.display === "none")
                                                {
                                                    e.target.parentElement.parentElement.children[3].style.display = "block";
                                                }

                                                else{
                                                    e.target.parentElement.parentElement.children[3].style.display = "none";
                                                }
                                                

                                                const url = line.substring(line.indexOf("http"));

                                                }}>Preview file</a>
                                        
                                        <a href={line.substring(line.indexOf("http"))} download>
                                            <b style={{color: '#87CEEB'}}>Download {line.substring(0, line.indexOf(","))}</b>
                                        </a>

                                        


                                        





                                            {/* uploading file button */}
                                            {/* Or... like below, it is better provide to generate the new experiment with the processed dataset, which means that skipping the step where users upload the dataset. */}
                                            {/* <a style={{ marginLeft:'10px'}} onClick={(e) => {
                                                e.preventDefault();
                                                // console.log("e.target", e.target);
                                                document.getElementById('datasetInput').click();
                                                }}>
                                                Upload dataset
                                                </a>
                                                <input
                                                type="file"
                                                id="datasetInput"
                                                style={{display: 'none'}}
                                                onChange={(e) => {
                                                    // console.log("upload file",e.target.files)

                                                    // show me preview of the file
                                                    let file = e.target.files[0];
                                                    let reader = new FileReader();
                                                    reader.readAsText(file);
                                                    reader.onload = function() {
                                                        // console.log("reader.result",reader.result);
                                                    };
                                                    reader.onerror = function() {
                                                        // console.log(reader.error);
                                                    };



                                                }

                                                }
                                            /> */}

                                            {/* generating experiment button */}
                                            {/* <a style={{ marginLeft:'10px'}} onClick={async (e) => {
                                                e.preventDefault();
                                                // get the url of the file
                                                const url = e.target.parentElement.children[1].href;


                                                
                                                }}>
                                                Generate experiment
                                            </a> */}
                                                
                                                
                                            


                                        </div>
                                    );
                                } 

                                // if the message includes "The tabular data is:" , set modeForTabluerData to true
                                // this let us know that the next line is tabluer data
                                else if (line.includes("The tabular data is:") && modeForTabluerData === false)
                                {   
                                    // console.log("3-if", line)
                                    setModeForTabluerData(true);
                                }
                                // Tabluer data is here. It previews the data by showing top 10 rows.
                                else if ( modeForTabluerData === true && index ==4 )
                                {   

                                    // console.log("4-if", line)

                                    // check there is \t or not to check the file is csv or tsv
                                    if (line.includes("\t"))
                                    {
                                        line=line.replace(/\t/g, ',');
                                    }
                                    // line = line.replace(/_/g, "\n");
                                    line = line.replace(/_/g, "\n");
                                    
                                    // console.log("4-if-replace", line)
                                    // make line as array
                                    const rows = line.split("\n");
                                    const data = rows.map((row) => row.split(","));
                                    
                                    return (
                                        <div className="previewTable" style={{ overflowX: "auto", overflowY: "auto", backgroundColor: '#343a40', borderRadius: '10px', padding: '10px', marginTop: '10px', display:"none"}}>
                                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                                <thead>
                                                <tr>
                                                    {data[0] && data[0].map((column) => <th style={{ textAlign: "center", border: "1px solid rgba(255, 255, 255, 0.5)" }}>{column}</th>)}
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {data.slice(1, 11).map((row) => (
                                                    <tr>
                                                    {row.map((cell) => (
                                                        <td style={{ textAlign: "center", border: "1px solid rgba(255, 255, 255, 0.5)" }}>{cell}</td>
                                                    ))}
                                                    </tr>
                                                ))}
                                                </tbody>
                                            </table>
                                            </div>
                                    )


                                    


                                        
                                    // // make varible to store below div
                                    // const row =(
                                    // <div className="tableRow" style={{backgroundColor: '#343a40', 
                                    //     borderTopLeftRadius: index === 4 ? '10px' : '0', borderTopRightRadius: index === 4 ? '10px' : '0', borderBottomLeftRadius: index === 9 ? '10px' : '0', borderBottomRightRadius: index === 9 ? '10px' : '0',
                                    //     marginTop: index === 4 ? '10px' : '0',
                                    //     }}>
                                    //         <table style={{width: '100%', tableLayout: 'fixed'}}>
                                    //             <tbody>
                                    //             <tr>
                                    //                 {/* split line by comma */}
                                    //                 {line.split(",").map((cell) => (
                                    //                 <td style={{width: '10%',textAlign: 'center',border: '1px solid rgba(255, 255, 255, 0.5)'}}>{cell}</td>
                                    //                 ))}
                                    //             </tr>
                                    //             </tbody>
                                    //         </table>
                                    // </div>);

                                    // tableRowArray.push(row); 


                                    // if (index === 9)
                                    // {
                                    //     return (
                                    //         <div className="entireTable" style={{width: '100%', overflowX: 'auto'}}>
                                    //           {tableRowArray}
                                    //         </div>
                                    //       );
                                    // }



                                    
                                    // return(
                                    //     <div className="tableRow" style={{backgroundColor: '#343a40',
                                    //     marginTop: index === 4 ? '10px' : '0',
                                    //     }}>
                                    //         <table style={{width: '100%', tableLayout: 'fixed'}}>
                                    //             <tbody>
                                    //             <tr>
                                    //                 {/* split line by comma */}
                                    //                 {line.split(",").map((cell) => (
                                    //                 <td style={{width: '10%',textAlign: 'center',border: '1px solid rgba(255, 255, 255, 0.5)'}}>{cell}</td>
                                    //                 ))}
                                    //             </tr>
                                    //             </tbody>
                                    //         </table>
                                    //     </div>
                                    // )





                                    // return(
                                    //     // get element by id testTable
                                        
                                    //     <div className="tableRow" style={{backgroundColor: '#343a40', 
                                    //     borderTopLeftRadius: index === 4 ? '10px' : '0', borderTopRightRadius: index === 4 ? '10px' : '0', borderBottomLeftRadius: index === 9 ? '10px' : '0', borderBottomRightRadius: index === 9 ? '10px' : '0',
                                    //     marginTop: index === 4 ? '10px' : '0',
                                    //     }}>
                                    //         <table style={{width: '100%', tableLayout: 'fixed'}}>
                                    //             <tbody>
                                    //             <tr>
                                    //                 {/* split line by comma */}
                                    //                 {line.split(",").map((cell) => (
                                    //                 <td style={{width: '10%',textAlign: 'center',border: '1px solid rgba(255, 255, 255, 0.5)'}}>{cell}</td>
                                    //                 ))}
                                    //             </tr>
                                    //             </tbody>
                                    //         </table>
                                    //     </div>
                                    // )






                                    // return (
                                    //     <div style={{width: '100%', overflowX: 'auto'}}>
                                    //     <div id="justmessage" style={{backgroundColor: '#343a40', 
                                    //                                     borderTopLeftRadius: index === 4 ? '10px' : '0', borderTopRightRadius: index === 4 ? '10px' : '0', borderBottomLeftRadius: index === 9 ? '10px' : '0', borderBottomRightRadius: index === 9 ? '10px' : '0',
                                    //                                     marginTop: index === 4 ? '10px' : '0',
                                    //                                     }}>
                                    //         <div style={{width: '100%', overflowX: 'auto'}}>
                                    //         <table style={{width: '100%', tableLayout: 'fixed'}}>
                                    //             <tbody>
                                    //             <tr>
                                    //                 {/* split line by comma */}
                                    //                 {line.split(",").map((cell) => (
                                    //                 <td style={{width: '10%',textAlign: 'center',border: '1px solid rgba(255, 255, 255, 0.5)'}}>{cell}</td>
                                    //                 ))}
                                    //             </tr>
                                    //             </tbody>
                                    //         </table>
                                    //         </div>
                                    //     </div>
                                    //     </div>
                                    // )

                                    


                                    
                                }

                                // this is for the normal message
                                // in this case, there are 2 types of message
                                // 1. message with "Errno" in it
                                // 2. message without "Errno" in it
                                else if(!line.includes("The tabular data is:")) {
                                    if (!line.includes("This is the end of the tabular data."))
                                    {


                                        // if line includes "Errno" show below
                                        // error message check
                                        if (line.includes("Errno") || line.includes("Error") || line.includes("No module named")|line.includes("invalid syntax"))  {
                                            return (
                                                <div id="justmessage" >
                                                    <span style={{ color: '' }}>{line}</span>
                                                    <br />
                                                    <button id="runbutton" className="run-code-button" onClick={
                                                        async (e)=>
                                                        {
                                                    
                                                            
                                                            let tempText=findTheLastCodeMessageFromHTML(e.target.parentElement.parentElement.parentElement.parentElement.parentElement.children[e.target.parentElement.parentElement.parentElement.parentElement.parentElement.children.length-2])

                                                            // console.log("text-findTheLastCodeMessageFromHTML", tempText)

                                                            // extrac code from text 
                                                            // code is between ```python and ```

                                                            let tempCode = extractCodeFromMess(tempText);

                                                            // console.log("code-findTheLastCodeMessageFromHTML", tempCode)

                                                        

                                                            await submitErrorWithCode(e, tempCode)

                                                            // // console.log("chatLog-Errno",chatLog)


                                                            
                                                            
                                                            // call openai api to generate code based on current code and error message
                                                            // let resp = await runExtractedCode(extractedCode, datasetId,experimentId);
                                                                                                                        
                                                            
                                                            // updateAfterRuningCode(e, resp)
                                                            
                                                            
                                                        


                                                        }

                                                        
                                                    }
                                                    // mouseover
                                                    // onMouseOver={(e)=>{
                                                    //     // parent of parent of parent of parent of parent of e.target
                                                    //     // console.log("gen-e.target.parentElement.parentElement.parentElement.parentElement.parentElement",e.target.parentElement.parentElement.parentElement.parentElement.parentElement)

                                                    //     // children of e.target.parentElement.parentElement.parentElement.parentElement.parentElement
                                                    //     // console.log("gen-e.target.parentElement.parentElement.parentElement.parentElement.parentElement.children",e.target.parentElement.parentElement.parentElement.parentElement.parentElement.children)

                                                    //     // second child of e.target.parentElement.parentElement.parentElement.parentElement.parentElement from the last child
                                                    //     // console.log("gen-e.target.parentElement.parentElement.parentElement.parentElement.parentElement.children[e.target.parentElement.parentElement.parentElement.parentElement.parentElement.children.length-2]",e.target.parentElement.parentElement.parentElement.parentElement.parentElement.children[e.target.parentElement.parentElement.parentElement.parentElement.parentElement.children.length-2])




                                                    //     let text=e.target.parentElement.parentElement.parentElement.parentElement.parentElement.children[e.target.parentElement.parentElement.parentElement.parentElement.parentElement.children.length-2].innerText;

                                                    //     // console.log("text-findTheLastCodeMessageFromHTML", text)

                                                    //     let code = extractCodeFromMess(text);

                                                    //     // // console.log("code-findTheLastCodeMessageFromHTML", code)

                                                    // }}
                                                    >
                                    Submit error

                                        {/* <p>
                                            {extractedCode.code}{' '}
                                        
                                        </p> */}
                                        
                                                     </button>
                                                </div>
                                            );
                                        }

                                        else{
                                            return (
                                                <div id="justmessage" >
                                                    {line}
                                                </div>
                                            );
                                        }
                                    }
                                  }

                              })
                        }
                    </div> : 

                    // code message
                    <div className="message code">
                        {
                            message.message.split(/\n/).map((line, index) => {
                                if (index === 0) {
                                    return (
                                      <div className="message-nonEditable">
                                        {line}
                                      </div>
                                    );
                                  }

                            })
                        }
                        
                            {/* code contents */}
                            {/* make background color of this div black */}
                            <div className="code-editable" style={{ width: '100%', overflowX: 'auto' , backgroundColor: '#343a40', borderRadius: '10px', padding: '10px', marginTop: '10px'}}
                            
                            onDoubleClick={(e)=>{

                                console.log("Double click code")
                                
                                e.target.parentElement.parentElement.parentElement.contentEditable = true;
                                e.target.parentElement.parentElement.parentElement.focus();

                                

                                // e.target.parentElement.parentElement.parentElement.onkeydown
                                e.target.parentElement.parentElement.parentElement.onkeydown = async function(e) {
                                    console.log("e.keyCode", e.keyCode)
                                    console.log("e.button", e.button)
                                    console.log("e.target.parentElement", e.target.parentElement)
                                    console.log("e.target", e.target)

                                    // find element id runbutton from the e.target.parentElement child

                                    
                                    console.log("e.code",e.code)




                                    

                                    


                                    // enter key is not allowed
                                    if(e.keyCode === 27) {
                                        console.log("e.keyCode === 27 esc key")
                                        // console.log("e.target.innerText", e.target.innerText)

                                        let tempChatCodeExplain = e.target.parentElement.getElementsByClassName("message-nonEditable")[0].innerText;

                                        console.log("tempChatCodeExplain", tempChatCodeExplain)
                                  
                                        
                                        let tempUpdatedCodewithChat = tempChatCodeExplain+"\n"+"```python"+"\n"+e.target.innerText+"\n"+"```";

                                        // console.log("tempUpdatedCodewithChat", tempUpdatedCodewithChat)

                                        e.preventDefault();
                                        e.target.contentEditable = false;
                                        e.target.focus();

                                        console.log("inner-text", e.target.innerText)

                                        // update extractedCode var
                                        extractedCode=extractCodeFromMess(e.target.innerText);
                                        console.log("extractedCode-test-27", extractedCode)

                                        // modify the code to the chatlog
                                        // should i update the chatlog?

                                        // post updated code to the DB
                                        // postChatNameToDB(tempString)





                                        // POST http://localhost:5080/chatapi/v1/chatlogs
                                        // Content-Type: application/json

                                        // {
                                        //     "_chat_id" : "645028384f4513a0b9459e53",
                                        //     "message" : "Hello there from my desk!",
                                        //     "message_type" : "text",
                                        //     "who" : "user"
                                        // }


                                        // experimentId

                                        

                                        // GET http://localhost:5080/chatapi/v1/chats/experiment/${experimentId}
                                        let data = await getChatMessageByExperimentId(experimentId);

                                        // filter the data using _experiment_id
                                        var filteredData = data.filter((item) => item._experiment_id === experimentId)

                                        

                                        // get div class name "chat-log"
                                        let chatLog_divs = document.getElementsByClassName("chat-log");


                                        let temp_index_chat=0;

                                        console.log("e.target.parentElement.parentElement.parentElement", e.target.parentElement.parentElement.parentElement)

                                        for (let i = 0; i < chatLog_divs[0].children.length; i++) {

                                            if (chatLog_divs[0].children[i] === e.target.parentElement.parentElement.parentElement)
                                            {
                                                console.log("choi-i", i)
                                                temp_index_chat = i;
                                            }

                                        }


                                        let chatByChatId= await getSpecificChatbyChatId(filteredData[chatCurrentTempId-1]["_id"])

                                        // update the code
                                        await patchChatToDB(chatByChatId.chatlogs[temp_index_chat]['_id'], tempUpdatedCodewithChat, "text", "gpt");

                                    }

                                    
                                    
                                }        
                            }}
                            
                            
                            >
                                <pre style={{ margin: 0 }}>
                                    <code style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', color: 'deepskyblue' }}>
                                    {/* <code className='language-python'> */}

                                        {
                                            
                                            message.message.split(/\n/).map((line, index) => {
                                                

                                                if (index !== 0) {
                                                    if (line.includes("```python") || line.includes("```")) {
                                                    //   return null; // return null to render nothing
                                                    return (
                                                        // non visible
                                                        <div className="line-editable" style={{display: 'none'}}>
                                                          {line}
                                                        </div>
                                                    )
                                                    } else {
                                                      return (
                                                        <div className="line-editable">
                                                          {line}
                                                        </div>
                                                      );
                                                    }
                                                  } 
                                                  
                                                  
                                                
                                              })
                                        }
                                    </code>
                                </pre>
                            </div>


                            {
                            message.message.split(/\n/).map(
                                (line, index) =>
                                {
                                    
                                    if (line.includes("not installed") && index ===0)
                                    {
                                        
                                        return (
                                            <div>
                            <button id="installpackagesbutton" className="run-code-button" onClick={
                                async (e)=>
                                {

                                    let currentEvent = e;
                                    let packageIncludedString = currentEvent.target.parentElement.parentElement.getElementsByClassName("message-nonEditable")[0].textContent;


                                    let tempCode = e.target.parentElement.parentElement.getElementsByClassName("code-editable")[0].innerText;

                                    // get package from the tempCode
                                    let packagesFromTempCode=getPackagesFromTempCode(tempCode);

                                    console.log("packagesFromTempCode", packagesFromTempCode)
                                    
                                    if(currentEvent) {
                                            
                                            
    
                                    let tempChatCodeExplain = e.target.parentElement.parentElement.getElementsByClassName("message-nonEditable")[0].innerText;


    
                                    // console.log("tempChatCodeExplain", tempChatCodeExplain)
                              
                                    
                                    let tempCode = e.target.parentElement.parentElement.getElementsByClassName("code-editable")[0].innerText;



                                    let tempUpdatedCodewithChat = tempChatCodeExplain+"\n"+"```python"+"\n"+tempCode+"\n"+"```";

                                    // console.log("tempUpdatedCodewithChat", tempUpdatedCodewithChat)
                                    
                                    let tempElement = e.target.parentElement.parentElement.parentElement.parentElement;

                                    e.preventDefault();
                                    e.target.contentEditable = false;
                                    e.target.focus();

                                    // update extractedCode var
                                    extractedCode=extractCodeFromMess(e.target.parentElement.parentElement.getElementsByClassName("code-editable")[0].innerText);
                                    


                                    // modify the code to the chatlog
                                    // should i update the chatlog?

                                    // post updated code to the DB
                                    // postChatNameToDB(tempString)





                                    // POST http://localhost:5080/chatapi/v1/chatlogs
                                    // Content-Type: application/json

                                    // {
                                    //     "_chat_id" : "645028384f4513a0b9459e53",
                                    //     "message" : "Hello there from my desk!",
                                    //     "message_type" : "text",
                                    //     "who" : "user"
                                    // }


                                    // experimentId

                                    

                                    // GET http://localhost:5080/chatapi/v1/chats/experiment/${experimentId}
                                    let data = await getChatMessageByExperimentId(experimentId);

                                    // filter the data using _experiment_id
                                    var filteredData = data.filter((item) => item._experiment_id === experimentId)

                                    

                                    // get div class name "chat-log"
                                    let chatLog_divs = document.getElementsByClassName("chat-log");


                                    let temp_index_chat=0;

                                    console.log("tempElement",tempElement)

                                    for (let i = 0; i < chatLog_divs[0].children.length; i++) {

                                        if (chatLog_divs[0].children[i] === tempElement)
                                        {
                                            console.log("choi-i", i)
                                            temp_index_chat = i;
                                        }

                                    }


                                    let chatByChatId= await getSpecificChatbyChatId(filteredData[chatCurrentTempId-1]["_id"])

                                    // update the code
                                    await patchChatToDB(chatByChatId.chatlogs[temp_index_chat]['_id'], tempUpdatedCodewithChat, "text", "gpt");

                                    }


                                    // 


                                    console.log("installpackagesbutton-click")

                                    
                                    // let packageIncludedString = currentEvent.target.parentElement.parentElement.getElementsByClassName("message-nonEditable")[0].textContent;

                                    console.log("packageIncludedString", packageIncludedString)

                                    const packageNamesString = packageIncludedString.substring(0, packageIncludedString.indexOf("package"));

                                    // // console.log("packageNamesString", packageNamesString)

                                    // remove space in the packageNamesString
                                    
                                    let packageNamesStringNospace=packageNamesString.replace(/\s/g, '');
                                    let packageNames = packageNamesStringNospace.split(",");

                                    console.log("packageNames", packageNames)

                                    // combine packageNames with packagesFromTempCode

                                    packageNames = packageNames.concat(packagesFromTempCode);

                                    console.log("packageNamesCombined", packageNames)

                                    // remove duplicate 
                                    packageNames = [...new Set(packageNames)];

                                    console.log("packageNamesCombinedUnique", packageNames)



                                    // use usestate to change the text of the button
                                    // e.target.textContent = "Installing...";
                                    
                                    // e.target.disabled = true;
                                    // e.target.style.color = "black";

                                    // let tempCode = e.target.parentElement.parentElement.getElementsByClassName("code-editable")[0].innerText;

                                    extractedCode = tempCode.replace(/```python/g, "").replace(/```/g, "");
                                    
                                    console.log("INS-extractedCode",extractedCode)

                                    await showCodeRunningMessageWhenClickRunBtn(currentEvent);



                                    // checkCodePackages
                                    let packagesNotInstalled = await checkCodePackages(packageNames);

                                    console.log("install-packagesNotInstalled", packagesNotInstalled)
                                    
                                    // call install function
                                    let resp_installPackages = await installPackages(packagesNotInstalled); 
                                    console.log("resp_installPackages", resp_installPackages) 
                                    let resp_runExtractedCode = await runExtractedCode(extractedCode, datasetId,experimentId);


                                    // console.log("resp_runExtractedCode", resp_runExtractedCode)
                            
                                    // e.target.textContent = "Installed";


                                    // use setchatlog function to update the chatlog
                                    // update to the db and refer updateAfterRuningCode function
                                    updateAfterRuningCode(currentEvent, resp_runExtractedCode)
                                }
                            }
                            
                            >
                                Install and Run
                            </button>
                                            </div>
                                        )
                                    }
                                    else if(!line.includes("not installed") && index ===0){
                                        // // console.log("temp-button-installed-line", line)
                                        return (
                                            <div>
                                <button id="runbutton" className="run-code-button" onClick={
                                    async (e)=>
                                    {

                                        let currentEvent = e;
                                        
                                        // if(e) {
                                            
                                            
    
                                            let tempChatCodeExplain = e.target.parentElement.parentElement.getElementsByClassName("message-nonEditable")[0].innerText;
    
                                            // console.log("tempChatCodeExplain", tempChatCodeExplain)
                                      
                                            
                                            let tempCode = e.target.parentElement.parentElement.getElementsByClassName("code-editable")[0].innerText;

                                            // get package from the tempCode
                                            let packagesFromTempCode=getPackagesFromTempCode(tempCode);

                                            console.log("teresa-packagesFromTempCode", packagesFromTempCode)




                                            let tempUpdatedCodewithChat = tempChatCodeExplain+"\n"+"```python"+"\n"+tempCode+"\n"+"```";
    
                                            // console.log("tempUpdatedCodewithChat", tempUpdatedCodewithChat)
                                            
                                            let tempElement = e.target.parentElement.parentElement.parentElement.parentElement;

                                            e.preventDefault();
                                            e.target.contentEditable = false;
                                            e.target.focus();
    
                                            // update extractedCode var
                                            extractedCode=extractCodeFromMess(e.target.parentElement.parentElement.getElementsByClassName("code-editable")[0].innerText);
                                            

    
                                            // modify the code to the chatlog
                                            // should i update the chatlog?
    
                                            // post updated code to the DB
                                            // postChatNameToDB(tempString)
    
    
    
    
    
                                            // POST http://localhost:5080/chatapi/v1/chatlogs
                                            // Content-Type: application/json
    
                                            // {
                                            //     "_chat_id" : "645028384f4513a0b9459e53",
                                            //     "message" : "Hello there from my desk!",
                                            //     "message_type" : "text",
                                            //     "who" : "user"
                                            // }
    
    
                                            // experimentId
    
                                            
    
                                            // GET http://localhost:5080/chatapi/v1/chats/experiment/${experimentId}
                                            let data = await getChatMessageByExperimentId(experimentId);
    
                                            // filter the data using _experiment_id
                                            var filteredData = data.filter((item) => item._experiment_id === experimentId)
    
                                            
    
                                            // get div class name "chat-log"
                                            let chatLog_divs = document.getElementsByClassName("chat-log");
    
    
                                            let temp_index_chat=0;

                                            console.log("tempElement",tempElement)
    
                                            for (let i = 0; i < chatLog_divs[0].children.length; i++) {
    
                                                if (chatLog_divs[0].children[i] === tempElement)
                                                {
                                                    console.log("choi-i", i)
                                                    temp_index_chat = i;
                                                }
    
                                            }
    
    
                                            let chatByChatId= await getSpecificChatbyChatId(filteredData[chatCurrentTempId-1]["_id"])
    
                                            // update the code
                                            await patchChatToDB(chatByChatId.chatlogs[temp_index_chat]['_id'], tempUpdatedCodewithChat, "text", "gpt");
    
                                        // }


                                        // e.target.parentElement.parentElement.getElementsByClassName("code-editable")[0].innerText;
                                
                                        // use usestate to change the text of the button
                                        // document.getElementById("runbutton").textContent = "Running...";
                                        // console.log("ttt",e.target.textContent)
                                        // e.target.textContent = "Running...";
                                        // make the button non clickable
                                        // e.target.click = false;
                                        // e.target.disabled = true;
                                        // e.target.style.color = "black";

                                        // console.log("RUN-extractedCode",e.target.parentElement.parentElement)
                                        // get children who has className code-editable from e.target.parentElement.parentElement
                                        // console.log("RUN-extractedCode",e.target.parentElement.parentElement.getElementsByClassName("code-editable")[0].textContent)

                                        // remove ```python and ``` from e.target.parentElement.parentElement.getElementsByClassName("code-editable")[0].textContent




                                        
                                        // let tempCode = e.target.parentElement.parentElement.getElementsByClassName("code-editable")[0].innerText;

                                        extractedCode = tempCode.replace(/```python/g, "").replace(/```/g, "");





                                        await showCodeRunningMessageWhenClickRunBtn( currentEvent)

                                        console.log("run-packagesFromTempCode", packagesFromTempCode)

                                        let packagesNotInstalled = await checkCodePackages(packagesFromTempCode)

                                        console.log("run-packagesNotInstalled", packagesNotInstalled)
                                        
                                        let resp_installPackages = await installPackages(packagesNotInstalled); 

                                        let resp = await runExtractedCode(extractedCode, datasetId,experimentId);
                                        
                                        
                                        
                                        await updateAfterRuningCode( currentEvent, resp)
                                        
                                        
                                    


                                    }
                                }>
                                    Run
                                        
                                </button>
                                            </div>
                                        )
                                    }
                                    
                                
                                }
                            )
                        }

                        {/* {message.message} */}
                        
                    
                        {/* Run button */}
                        {/* if booleanPackageInstall is false, show run button */}
                        {/* if booleanPackageInstall is true, show install button */}


                        
                        
                        


                    </div>


                }

            </div>
        </div>
    )
}


const codeMessage = (message) => {
    return(
        <div className="message code">
            <pre>
                <code>
                    {message}
                </code>
            </pre>
        </div>
    )
}

export default ChatBox




