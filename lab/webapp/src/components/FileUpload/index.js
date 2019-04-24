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
import { Button, Input, Form, Segment, Table, Popup, Checkbox, Header, Accordion, Icon, Label } from 'semantic-ui-react';

class FileUpload extends Component {
  /**
 * FileUpload reac component - UI form for uploading datasets
 * @constructor
 */
  constructor(props) {
    super(props);

    this.state = {
      selectedFile: null,
      dependentCol: '',
      catFeatures: '',
      ordinalFeatures: {},
      ordinalIndex: 0,
      loaded: 0,
      activeAccordionIndex: -1
    };

    // enter info in text fields
    this.handleDepColField = this.handleDepColField.bind(this);
    this.handleCatFeatures = this.handleCatFeatures.bind(this);
    this.handleOrdinalFeatures = this.handleOrdinalFeatures.bind(this);
    this.getDataTablePreview = this.getDataTablePreview.bind(this);
    this.getAccordionInputs = this.getAccordionInputs.bind(this);
    //this.cleanedInput = this.cleanedInput.bind(this)

  }


  /**
   * Strip input of potentially troublesome characters, from here:
   * https://stackoverflow.com/questions/3780696/javascript-string-replace-with-regex-to-strip-off-illegal-characters
   * need to figure out what characters will be allowed
   *
   * @param {string} inputText - user input.
   * @returns {string} stripped user input of bad characters
   */
  purgeUserInput(inputText) {
    let cleanedInput = inputText.replace(/[|&;$%@<>()+]/g, "");
    return cleanedInput;
  }

  /**
   * Text field for entering dependent column, sets component react state with
   * user input
   * @param {Event} e - DOM Event from user interacting with UI text field
   * @param {Object} props - react props object
   * @returns {void} - no return value
   */
  handleDepColField(e) {
    //let safeInput = this.purgeUserInput(props.value);
    //window.console.log('safe input: ', safeInput);
    this.setState({
      dependentCol: e.target.value,
      errorResp: undefined
    });
  }

  /**
   * text field/area for entering categorical features
   * user input
   * @param {Event} e - DOM Event from user interacting with UI text field
   * @returns {void} - no return value
   */
  handleCatFeatures(e) {
    //let safeInput = this.purgeUserInput(e.target.value);
    //window.console.log('safe input cat: ', safeInput);
    this.setState({
      catFeatures: e.target.value,
      errorResp: undefined
    });
  }

  /**
   * text field/area for entering ordinal features
   * user input
   * @param {Event} e - DOM Event from user interacting with UI text field
   * @param {Object} props - react props object
   * @returns {void} - no return value
   */
  handleOrdinalFeatures(e) {
    //window.console.log('ord props: ', props);
    //let safeInput = this.purgeUserInput(props.value);
    //window.console.log('safe input ord: ', safeInput);
    this.setState({
      ordinalFeatures: e.target.value,
      errorResp: undefined
    });
  }


  /**
   * Event handler for selecting files, takes user file from html file input, stores
   * selected file in component react state, generates file preview and stores that
   * in the state as well. If file is valid does the abovementioned, else error
   * is generated
   * @param {Event} event - DOM Event from user interacting with UI text field
   * @returns {void} - no return value
   */
  handleSelectedFile = event => {
    let papaConfig = {
      header: true,
      preview: 5,
      complete: (result) => {
        //window.console.log('preview of uploaded data: ', result);
        this.setState({datasetPreview: result});
      }
    };

    // check for selected file
    if(event.target.files && event.target.files[0]) {
      // immediately try to get dataset preview on file input html element change
      // need to be mindful of garbage data/files
      //console.log(typeof event.target.files[0]);
      //console.log(event.target.files[0]);
      let uploadFile = event.target.files[0]

      //Papa.parse(event.target.files[0], papaConfig);
      // use try/catch block to deal with potential bad file input when trying to
      // generate file/csv preview
      try {
        Papa.parse(uploadFile, papaConfig);
      }
      catch(error) {
        console.error('Error generating preview for selected file:', error);
        this.setState({
          selectedFile: undefined,
          loaded: 0,
          errorResp: error
        })
      }

      this.setState({
        selectedFile: event.target.files[0],
        loaded: 0,
        errorResp: undefined
      })
    }
  }

  /**
   * Starts download process, takes user input, creates a request payload (new html Form)
   * and sends data to server through redux action, uploadDataset, which is a promise.
   * When promise resolves update UI or redirect page depending on success/error.
   * Upon error display error message to user, on success redirect to dataset page
   * @returns {void} - no return value
   */
  handleUpload = () => {
    const { uploadDataset } = this.props;
    const data = new FormData();
    this.setState({errorResp: undefined});
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

      // get raw user input
      catFeatures = this.state.catFeatures;
      // remove whitespace from list of categorical features
      typeof catFeatures.replace === 'function' && catFeatures !== ""
        ? catFeatures = catFeatures.replace(/ /g, '') : null;
      // parse list of categorical features on comma - ,
      typeof catFeatures.split === 'function'  && catFeatures !== ""
        ? catFeatures = catFeatures.split(',') : null;

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
        // 'refresh' page when upload response from server is not an error and
        // redirect to dataset page, when error occurs set component state to use
        // as flag to display popup containing server response
        let resp = Object.keys(this.props.dataset.fileUploadResp)[0];
        resp !== 'error' ? this.props.fetchDatasets() : this.setState({errorResp: resp});
        resp !== 'error' ? window.location = '#/datasets' : null;
        //this.props.fetchDatasets();
      });

    } else {
      window.console.log('no file available');
    }

  }

  handleAccordionClick = (e, titleProps) => {
     const { index } = titleProps;
     const { activeAccordionIndex } = this.state;
     const newIndex = activeAccordionIndex === index ? -1 : index;
     //let resp = Object.keys(this.props.dataset.fileUploadResp)[0];
     //resp !== 'error' ? resp = undefined : null;
     this.setState({
       activeAccordionIndex: newIndex,
       errorResp: undefined
     })
   }

  /**
   * Small helper method to create table for dataset preview upon selecting csv file.
   * Copied from Dataset component - relies upon javascript library papaparse to
   * partially read selected file and semantic ui to generate preview content,
   * if no preview available return hidden paragraph, otherwise return table
   * @returns {html} - html to display
   */
  getDataTablePreview() {
    let dataPrev = this.state.datasetPreview;
    let dataPrevTable = ( <p style={{display: 'none'}}> hi </p> );
    let innerContent;

    if(dataPrev && dataPrev.data) {
      innerContent = dataPrev.data.slice(0, 100).map((row, i) =>
        <Table.Row key={i}>
          {dataPrev.meta.fields.map(field => {
              let tempKey = i + field;
              return (
                <Table.Cell key={'dataTablePrev_' + tempKey.toString()}>
                  {row[field]}
                </Table.Cell>
              )
            }
          )}
        </Table.Row>
      );
//<Table.Cell key={`${i}-${field}`}>

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
                    <Table.HeaderCell key={field}>{field}</Table.HeaderCell>
                  )}
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {innerContent}
              </Table.Body>
            </Table>
          </div>
          <br/>
        </div>
      )
    }

    return dataPrevTable;
  }

  /**
   * Small helper method to create semantic ui accordion for categorical &
   * ordinal text inputs
   * @returns {html} - html ui input elements
   */
   getAccordionInputs() {
     const { activeAccordionIndex } = this.state;
     let accordionContent = (
      <Accordion fluid exclusive={false}>
         <Accordion.Title
           className="file-upload-categorical-accord-title"
           active={activeAccordionIndex === 1}
           index={1}
           onClick={this.handleAccordionClick}
          >
           <Icon name='dropdown' />
           Enter Categorical Features
           <Popup
             on="click"
             position="right center"
             header="Categorical Features Help"
             content={
               <div className="content">
                 <p>Categorical Features help description</p>
               </div>
             }
             trigger={
               <Icon
                 className="file-upload-categorical-help-icon"
                 inverted
                 size="large"
                 color="orange"
                 name="info circle"
               />
             }
           />
         </Accordion.Title>
         <Accordion.Content
           active={activeAccordionIndex === 1}
          >
           <textarea
             className="file-upload-categorical-text-area"
             id="categorical_features_text_area_input"
             label="Categorical Features"
             placeholder={"cat_feat_1, cat_feat_2"}
             onChange={this.handleCatFeatures}
           />
         </Accordion.Content>
         <Accordion.Title
           className="file-upload-ordinal-accord-title"
           active={activeAccordionIndex === 0}
           index={0}
           onClick={this.handleAccordionClick}
          >
           <Icon name='dropdown' />
           Enter Ordinal Features
           <Popup
             on="click"
             position="right center"
             header="Ordinal Features Help"
             content={
               <div className="content">
                 <p>Ordinal Features help description</p>
               </div>
             }
             trigger={
               <Icon
                 className="file-upload-ordinal-help-icon"
                 inverted
                 size="large"
                 color="orange"
                 name="info circle"
               />
             }
           />
         </Accordion.Title>
         <Accordion.Content
            active={activeAccordionIndex === 0}
          >
           <textarea
             className="file-upload-ordinal-text-area"
             id="ordinal_features_text_area_input"
             label="Ordinal Features"
             placeholder={"{\"ord_feat_1\": [\"MALE\", \"FEMALE\"], \"ord_feat_2\": [\"FIRST\", \"SECOND\", \"THIRD\"]}"}
             onChange={this.handleOrdinalFeatures}
           />
         </Accordion.Content>
       </Accordion>
     )
     return accordionContent;
   }

  render() {

    const { dataset } = this.props;
    const { activeAccordionIndex } = this.state;
    let respKey;
    let respBody;
    let serverResp;
    let catFeats = this.state.catFeatures;
    let popUpOffset = 0;
    // set error message when
    let errorMsg = this.state.errorResp;
    let ordFeatureSelection = "";
    let catFeatureSelection = "";
    let dataPrevTable = this.getDataTablePreview();
    let accordionInputs = this.getAccordionInputs();
    // default to hidden until a file is selected, then display input areas
    let formInputClass = "file-upload-form-hide-inputs";
    //window.console.log('prev: ', dataPrev);
    activeAccordionIndex !== -1 ? popUpOffset = 75 : null;
    dataset ? serverResp = dataset.fileUploadResp : null;

    if(serverResp) {
      respKey =  Object.keys(serverResp)[0];
      respBody = serverResp[respKey];
    }

    // server message to display in popup (or other UI element)
    serverResp ? serverResp = ( <p style={{display: 'block'}}> {JSON.stringify(respBody)} </p> ) :
                 null;
    // check if file with filename has been selected, if so then use css to show form
    this.state.selectedFile && this.state.selectedFile.name ?
      formInputClass = "file-upload-form-show-inputs" : null;

    return (
      <div>
        <SceneHeader header="Upload Datasets"/>
        <Form inverted>
          <Segment className="file-upload-segment">
            <Input
              className="file-upload-file-input-field"
              type="file"
              label="Select new dataset"
              id="upload_dataset_file_browser_button"
              onChange={this.handleSelectedFile}
            />
            <br/>
            <div
              id="file-upload-form-input-area"
              className={formInputClass}
            >
              <Form.Input
                label="Dependent Column"
                id="dependent_column_text_field_input"
                className="file-upload-dependent-text-field"
                placeholder="class"
                value={this.state.dependentCol ? this.state.dependentCol : ""}
                type="text"
                onChange={this.handleDepColField}
              />
              <Popup
                on="click"
                position="right center"
                header="Dependent Column Help"
                content={
                  <div className="content">
                    <p>Dependent Col help description</p>
                  </div>
                }
                trigger={
                  <Icon
                    className="file-upload-dependent-help-icon"
                    inverted
                    size="large"
                    color="orange"
                    name="info circle"
                  />
                }
              />
              <Form.Input
                className="file-upload-accordion-title"
                label="Categorical & Ordinal Features"
              >
                {accordionInputs}
              </Form.Input>
              <Popup
                header="Error Submitting Dataset"
                content={serverResp}
                open={errorMsg ? true : false}
                id="file_upload_popup_and_button"
                position='right center'
                flowing
                trigger={
                  <Button
                    inverted
                    color="blue"
                    compact
                    size="small"
                    icon="upload"
                    content="Upload Dataset"
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
