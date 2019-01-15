require('es6-promise').polyfill();
import fetch from 'isomorphic-fetch';
import React, { Component } from 'react';
import SceneHeader from '../SceneHeader';
import { Button, Input } from 'semantic-ui-react';

class FileUpload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedFile: null,
      loaded: 0
    };
  }
  handleselectedFile = event => {
    this.setState({
      selectedFile: event.target.files[0],
      loaded: 0,
    })
   window.console.log('selectedFile ', event.target.files[0]);
  }

  handleUpload = () => {
    const data = new FormData();
    data.append('file', this.state.selectedFile, this.state.selectedFile.name);
    window.console.log('uploading file... api call goes here');

    let myHeaders = new Headers();
    myHeaders.append('Content-Type', 'application/json');

   fetch("http://localhost:3000/upload", {
      method: 'POST',
      credentials: 'include',
      headers: myHeaders,
      mode: 'cors',
      cache: 'default',
      body: JSON.stringify(data)
    }).then(response => {
        window.console.log('got response ', response);
        return response.json();
      }, error => {
        window.console.log('error response ', error);
      });
    //window.console.log(data);
  }

  render() {
    return (
      <div>
        <Input
          type="file"
          label="Select new dataset"
          onChange={this.handleselectedFile}
        />
        <Button
          inverted
          color="blue"
          compact
          size="small"
          icon="plus"
          content="Upload dataset"
          onClick={this.handleUpload}
        />
      </div>
    );
  }
}

export default FileUpload;
