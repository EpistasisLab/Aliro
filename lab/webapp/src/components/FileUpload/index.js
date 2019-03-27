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
import Papa from 'papaparse';
import { Button, Input, Form, Segment, Table, Popup, Checkbox } from 'semantic-ui-react';

class FileUpload extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedFile: null,
      dependentCol: '',
      catFeatures: [],
      ordinalFeatures: {},
      ordinalIndex: 0,
      loaded: 0,
      selectCol: '' // keep track of which metadata will be selected from table UI
    };

    // enter info in text fields
    this.handleDepColField = this.handleDepColField.bind(this);
    this.handleCatFeatures = this.handleCatFeatures.bind(this);
    this.handleOrdinalFeatures = this.handleOrdinalFeatures.bind(this);
    // select columns in data preview table
    this.handleDepColSelect = this.handleDepColSelect.bind(this);
    this.handleOrdColSelect = this.handleOrdColSelect.bind(this);
    this.handleCatColSelect = this.handleCatColSelect.bind(this);
    // every table header & cell (gets column name)
    this.onSelectCol = this.onSelectCol.bind(this);
    this.onSelectCell = this.onSelectCell.bind(this);
  }

  // text field for entering dependent column
  handleDepColField(e, props) {
    this.setState({dependentCol: props.value});
  }

  // text field/area for entering categorical features
  handleCatFeatures(e, props) {
    this.setState({catFeatures: e.target.value});
  }

  // text field/area for entering ordinal features
  handleOrdinalFeatures(e, props) {
    this.setState({ordinalFeatures: e.target.value});
  }

  // specify which type of metadata user is selecting from dataset preview table
  handleOrdColSelect(e, props) {
    this.setState({selectCol: 'ordinalFeatures'});
  }
  handleCatColSelect(e, props) {
    this.setState({selectCol: 'catFeatures'});
  }
  handleDepColSelect(e, props) {
    this.setState({selectCol: 'dependentCol'});
  }

  // generic click handler for selecting columns from dataset preview table
  onSelectCol(e, props) {
    window.console.log('onSelectCol props', this.props);
    window.console.log('onSelectCol header val', e.target.innerHTML);
    let datasetField = this.state.selectCol;

    switch (datasetField) {
      case "catFeatures":
        //let catFeats = this.state.catFeatures;
        //catFeats.push(e.target.innerHTML);
        //let dataPrev = this.state.datasetPreview.data;
        let dataPrev;
        let catColPrev = [];

        this.state.datasetPreview ? dataPrev = this.state.datasetPreview.data : null;

        dataPrev ? dataPrev.forEach(row => catColPrev.push(row[e.target.innerHTML])) : null;
        this.setState({
          catFeatures: catColPrev,
          catFeatureCol: e.target.innerHTML
         });
        break;
      case "ordinalFeatures":
        let ordFeats = {
          ...this.state.ordinalFeatures,
          ['ordinal_header']: e.target.innerHTML
        };
        //ordFeats[e.target.innerHTML] = 'test Ordinal feature'
        this.setState({ ordinalFeatures: ordFeats });
        break;
      case "dependentCol":
        this.setState({ dependentCol: e.target.innerHTML, selectCol: '' });
        break;
      default:
        //this.setState({ selectCol: '' });
    }

  }

  // generic click handler for selecting columns from dataset preview table
  onSelectCell(e, props) {
    //window.console.log('onSelectCell props', this.props);
    window.console.log('onSelectCell cell val', e.target.innerHTML);
    let datasetField = this.state.selectCol;

    switch (datasetField) {
      case "catFeatures":

        break;
      case "ordinalFeatures":
        let ordFeats = this.state.ordinalFeatures;
        let ordIndex = this.state.ordinalIndex;
        //ordFeats[e.target.innerHTML] = 'test Ordinal feature';
        ordFeats[ordIndex] = e.target.innerHTML;

        this.setState({
          ordinalFeatures: ordFeats,
          ordinalIndex: ++ordIndex
         });
        break;
      case "dependentCol":

        break;
      default:
        this.setState({ selectCol: '' });
    }

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
    //data.append('_files', this.state.selectedFile, this.state.selectedFile.name);
    //data.append('target_column', { target_column: 'test_target_column_name' });
    window.console.log('uploading file... ');
    // only attempt upload if there is a selected file with a filename
    if(this.state.selectedFile && this.state.selectedFile.name) {
      let depCol = this.state.dependentCol;
      let ordFeatures = {};
      let catFeatures = [];
      if(depCol === '') {
        window.console.log('please enter dependentCol value');
      }
      try {
        ordFeatures = JSON.parse(this.state.ordinalFeatures);
        window.console.log('ordinal features', ordFeatures);
        catFeatures = this.state.catFeatures.split(",");
        window.console.log('cat features', catFeatures);
      } catch(e) {
        window.console.log('not JSON')
      }
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
        window.console.log('FileUpload props after download', this.props);

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

  render() {

    let dataPrev = this.state.datasetPreview;
    let selectCol = this.state.selectCol;
    let catFeats = this.state.catFeatures;
    let ordFeatureSelection = "";
    let catFeatureSelection = "";

    window.console.log('prev: ', dataPrev);
    Object.keys(this.state.ordinalFeatures).forEach(ordFeat => {
      ordFeatureSelection += ordFeat + " : " + this.state.ordinalFeatures[ordFeat] + ",";
    });
    //catFeats && catFeats.join();
    let dataPrevTable = ( <p> hi </p> );
    if(dataPrev) {
      dataPrevTable = (
        <div>
          <br/>
          <div style={{ overflowY: 'auto', maxHeight: '350px' }}>
            <Table inverted celled compact unstackable singleLine>
              <Table.Header>
                <Table.Row>
                  {dataPrev.meta.fields.map(field =>
                    <Table.HeaderCell onClick={this.onSelectCol} key={field}>{field}</Table.HeaderCell>
                  )}
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {dataPrev.data.slice(0, 100).map((row, i) =>
                  <Table.Row key={i}>
                    {dataPrev.meta.fields.map(field =>
                      <Table.Cell onClick={this.onSelectCell} key={`${i}-${field}`}>{row[field]}</Table.Cell>
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
          <Button
            compact
            size="small"
            icon="eject"
            content="click here and then select depedent column"
            onClick={this.handleDepColSelect}
          />
          <Form.Input
            label="Dependent Column"
            placeholder="class"
            value={this.state.dependentCol ? this.state.dependentCol : ""}
            type="text"
            onChange={this.handleDepColField}
          />
          <Button
            compact
            size="small"
            icon="eject"
            content="click here and then select column with ordinal features"
            onClick={this.handleOrdColSelect}
          />
          <textarea
            label="Ordinal Features"
            placeholder={"{\"ord_feat_1\": [\"MALE\", \"FEMALE\"], \"ord_feat_2\": [\"FIRST\", \"SECOND\", \"THIRD\"]}"}
            value={
              Object.keys(this.state.ordinalFeatures).length ?
                ordFeatureSelection : ""
            }
            onChange={this.handleOrdinalFeatures}
          />
          <Button
            compact
            size="small"
            icon="eject"
            content="click here and then select column with categorical features"
            onClick={this.handleCatColSelect}
          />
          <textarea
            label="Categorical Features"
            placeholder={"\"cat_feat_1\", \"cat_feat_2\""}
            value={this.state.catFeatures.length ? this.state.catFeatures.join() : ""}
            onChange={this.handleCatFeatures}
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
      <Popup trigger={dataPrevTable}>
        <Popup.Header>dataset columns</Popup.Header>
        <Popup.Content>
          <p>select corresponding column</p>
        </Popup.Content>
      </Popup>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  dataset: state.dataset
});

export { FileUpload };
export default connect(mapStateToProps, { fetchDatasets, uploadDataset })(FileUpload);
