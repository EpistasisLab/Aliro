//require('es6-promise').polyfill();
//import fs = require('fs');
import fetch from 'isomorphic-fetch';
import { connect } from 'react-redux';
import React, { Component } from 'react';
import { getSortedDatasets } from 'data/datasets';
import { fetchDatasets } from 'data/datasets/actions';
import { uploadDataset } from 'data/datasets/dataset/actions';
import SceneHeader from '../SceneHeader';
import { put } from '../../utils/apiHelper';
import { Button, Input, Form, Segment } from 'semantic-ui-react';

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

  componentDidMount() {
    //this.props.fetchDatasets();
    //window.console.log('FileUpload props', this.props);
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
    const { uploadDataset } = this.props;
    const data = new FormData();
    //data.append('_files', this.state.selectedFile, this.state.selectedFile.name);
    //data.append('target_column', { target_column: 'test_target_column_name' });
    window.console.log('uploading file... ');
    // only attempt upload if there is a selected file with a filename
    if(this.state.selectedFile && this.state.selectedFile.name) {
      let depCol = this.state.dependentCol;
      if(depCol === '') {
        window.console.log('please enter dependentCol value');
      }else {
        let metadata =  JSON.stringify({
                  'name': this.state.selectedFile.name,
                  'username': 'testuser',
                  'timestamp': Date.now(),
                  'dependent_col' : depCol
                });
        data.append('_metadata', metadata);

        data.append('_files', this.state.selectedFile);

        uploadDataset(data).then(stuff => {
          window.console.log('FileUpload props after download', this.props);
          //this.setState({ serverFileUploadResp: json });
          this.props.fetchDatasets();
        });

        // let myHeaders = new Headers();
        // myHeaders.append('Content-Type', 'multipart/form-data');

        // fetch("/api/v1/datasets", {
        //   method: 'PUT',
        //   credentials: 'include',
        //   body: data
        // }).then(response => {
        //     return response.json();
        //   })
        //   .catch((err) => {
        //          throw(err);
        //   })
        //   .then((json) => {
        //     window.console.log('FileUpload props after download', this.props);
        //     this.setState({ serverFileUploadResp: json });
        //     this.props.fetchDatasets();
        //   });
      }

    } else {
      window.console.log('no file available');
    }
  }

  render() {
    let serverResp;
    this.state.serverFileUploadResp ?
      window.console.log('file uploaded', this.state.serverFileUploadResp) :
      window.console.log('no dice');

    this.state.serverFileUploadResp && this.state.serverFileUploadResp.dataset_id ?
      serverResp = this.state.serverFileUploadResp.dataset_id : null;

    let serverRespContent;
    serverResp ? serverRespContent = (
      <p className="file-upload-form-server-resp">
        File uploaded: {serverResp}
      </p>
    ) : null;
    return (
      <div>
      <Form inverted>
        <Segment className="file-upload-segment">
          <Input
            className="file-upload-form-text-input"
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
        </Segment>
      </Form>
      <br/>
      {serverRespContent ? serverRespContent : ''}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  dataset: state.dataset
});


//export default FileUpload;
export { FileUpload };
export default connect(mapStateToProps, { fetchDatasets, uploadDataset })(FileUpload);
