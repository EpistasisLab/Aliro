//require('es6-promise').polyfill();
//import fs = require('fs');
import fetch from 'isomorphic-fetch';
import React, { Component } from 'react';
import SceneHeader from '../SceneHeader';
import { put } from '../../utils/apiHelper';
import { Button, Input, Form } from 'semantic-ui-react';

class FileUpload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedFile: null,
      dependentCol: '',
      loaded: 0
    };
    this.handleDepColField = this.handleDepColField.bind(this);
  }

  handleDepColField(e, props) {
    this.setState({dependentCol: props.value});
  }

  handleselectedFile = event => {
    this.setState({
      selectedFile: event.target.files[0],
      loaded: 0
    })
  }

  handleUpload = () => {
    const data = new FormData();
    //data.append('_files', this.state.selectedFile, this.state.selectedFile.name);
    //data.append('target_column', { target_column: 'test_target_column_name' });
    window.console.log('uploading file... ');
    // only attempt upload if there is a selected file with a filename
    if(this.state.selectedFile && this.state.selectedFile.name) {
      let depCol = this.state.dependentCol;
      let metadata =  JSON.stringify({
                'name': this.state.selectedFile.name,
                'username': 'testuser',
                'timestamp': Date.now(),
                'dependent_col' : depCol
              });
      data.append('_metadata', metadata);

      data.append('_files', this.state.selectedFile);

      let myHeaders = new Headers();
      myHeaders.append('Content-Type', 'multipart/form-data');

      fetch("/api/v1/datasets", {
        method: 'PUT',
        credentials: 'include',
        body: data
      }).then(response => {
          return response.json();
        })
        .catch((err) => {
               throw(err);
        })
        .then(json => this.setState({ serverFileUploadResp: json }));
    } else {
      window.console.log('no file available');
    }
  }

  render() {
    this.state.serverFileUploadResp ? window.console.log('file uploaded', this.state.serverFileUploadResp) : window.console.log('no dice');
    return (
      <div>
      <Form inverted>
        <Input
          type="file"
          label="Select new dataset"
          onChange={this.handleselectedFile}
        />
        <Form.Input
          label="Dependent Column"
          placeholder="class"
          type="text"
          onChange={this.handleDepColField}
        />
        <Button
          inverted
          color="blue"
          compact
          size="small"
          icon="upload"
          content="Upload dataset"
          onClick={this.handleUpload}
        />
      </Form>
      </div>
    );
  }
}

export default FileUpload;
