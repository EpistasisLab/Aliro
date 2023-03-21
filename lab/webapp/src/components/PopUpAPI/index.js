import React, { Component } from "react";

export default class PopUpAPI extends Component {
  

  handleClick = () => {
    // this.props.toggle();
    // console.log("handleClick");
    // console.log("this.props.openaiApiState", this.props.openaiApiState);
    // console.log("e.target.textContent", e.target.textContent);

    // get className modal
    var modal = document.getElementsByClassName("modal")[0];
    // make it unvisible
    modal.style.display = "none";
  };

  handleSubmit = (e) => {
    
    e.preventDefault();
    var openaiKey=document.getElementById("openaikey").value;

    // POST http://localhost:5080/openai/v1/configs
    // Content-Type: application/json

    // {
    //     "api_key" : "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",
    //     "org_id" : "Personal"
    // }

    // fetch("/openai/v1/configs", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json"
    //   },
    //   body: JSON.stringify({api_key: openaiKey, org_id: "Personal"})
    // })
    // .then((response) => {
    //   if (!response.ok) {
    //       // console.log("error!!!")
    //       // throw new Error(`HTTP error: ${response.status}`);
    //       alert("Connection to OpenAI is not established")
    //       // return 0;
    //       throw new Error(`HTTP error: ${response.status}`);
    //       // setopenaiApiState(0);
    //   } else {
    //       console.log("response_checkConnectionOpenAI", response)
    //       return response.text();
          
    //   }

    // })
    // .then((text) => {
    //     let parsed = JSON.parse(text);
    //     console.log("parsed-PopUpAPI", parsed)
    //     // return 1;

    //     // make openaiApiState === 1 using setopenaiApiState
    //     this.props.setopenaiApiState(this.props.openaiApiState + 1);
    //     alert("Connection to OpenAI is established")

    // })


    


//   PATCH http://localhost:5080/openai/v1/configs/641900fccee71a61d8f279b1
// Content-Type: application/json

// {
//     "api_key" : "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",
//     "org_id" : "Personal"
// }

    fetch("/openai/v1/configs/64193767a7c24ae72cf29f2f", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({api_key: openaiKey, org_id: "Personal"})
    })
    .then((response) => {
      console.log("response.ok", response.ok)
      if (!response.ok) {
          console.log("error!!!")
          // throw new Error(`HTTP error: ${response.status}`);
          alert("Connection to OpenAI is not established")
          return 0;
          // setopenaiApiState(0);
      } else {
          console.log("response_checkConnectionOpenAI", response)
          return response.text();
          
      }

  })
  .then((text) => {
      let parsed = JSON.parse(text);
      console.log("parsed-PopUpAPI", parsed)
      // return 1;

      // make openaiApiState === 1 using setopenaiApiState
      // setopenaiApiState(openaiApiState => openaiApiState + 1);
      this.props.setopenaiApiState(this.props.openaiApiState + 1);
      // this.props.checkConnShowGPT(e);
      // this.props.toggleChatGPT(e);

      alert("Connection to OpenAI is established")

      
  });
   

  };

  render() {
    return (
      <div className="modal">
        <div className="modal_content">
          <span className="close" onClick={this.handleClick}>
            &times;
          </span>
          <form>
            <h3>Please provide your OpenAI key!</h3>
            <h4>You can work with ChatGPT.</h4>
            {/* <div>Register!</div> */}
            <label>
              {/* Name: */}
              <input id="openaikey" type="text" name="name" />
            </label>
            {/* <br /> */}
            <input className="popupAPI" type="submit" onClick={this.handleSubmit}/>
          </form>
        </div>
      </div>
    );
  }
}
