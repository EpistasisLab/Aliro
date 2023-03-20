import React, { Component } from "react";

export default class PopUpAPI extends Component {
  handleClick = () => {
    // this.props.toggle();
    console.log("clicked");
  };

  handleSubmit = () => {
    console.log("submit!!!");
  };

  render() {
    return (
      <div className="modal">
        <div className="modal_content">
          <span className="close" onClick={this.handleClick}>
            &times;
          </span>
          <form>
            <h3>Please provide your key!</h3>
            {/* <div>Register!</div> */}
            <label>
              {/* Name: */}
              <input ype="text" name="name" />
            </label>
            {/* <br /> */}
            <input className="popupAPI" type="submit" onClick={this.handleSubmit}/>
          </form>
        </div>
      </div>
    );
  }
}
