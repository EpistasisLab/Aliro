//require('es6-promise').polyfill();
//import fs = require('fs');
import fetch from 'isomorphic-fetch';
import { connect } from 'react-redux';
import React, { Component } from 'react';
import { getSortedDatasets } from '../../data/datasets';
import { fetchDatasets } from '../../data/datasets/actions';
import { uploadDataset } from '../../data/datasets/dataset/actions';
import SceneHeader from '../SceneHeader';
import { put } from '../../utils/apiHelper';
import Papa from 'papaparse';
import { Button, Input, Form, Segment, Table, Popup, Checkbox, Header } from 'semantic-ui-react';

class FileUpload extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedFile: null,
      dependentCol: '',
      catFeatures: '',
      ordinalFeatures: {},
      ordinalIndex: 0,
      loaded: 0
    };

    // enter info in text fields
    this.handleDepColField = this.handleDepColField.bind(this);
    this.handleCatFeatures = this.handleCatFeatures.bind(this);
    this.handleOrdinalFeatures = this.handleOrdinalFeatures.bind(this);
    this.getDataTablePreview = this.getDataTablePreview.bind(this);
    //this.cleanedInput = this.cleanedInput.bind(this)

  }

  // strip input of potentially troublesome characters, from here:
  // https://stackoverflow.com/questions/3780696/javascript-string-replace-with-regex-to-strip-off-illegal-characters
  // need to figure out what characters will be allowed
  purgeUserInput(inputText) {
    let cleanedInput = inputText.replace(/[|&;$%@"<>()+,]/g, "");
    return cleanedInput;
  }

  // text field for entering dependent column
  handleDepColField(e, props) {
    let safeInput = this.purgeUserInput(props.value);
    window.console.log('safe input: ', safeInput);
    this.setState({dependentCol: props.value});
  }

  // text field/area for entering categorical features
  handleCatFeatures(e, props) {
    let safeInput = this.purgeUserInput(props.value);
    window.console.log('safe input: ', safeInput);
    this.setState({catFeatures: e.target.value});
  }

  // text field/area for entering ordinal features
  handleOrdinalFeatures(e, props) {
    let safeInput = this.purgeUserInput(props.value);
    window.console.log('safe input: ', safeInput);
    this.setState({ordinalFeatures: e.target.value});
  }



  handleSelectedFile = event => {
    let papaConfig = {
      header: true,
      preview: 5,
      complete: (result) => {
        //window.console.log('preview of uploaded data: ', result);
        this.setState({datasetPreview: result});
      }
    };
    // immediately try to get dataset preview on file input html element change
    // need to be mindful of garbage data/files
    Papa.parse(event.target.files[0], papaConfig);

    this.setState({
      selectedFile: event.target.files[0],
      loaded: 0
    })
  }

  handleUpload = () => {
    const { uploadDataset } = this.props;
    const data = new FormData();

    // only attempt upload if there is a selected file with a filename
    if(this.state.selectedFile && this.state.selectedFile.name) {
      let depCol = this.state.dependentCol;
      let ordFeatures = {};
      let catFeatures = [];

      try {
        ordFeatures = JSON.parse(this.state.ordinalFeatures);
      } catch(e) {
        window.console.log('not JSON')
      }

      catFeatures = this.state.catFeatures;
      typeof catFeatures.split() === 'function' ? catFeatures = catFeatures.split(',') : null;
      let metadata =  JSON.stringify({
                'name': this.state.selectedFile.name,
                'username': 'testuser',
                'timestamp': Date.now(),
                'dependent_col' : depCol,
                'categorical_features': catFeatures,
                'ordinal_features': ordFeatures

              });
      data.append('_metadata', metadata);

      data.append('_files', this.state.selectedFile);
      // before upload get a preview of what is in dataset file

      //window.console.log('preview of uploaded data: ', dataPrev);
      // after uploading a dataset request new list of datasets to update the page
      uploadDataset(data).then(stuff => {
        //window.console.log('FileUpload props after download', this.props);

        //this.setState({ serverFileUploadResp: json });
        // 'refresh' page when upload response from server is not an error
        let resp = Object.keys(this.props.dataset.fileUploadResp)[0];
        resp !== 'error' ? this.props.fetchDatasets() : null;
        //this.props.fetchDatasets();
      });

    } else {
      window.console.log('no file available');
    }
  }

  getDataTablePreview() {
    let dataPrev = this.state.datasetPreview;
    let dataPrevTable = ( <p style={{display: 'none'}}> hi </p> );

    if(dataPrev) {
      dataPrevTable = (
        <div>
          <br/>
          <Header as='h2' inverted color='grey'>
            Dataset preview
          </Header>
          <div style={{ overflowY: 'auto', maxHeight: '350px' }}>
            <Table inverted celled compact unstackable singleLine>
              <Table.Header>
                <Table.Row>
                  {dataPrev.meta.fields.map(field =>
                    <Table.HeaderCell  key={field}>{field}</Table.HeaderCell>
                  )}
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {dataPrev.data.slice(0, 100).map((row, i) =>
                  <Table.Row key={i}>
                    {dataPrev.meta.fields.map(field =>
                      <Table.Cell key={`${i}-${field}`}>{row[field]}</Table.Cell>
                    )}
                  </Table.Row>
                )}
              </Table.Body>
            </Table>
          </div>
          <br/>
        </div>
      )
    }

    return dataPrevTable;
  }

  render() {
    const { dataset } = this.props;

    let serverResp;
    dataset ? serverResp = dataset.fileUploadResp : null;

    let catFeats = this.state.catFeatures;
    let ordFeatureSelection = "";
    let catFeatureSelection = "";
    let dataPrevTable = this.getDataTablePreview();
    // default to hidden until a file is selected, then display input areas
    let formInputClass = "file-upload-form-hide-inputs";
    //window.console.log('prev: ', dataPrev);

    // server message to display in popup (or other UI element)
    serverResp ? serverResp = ( <p style={{display: 'block'}}> {JSON.stringify(serverResp)} </p> ) :
                 null;

    // check if file with filename has been selected, if so then use css to show form
    this.state.selectedFile && this.state.selectedFile.name ?
      formInputClass = "file-upload-form-show-inputs" : null;

    return (
      <div>
      <Form inverted>
        <Segment className="file-upload-segment">
          <Input
            className="file-upload-form-text-input"
            type="file"
            label="Select new dataset"
            onChange={this.handleSelectedFile}
          />
          <br/>
          <div className={formInputClass}>
            <Form.Input
              label="Dependent Column"
              placeholder="class"
              value={this.state.dependentCol ? this.state.dependentCol : ""}
              type="text"
              onChange={this.handleDepColField}
            />
            <Form.Input
              label="Ordinal Features"
            >
              <textarea
                label="Ordinal Features"
                placeholder={"{\"ord_feat_1\": [\"MALE\", \"FEMALE\"], \"ord_feat_2\": [\"FIRST\", \"SECOND\", \"THIRD\"]}"}
                onChange={this.handleOrdinalFeatures}
              />
            </Form.Input>
            <Form.Input
              label="Categorical Features"
            >
              <textarea
                label="Categorical Features"
                placeholder={"cat_feat_1, cat_feat_2"}
                onChange={this.handleCatFeatures}
              />
            </Form.Input>
            <Popup
              header="Error submitting experiment:"
              content={serverResp}
              open={serverResp ? true : false}
              trigger={
                <Button
                  inverted
                  color="blue"
                  compact
                  size="small"
                  icon="upload"
                  content="Upload dataset"
                  onClick={this.handleUpload}
                />
              }
            />
          </div>
        </Segment>
      </Form>
      {dataPrevTable}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  dataset: state.dataset
});

export { FileUpload };
export default connect(mapStateToProps, { fetchDatasets, uploadDataset })(FileUpload);
