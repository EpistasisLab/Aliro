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
import {
  Button,
  Radio,
  Dropdown,
  Input,
  Form,
  Segment,
  Table,
  Popup,
  Checkbox,
  Header,
  Accordion,
  Icon,
  Label,
  Divider,
  Modal,
  Message
} from 'semantic-ui-react';
import Dropzone from 'react-dropzone'

class FileUpload extends Component {
  
  //Some pseudo-constants to avoid typos
  get featureTypeNumeric() { return 'numeric'; }
  get featureTypeCategorical() { return 'categorical'; }
  get featureTypeOrdinal() { return 'ordinal'; }
  
  /**
  * FileUpload reac component - UI form for uploading datasets
  * @constructor
  */
  constructor(props) {
    super(props);

    this.state = {
      selectedFile: null,
      dependentCol: '',
      catFeaturesText: '',
      /** {boolean} True when user has specified the categorical features via the text box */
      catFeaturesStringInUse: false,
      ordinalFeaturesText: '',
      ordinalFeaturesValues: {},
      ordinalIndex: 0,
      activeAccordionIndexes: [],
      openFileTypePop: false,
      /** {array} String-array holding the type for each feature, in same index order */
      featureTypeFromDropdown: []
    };

    // enter info in text fields
    this.handleDepColField = this.handleDepColField.bind(this);
    this.handlecatFeaturesText = this.handlecatFeaturesText.bind(this);
    this.handleOrdinalFeatures = this.handleOrdinalFeatures.bind(this);
    this.handlePredictionType = this.handlePredictionType.bind(this);
    this.getDataTablePreview = this.getDataTablePreview.bind(this);
    this.getAccordionInputs = this.getAccordionInputs.bind(this);
    this.generateFileData = this.generateFileData.bind(this);
    this.errorPopupTimeout = this.errorPopupTimeout.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleFeatureTypeDropdown = this.handleFeatureTypeDropdown.bind(this);
    this.initDatasetPreview = this.initDatasetPreview.bind(this);
    this.getCatFeaturesFromDropdowns = this.getCatFeaturesFromDropdowns.bind(this);
    this.handleOrderButton = this.handleOrderButton.bind(this);
    //this.cleanedInput = this.cleanedInput.bind(this)

    this.defaultPredictionType = "classification"

    // help text for dataset upload form - dependent column, categorical & ordinal features
    this.depColHelpText = `The column that describes the label or output for each row.
    For example, if analyzing a dataset of patients with different types of diabetes,
    this column may have the values "type1", "type2", or "none".`;

    this.predictionTypeHelp = (<p><i>Classification</i> algorithms are used to model discrete categorical outputs.
      Examples include modeling the color car someone might buy ("red", "green", "blue"...) or a disease state ("type1Diabetes", "type2Diabetes", "none"...)
   <br/><br/><i>Regression</i> algorithms are used to model a continuous valued output.  Examples include modeling the amount of money a house is predicted to sell for.</p>);

    this.catFeatHelpText = (<p>Categorical features have a discrete number of categories that do not have an intrinsic order.
    Some examples include sex ("male", "female") or eye color ("brown", "green", "blue"...).
    <br/><br/>
    Describe these features using a comma separated list of the field names.  Example: <br/>
    <i>sex, eye_color</i></p>);

    this.ordFeatHelpText = (<p>Ordinal features have a discrete number of categories,
    and the categories have a logical order. Some examples include size ("small",
    "medium", "large"), or rank results ("first", "second", "third").
    <br/><br/>
    Describe these features using a json map. The map key is the name of the field,
     and the map value is an ordered list of the values the field can take.  Example:<br/>
    <i>{"{\"rank\":[\"first\", \"second\", \"third\"], \"size\":[\"small\", \"medium\", \"large\"]}"}</i></p>);

    //A counter to use in loops
    this.indexCounter = 0;
  }

  /**
  * React lifecycle method, when component loads into html dom, 'reset' state
  */
  componentDidMount() {
    this.setState({
      selectedFile: null,
      dependentCol: '',
      catFeaturesText: '',
      catFeaturesStringInUse: false,
      ordinalFeaturesText: '',
      /** {object} Object used as dictionary to track features designated as ordinal by user via dataset preview UI.
       * 
       *  key: feature name from dataPreview
       * 
       *  value: string-array holding possibly-ordered values for the feature.
       * 
       *  Will be empty object if none defined.
       *  Gets updated with new order as user orders them using the UI in dataset preview.
       *  Using objects as dictionary: https://pietschsoft.com/post/2015/09/05/javascript-basics-how-to-create-a-dictionary-with-keyvalue-pairs
       */
      ordinalFeaturesValues: {},
      ordinalIndex: 0,
      predictionType: this.defaultPredictionType,
      activeAccordionIndexes: [],
      errorResp: undefined,
      featureTypeFromDropdown: []
    });
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
  handlecatFeaturesText(e) {
    //let safeInput = this.purgeUserInput(e.target.value);
    //window.console.log('safe input cat: ', safeInput);
    this.setState({
      catFeaturesText: e.target.value,
      catFeaturesStringInUse: e.target.value != "",
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
      ordinalFeaturesText: e.target.value,
      errorResp: undefined
    });
  }

  handlePredictionType(e, data) {
    this.setState({
      predictionType: data.value,
      errorResp: undefined
    });
  }

  /**
   * Helper method to consolidate user input to send with file upload form
   * @returns {FormData} - FormData object containing user input data
   */
  generateFileData = () => {
    const allowedPredictionTypes = ["classification", "regression"]

    const data = new FormData();
    this.setState({errorResp: undefined});
    let depCol = this.state.dependentCol;
    let ordFeatures = this.state.ordinalFeaturesText;
    let catFeaturesText = this.state.catFeaturesText;
    let predictionType = this.state.predictionType;

    if(this.state.selectedFile && this.state.selectedFile.name) {
      // get raw user input from state

      if (!allowedPredictionTypes.includes(predictionType)) {
        return { errorResp: `Invalid prediction type: ${predictionType}`};
      }

      // try to parse ord features input as JSON if not empty
      if(ordFeatures !== '') {
        try {
          ordFeatures = JSON.parse(this.state.ordinalFeaturesText);
        } catch(e) {
          // if expecting oridinal stuff, return error to stop upload process
          return { errorResp: e.toString() };
        }
      }

      // Categorical feature assignments
      // Start with getting assignments from the dropdowns available in the dataset preview.
      // If user has specified categorical features in the text box, we use that instead.
      //
      let catFeaturesAssigned = this.getCatFeaturesFromDropdowns();
      if(catFeaturesText !== "") {
        // remove all whitespace
        catFeaturesText = catFeaturesText.replace(/ /g, '');
        // parse on comma
        catFeaturesText = catFeaturesText.split(',');
        // if input contains empty items - ex: 'one,,two,three'
        // filter out resulting empty item
        catFeaturesAssigned = catFeaturesText.filter(item => {
          return item !== ""
        })
      }

      console.log('catFeaturesAssigned: ' + catFeaturesAssigned);
      // keys specified for server to upload repsective fields,
      // filter
      let metadata =  JSON.stringify({
                'name': this.state.selectedFile.name,
                'username': 'testuser',
                'timestamp': Date.now(),
                'dependent_col' : depCol,
                'prediction_type' : predictionType,
                'categorical_features': catFeaturesAssigned,
                'ordinal_features': ordFeatures
              });

      data.append('_metadata', metadata);

      data.append('_files', this.state.selectedFile);
      // before upload get a preview of what is in dataset file

      //window.console.log('preview of uploaded data: ', dataPrev);
      // after uploading a dataset request new list of datasets to update the page
    } else {
      window.console.log('no file available');
    }

    return data;
  }

  /**
   * Event handler for showing message when unsupported filetype is selected for upload by user.
   * @param {Array} fileObj - array of rejected files (we only expect one, and use just the first)
   * @returns {void} - no return value
   */
  handleRejectedFile = files => {
    console.log('Filetype not csv or tsv:', files[0]);
    this.setState({
      selectedFile: null,
      datasetPreview: null,
      errorResp: undefined,
      openFileTypePopup: true
    });
  }

  /**
   * Called when a new dataset has been loaded for preview.
   * Do whatever needs to be done.
   * @returns {void} - no return value
   */
  initDatasetPreview = () => {
    let dataPrev = this.state.datasetPreview;
    //Init the state-tracking of feature-type dropdowns
    let featureTypes = Array(dataPrev.meta.fields.length).fill(this.featureTypeNumeric);
    this.setState({featureTypeFromDropdown: featureTypes})
    //Init oridinal values
    this.setState({ordinalFeaturesValues: {}})
  }

  /**
   * Event handler for selecting files, takes user file from html file input, stores
   * selected file in component react state, generates file preview and stores that
   * in the state as well. If file is valid does the abovementioned, else error
   * is generated
   * @param {Array} fileObj - array of selected files (we only expect one, and use just the first)
   * @returns {void} - no return value
   */
  handleSelectedFile = files => {

    const fileExtList = ['csv', 'tsv'];
    //Config for csv reader. We load the whole file so we can let user sort the ordinal features
    let papaConfig = {
      header: true,
      complete: (result) => {
        //window.console.log('preview of uploaded data: ', result);
        this.setState({datasetPreview: result});
        this.initDatasetPreview();
      }
    };

    // check for selected file
    if(files && files[0]) {
      // immediately try to get dataset preview on file input html element change
      // need to be mindful of garbage data/files
      //console.log(typeof event.target.files[0]);
      //console.log(event.target.files[0]);
      let uploadFile = files[0]
      let fileExt = uploadFile.name.split('.').pop();

      // check file extensions
      if (fileExtList.includes(fileExt)) {
        // use try/catch block to deal with potential bad file input when trying to
        // generate file/csv preview, use filename to check file extension
        try {
          Papa.parse(uploadFile, papaConfig);
        }
        catch(error) {
          console.error('Error generating preview for selected file:', error);
          this.setState({
            selectedFile: undefined,
            errorResp: JSON.stringify(error),
            datasetPreview: null,
            openFileTypePopup: false
          });
          //Added this return, otherwise it will fall through to state below
          return;
        }

        //NOTE - this code is reached before the papaConfig.complete callback is called,
        // so if file is parsed successfully, the datasetPreview property will be set
        this.setState({
          selectedFile: files[0],
          errorResp: undefined,
          datasetPreview: null,
          openFileTypePopup: false
        });

      } else {
        console.log('Filetype not csv or tsv:', uploadFile);
        this.setState({
          selectedFile: null,
          datasetPreview: null,
          errorResp: undefined,
          openFileTypePopup: true
        });
      }
    } else {
      // reset state as fallback
      this.setState({
        selectedFile: null,
        datasetPreview: null,
        errorResp: undefined,
        openFileTypePopup: false
      });
    }
  }

  /**
   * Starts download process, takes user input, creates a request payload (new html Form)
   * and sends data to server through redux action, uploadDataset, which is a promise.
   * When promise resolves update UI or redirect page depending on success/error.
   * Upon error display error message to user, on success redirect to dataset page
   * @returns {void} - no return value
   */
  handleUpload = (event) => {
    if (this.state.disabled) {
      return;
    }
    this.setState({disabled:true});

    const { uploadDataset } = this.props;

    // only attempt upload if there is a selected file with a filename
    if(this.state.selectedFile && this.state.selectedFile.name) {
      let data = this.generateFileData(); // should be FormData
      // if trying to create FormData results in error, don't attempt upload
      if (data.errorResp) {
        this.setState({
          errorResp: data.errorResp, 
          disabled:false});
      } else {
        // after uploading a dataset request new list of datasets to update the page
        uploadDataset(data).then(stuff => {
          //window.console.log('FileUpload props after download', this.props);
          //let resp = Object.keys(this.props.dataset.fileUploadResp);
          let resp = this.props.dataset.fileUploadResp;
          let errorRespObj = this.props.dataset.fileUploadError;

          // if no error message and successful upload (indicated by presence of dataset_id)
          // 'refresh' page when upload response from server is not an error and
          // redirect to dataset page, when error occurs set component state
          // to display popup containing server/error response
          if (!errorRespObj && resp.dataset_id) {
            this.props.fetchDatasets();
            window.location = '#/datasets';
            this.setState({disabled:false});
          } else {
            this.setState({
               errorResp: errorRespObj.errorResp.error || "Something went wrong",
               disabled:false
              })
          }
        });
      }


    } else {
      window.console.log('no file available');
      this.setState({
        errorResp: 'No file available',
        disabled:false
      });
    }

  }
  /**
   * Accordion click handler which updates active index for different text areas
   * in dataset upload form, use react state to keep track of which indicies are
   * active & also clear any error message
   */
  handleAccordionClick = (e, titleProps) => {
     const { index } = titleProps;
     const { activeAccordionIndexes } = this.state;
     // make copy of array in state
     const newIndex = [...activeAccordionIndexes];
     const currentIndexPosition = activeAccordionIndexes.indexOf(index);

     if (currentIndexPosition > -1) {
       newIndex.splice(currentIndexPosition, 1);
     } else {
       newIndex.push(index);
     }

     this.setState({
       activeAccordionIndexes: newIndex,
       errorResp: undefined
     })

   }

  handleFeatureTypeDropdown = (e, data) => {
    //console.log(data);
    // Store the dropdown value
    let featureTypes = this.state.featureTypeFromDropdown;
    featureTypes[data.customindexid] = data.value;
    this.setState({featureTypeFromDropdown: featureTypes})
    //console.log(this.state.featureTypeFromDropdown);

    //Type ordinal
    //
    let dataPrev = this.state.datasetPreview;
    let field = dataPrev.meta.fields[data.customindexid];
    let ords = this.state.ordinalFeaturesValues;
    if(data.value == this.featureTypeOrdinal) {
      //it's been set as type ordinal, setup its list of values
      let column = [];
      dataPrev.data.map( (row) => {
        column.push( row[field] );
      })
      column = [...new Set(column)];
      ords[field] = column;
    }
    else {
      //Clear the ordinal list in case we had one from before
      delete ords[field];
    }
    this.setState({ordinalFeaturesValues: ords});

    console.log('ords: '); for(var f in ords) { console.log(f + ': ' + ords[f]) }
  }

  /** Handle clicks from button for user to define order of values in an ordinal feature */
  handleOrderButton = (e, data) => {
    console.log('ordnung must sein!');
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
      //Show at most 50 rows
      innerContent = dataPrev.data.slice(0, 50).map((row, i) =>
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

      //Options for the per-feature dropdown in dataset preview
      const featureTypeOptions = [
        { key: 1, text: 'Numeric', value: this.featureTypeNumeric},
        { key: 2, text: 'Categorical', value: this.featureTypeCategorical },
        { key: 3, text: 'Ordinal', value: this.featureTypeOrdinal },
      ]

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
                  {/*'key' is a React property to id elements in a list*/}
                  {dataPrev.meta.fields.map(field =>
                    <Table.HeaderCell key={field}>{field}</Table.HeaderCell>
                  )}
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {/* row of dropdowns for specifying feature type*/}
                <Table.Row>
                  { dataPrev.meta.fields.map((field, i) => {
                    return (
                      <Table.Cell key={'featureType_'+field}>
                        <Dropdown
                          defaultValue={this.featureTypeNumeric}
                          fluid
                          selection
                          options={featureTypeOptions}
                          onChange={this.handleFeatureTypeDropdown}
                          customindexid={i}
                          disabled={this.state.catFeaturesStringInUse}
                        />
                      </Table.Cell>
                      )
                    }
                  )}
                </Table.Row>
                {/* row of buttons for ordering ordinal features */}
                <Table.Row>
                  { dataPrev.meta.fields.map((field, i) => {
                    //If the feature is not type ordinal, just add an empty cell
                    if(this.state.ordinalFeaturesValues[field] === undefined)
                      return <Table.Cell key={'orderButton_'+field} />;
                    return (
                      <Table.Cell key={'orderButton_'+field}>
                        <Popup 
                          key={'orderPopup_'+field}
                          on="click"
                          position="right center"
                          header="Order the Feature Values"
                          content={
                            <div className="content">
                            {"Drag and drop to reorder"}
                            <Button
                              content={"Order Order!"}
                              inverted
                              color="blue"
                              compact
                              size="small"
                              onClick={this.handleOrderButton}
                            />                        
                            </div>
                        }
                        trigger={
                          <Button
                            content={"Order"}
                            inverted
                            color="blue"
                            compact
                            size="small"
                          />
                          } 
                      />
                      </Table.Cell> 
                              )
                    }
                  )}
                </Table.Row>
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


  getPredictionSelector() {
    const predictionOptions = [
      {
        key: "classification",
        text: "classification",
        value: "classification"
      },
      {
        key: "regression",
        text: "regression",
        value: "regression"
      },
    ]


    const predictionSelector = (
      <Segment inverted>
      <Dropdown
        placeholder='Select Prediction Type'
        defaultValue={this.defaultPredictionType}
        options = {predictionOptions}
        onChange = {this.handlePredictionType}
        />
      </Segment>
    )

    return predictionSelector;
  }

  /**
   * Small helper to get an array of features that have been assigned
   * to type 'categorical' using the dropdowns in the Dataset Preview
   * @returns {array} - array of strings
   */
  getCatFeaturesFromDropdowns(){
    let dataPrev = this.state.datasetPreview;
    let featureTypes = this.state.featureTypeFromDropdown;
    if(!dataPrev)
      return [];
    return dataPrev.meta.fields.filter( (field,i) => {
      return featureTypes[i] == this.featureTypeCategorical;
    })
  }

  /**
   * Small helper method to create semantic ui accordion for categorical &
   * ordinal text inputs
   * @returns {html} - html ui input elements
   */
   getAccordionInputs() {
     const { activeAccordionIndexes } = this.state;

     let ordIconClass; // CSS class to position help icon
     // determine which combos of accordions are open and set respective CSS class
     activeAccordionIndexes.includes(1)
       ? ordIconClass = "file-upload-ord-with-cat-help-icon"
       : ordIconClass = "file-upload-ordinal-help-icon";
     activeAccordionIndexes.includes(0)
       ? ordIconClass = "file-upload-just-ordinal-help-icon" : null;
     activeAccordionIndexes.includes(1) && activeAccordionIndexes.includes(0)
       ? ordIconClass = "file-upload-ord-and-cat-help-icon" : null;

     let accordionContent = (
      <Accordion fluid exclusive={false}>
         <Accordion.Title
           className="file-upload-categorical-accord-title"
           active={activeAccordionIndexes.includes(1)}
           index={1}
           onClick={this.handleAccordionClick}
          >
           <Icon name='dropdown' />
           Enter Categorical Features
         </Accordion.Title>
           <Popup
             on="click"
             position="right center"
             header="Categorical Features Help"
             content={
               <div className="content">
                {this.catFeatHelpText}
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
         <Accordion.Content
           active={activeAccordionIndexes.includes(1)}
          >
           <textarea
             className="file-upload-categorical-text-area"
             id="categorical_features_text_area_input"
             label="Categorical Features"
             placeholder= {
               ("Enter a comma-separated list here to override selections in the Dataset Preview.\n"+
                "For example:\n\n \theight,age,toe_length\n\n" +
               "Current selections from Dataset Preview: \n" + 
               (this.getCatFeaturesFromDropdowns().length > 0 ? this.getCatFeaturesFromDropdowns().join() : "(none)"))
              }
             onChange={this.handlecatFeaturesText}
           />
         </Accordion.Content>
         <Accordion.Title
           className="file-upload-ordinal-accord-title"
           active={activeAccordionIndexes.includes(0)}
           index={0}
           onClick={this.handleAccordionClick}
          >
           <Icon name='dropdown' />
           Enter Ordinal Features
         </Accordion.Title>
           <Popup
             on="click"
             position="right center"
             header="Ordinal Features Help"
             content={
               <div className="content">
                {this.ordFeatHelpText}
               </div>
             }
             trigger={
               <Icon
                 className={ordIconClass}
                 inverted
                 size="large"
                 color="orange"
                 name="info circle"
               />
             }
           />
         <Accordion.Content
            active={activeAccordionIndexes.includes(0)}
          >
           <textarea
             className="file-upload-ordinal-text-area"
             id="ordinal_features_text_area_input"
             label="Ordinal Features"
             placeholder={"{\"ord_feat_1\": [\"SHORT\", \"TALL\"], \"ord_feat_2\": [\"FIRST\", \"SECOND\", \"THIRD\"]}"}
             onChange={this.handleOrdinalFeatures}
           />
         </Accordion.Content>
       </Accordion>
     )
     return accordionContent;
   }

   /**
   *  Simple timeout function, resets error message
   */
  errorPopupTimeout() {
    this.setState({
      errorResp: undefined
    });
  }

  handleClose(){
    this.setState({
      openFileTypePopup: false
    });
  }  

  render() {

    //const { dataset } = this.props;

    let errorMsg = this.state.errorResp;
    let errorContent;
    let dataPrevTable = this.getDataTablePreview();
    let accordionInputs = this.getAccordionInputs();
    let predictionSelector = this.getPredictionSelector();
    // default to hidden until a file is selected, then display input areas
    let formInputClass = "file-upload-form-hide-inputs";
    // if error message present, display for 4.5 seconds
    if (errorMsg) {
      errorContent = ( <p style={{display: 'block'}}> {errorMsg} </p> );
      window.setTimeout(this.errorPopupTimeout, 4555);
    }
    // check if file with filename has been selected, if so then use css to show form
    this.state.selectedFile && this.state.selectedFile.name ?
      formInputClass = "file-upload-form-show-inputs" : null;
    // display file extension Popup
    let openFileTypePop;
    this.state.openFileTypePopup ? openFileTypePop = this.state.openFileTypePopup : openFileTypePop = false;

    // file input
    // https://react-dropzone.js.org/
    // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#accept*
    let fileInputElem = (
      <Dropzone 
          onDropAccepted={this.handleSelectedFile}
          onDropRejected={this.handleRejectedFile}
          accept=".csv,.tsv,text/csv,test/tsv"
          multiple={false}
      >
        {({getRootProps, getInputProps}) => (
          <section>
            <div {...getRootProps({ className: "dropzone" })}>
              <input {...getInputProps()} />
              <p>Upload a csv or tsv file</p>
              <p>Drag 'n' drop it here, or click to select</p>
            </div>
          </section>
        )}
      </Dropzone>
    );


    return (
      <div>
        <SceneHeader header="Upload Datasets"/>
        <Form inverted>
          <Segment className="file-upload-segment">
            {fileInputElem}
            <Modal basic style={{ marginTop:'0' }} open={openFileTypePop} onClose={this.handleClose} closeIcon>
              <Modal.Header>Invalid file type chosen</Modal.Header>
              <Modal.Content>
                {"Please choose .cvs or .tsv files"}
              </Modal.Content>
            </Modal>
            <br/>
            <div
              id="file-upload-form-input-area"
              className={formInputClass}
            >
               <Divider inverted horizontal>
                <Header inverted as='h4'>
                  <Icon name='bar chart' />
                  Feature Specification
                </Header>
              </Divider>

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
                    <p>
                      {this.depColHelpText}
                    </p>
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
                className="file-upload-prediction-title"
                label="Prediction Type"
              >
                {predictionSelector}
              </Form.Input>
              <Popup
                on="click"
                position="right center"
                header="Prediction Type Help"
                content={
                  <div className="content">
                      {this.predictionTypeHelp}
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
              
              <Message info>
                  <p>
                    You can specify what type of data each feature/column holds. 
                    Each feature is assumed to be Numerical unless it is designated as Ordinal or Categorical.
                    Designate a feature type using either of the text input boxes below or by using the dropdown choices available for each column in the Dataset Preview.
                  </p>
                </Message>
              <Form.Input
                className="file-upload-accordion-title"
                label="Categorical & Ordinal Features"
              >
                {accordionInputs}
              </Form.Input>
                <Popup
                  header="Error Submitting Dataset"
                  content={errorContent}
                  open={errorMsg ? true : false}
                  id="file_upload_popup_and_button"
                  position='bottom left'
                  on='click'
                  flowing
                  trigger={
                    <Button
                      inverted
                      color="blue"
                      disabled={this.state.disabled}
                      loading={this.state.disabled}
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
