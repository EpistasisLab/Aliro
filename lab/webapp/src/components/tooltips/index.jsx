import React, { Component } from 'react';
// import ReactDOM
// import ReactDOM from 'react-dom';
// import './tooltip.css';



class ToolTip extends Component
{
	constructor(props)
  {
  	super(props);
  }
  render()
  {
  	let {state} = this;

    // const myElement = <h1>I Love JSX!</h1>;
    var div = document.createElement("div");
    div.style.width = "100px";
    div.style.height = "100px";
    div.innerHTML = "Hello";
    div.className = "side_panel";
    // add mouse over event to the div
    div.onmouseover = function() {
      div.style.backgroundColor = "red";
    };
    // append myElement to the app div using document instead of using ReactDOM
    document.getElementById('app').appendChild(div);
    
   
    return <div id="tooltip" className="on right">
            <div className="tooltip-arrow"></div><div className="tooltip-inner">Hey!!!!!ToolTip Component</div>
           </div>;
  }
  componentDidMount()
  {
  	
  }
  componentWillUnmount()
  {
  	
	}
}


export default ToolTip;