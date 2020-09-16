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
  Message,
  TextArea,
  Container,
  Menu
} from 'semantic-ui-react';
import Dropzone from 'react-dropzone'
import {SortableContainer, SortableElement} from 'react-sortable-hoc';
import arrayMove from 'array-move';

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

    this.state = this.initState;

    // enter info in text fields
    this.handleDepColDropdown = this.handleDepColDropdown.bind(this);
    this.handleCatFeaturesUserTextOnChange = this.handleCatFeaturesUserTextOnChange.bind(this);
    this.handleCatFeaturesUserTextBlur = this.handleCatFeaturesUserTextBlur.bind(this);
    this.handleCatFeaturesUserTextAccept = this.handleCatFeaturesUserTextAccept.bind(this);
    this.handleCatFeaturesUserTextCancel = this.handleCatFeaturesUserTextCancel.bind(this);
    this.handleOrdinalFeaturesUserTextAccept = this.handleOrdinalFeaturesUserTextAccept.bind(this);
    this.handleOrdinalFeaturesUserTextCancel = this.handleOrdinalFeaturesUserTextCancel.bind(this);
    this.handleOrdinalFeaturesUserTextOnChange = this.handleOrdinalFeaturesUserTextOnChange.bind(this);
    this.handlePredictionType = this.handlePredictionType.bind(this);
    this.getDataTablePreview = this.getDataTablePreview.bind(this);
    this.getDataTableOrdinalRankButtons = this.getDataTableOrdinalRankButtons.bind(this);
    this.generateFileData = this.generateFileData.bind(this);
    this.errorPopupTimeout = this.errorPopupTimeout.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleFeatureTypeDropdown = this.handleFeatureTypeDropdown.bind(this);
    this.initDatasetPreview = this.initDatasetPreview.bind(this);
    this.handleOrdinalSortDragRelease = this.handleOrdinalSortDragRelease.bind(this);
    this.handleOrdinalRankClick = this.handleOrdinalRankClick.bind(this);
    this.handleOrdinalSortAccept = this.handleOrdinalSortAccept.bind(this);
    this.handleOrdinalSortCancel = this.handleOrdinalSortCancel.bind(this);
    this.getUniqueValuesForFeature = this.getUniqueValuesForFeature.bind(this);
    this.getFeatureDefaultType = this.getFeatureDefaultType.bind(this);
    this.ordinalFeaturesClearToDefault = this.ordinalFeaturesClearToDefault.bind(this);
    this.ordinalFeaturesObjectToUserText = this.ordinalFeaturesObjectToUserText.bind(this);
    this.validateFeatureName = this.validateFeatureName.bind(this);
    this.getUserTextFeatureInputs = this.getUserTextFeatureInputs.bind(this);
    this.getFeatureType = this.getFeatureType.bind(this);
    this.getFeatureIndex = this.getFeatureIndex.bind(this);
    this.catFeaturesUserTextValidateAndExpand = this.catFeaturesUserTextValidateAndExpand.bind(this);
    this.catFeaturesClearToNumeric = this.catFeaturesClearToNumeric.bind(this);
    this.getCatFeatures = this.getCatFeatures.bind(this);
    this.setAllFeatureTypes = this.setAllFeatureTypes.bind(this);
    this.parseFeatureToken = this.parseFeatureToken.bind(this);

    //this.cleanedInput = this.cleanedInput.bind(this)

    this.defaultPredictionType = "classification"

    // help text for dataset upload form - dependent column, categorical & ordinal features
    this.depColHelpText = `The column that describes the label or output for each row.
    For example, if analyzing a dataset of patients with different types of diabetes,
    this column may have the values "type1", "type2", or "none".`;

    this.predictionTypeHelp = (<p><i>Classification</i> algorithms are used to model discrete categorical outputs.
      Examples include modeling the color car someone might buy ("red", "green", "blue"...) or a disease state ("type1Diabetes", "type2Diabetes", "none"...)
   <br/><br/><i>Regression</i> algorithms are used to model a continuous valued output.  Examples include modeling the amount of money a house is predicted to sell for.</p>);

    this.catFeatHelpText = (<p>This site is using 'Categorical' to mean a Nominal feature, per custom in the ML community. Categorical features have a discrete number of categories that do not have an intrinsic order.
    Some examples include sex ("male", "female") or eye color ("brown", "green", "blue"...).
    <br/><br/>
    Describe these features using a comma separated list of the field names.  Example: <br/>
    <i>sex, eye_color</i></p>);

    this.ordFeatHelpText = (<p>Ordinal features have a discrete number of categories,
    and the categories have a logical order (rank). Some examples include size ("small",
    "medium", "large"), or rank results ("first", "second", "third").
    <br/><br/>
    You can specify these features and their rank in two ways:<br/>
    1) In the text input box opened by the button to the left, using the format described in the box <br/>
    2) or, in the Dataset Preview table below: use the dropdown boxes to specify ordinal features, then rank them
    using the drag-and-drop list of unique categories.</p>);
  }

  get initState() {
    return {
      selectedFile: null,
      dependentCol: '',
      /** {array} String-array holding the type for each feature, in same index order as features within the data. 
       * For assignment, use the gettors   featureTypeNumeric, featureTypeCategorical,  featureTypeOrdinal; }
      */
      featureType: [],
      /** {string} Text the the text box for user to optionally enter categorical feature specifications. 
       *  Must be kept in sync with the settings featureType state array. */
      catFeaturesUserText: '',
      /** Raw user text input that may contain feature ranges. Save this to show when appropriate. */
      catFeaturesUserTextRaw: '',
      /** Flag to control modal dialog for categorical user text input */
      catFeaturesUserTextModalOpen: false,
      /** {string} Text from the text box for user to optionally enter ordinal feature specifications.
       *  Must be kept in sync with ordinalFeaturesObject */
      ordinalFeaturesUserText: '',
      ordinalFeaturesUserTextModalOpen: false,
      /** {object} Object used as dictionary to track the features designated as ordinal by user via dataset preview UI.
       *  key: feature name from dataPreview
       *  value: string-array holding possibly-ordered values for the feature.
       *  Will be empty object if none defined.
       *  Gets updated with new order as user orders them using the UI in dataset preview.
       *  Using objects as dictionary: https://pietschsoft.com/post/2015/09/05/javascript-basics-how-to-create-a-dictionary-with-keyvalue-pairs
       */
      ordinalFeaturesObject: {},
      /** Holds previous versions of ordinal feature value orderings, so that they can be restored if 
       *  user has defined them, then changed feature type, then goes back to type ordinal.
       */
      ordinalFeaturesObjectPrev: {},
      /** {string} The ordinal feature that is currently being ranked by sortable list, when sortable list is active. */
      ordinalFeatureToRank: undefined,
      /** {array} Array of unique (and possibly sorted) values for the ordinal feature currently being ranked. This gets
       *  modified while user is ranking the values, and then stored to state if user finalizes changes. */
      ordinalFeatureToRankValues: [],
      allFeaturesMenuOpen: false,
      predictionType: this.defaultPredictionType,
      errorResp: undefined
    }
  }

  /**
  * React lifecycle method, when component loads into html dom, 'reset' state
  */
  componentDidMount() {
    this.setState(this.initState); //Not sure why this is called here
  }

  /**
   * Text field for entering dependent column, sets component react state with
   * user input
   * @param {Event} e - DOM Event from user interacting with UI text field
   * @param {Object} props - react props object
   * @returns {void} - no return value
   */
  handleDepColDropdown(e, data) {
    //window.console.log('safe input: ', safeInput);
    //console.log("dep col value: " + data.value);
    this.setState({
      dependentCol: data.value,
      errorResp: undefined
    });
  }

  /**
   * text field/area for entering categorical features
   * user input
   * @param {Event} e - DOM Event from user interacting with UI text field
   * @returns {void} - no return value
   */
  handleCatFeaturesUserTextOnChange(e) {
    //window.console.log('safe input cat: ', safeInput);
    this.setState({
      catFeaturesUserText: e.target.value,
      errorResp: undefined
    });
  }

  handleCatFeaturesUserTextBlur(e) {
    //Save this show we can show it in user text box when it evaluates to the same
    // settings as current categorical feature set. 
    //Handling here in blur also handles case where user doesn't edit text but just hits accept.
    this.setState({catFeaturesUserTextRaw: e.target.value});
  }

  /** 
   * Clear any features that have been specified as type categorical
   *  by setting them to type Numeric - ie does NOT set to automatic default type
   *  because when user specifies via user text, we have to not do automatic type assignment.
   */
  catFeaturesClearToNumeric() {
    this.state.datasetPreview.meta.fields.map( (field) => {
      if( this.getFeatureType(field) === this.featureTypeCategorical ) {
        this.setFeatureType(field, this.featureTypeNumeric);
      }
    })
  }
  
  /** Process the passed string and update Categorical feature settings.
   *  Assumes the input string has been validated.
   *  Will override any settings made via feature-type dropdowns selectors.
   */ 
  catFeaturesUserTextIngest(input) {
    let cats = input.split(',');
    this.catFeaturesClearToNumeric();
    cats.forEach( (feature) => {
      this.setFeatureType(feature.trim(), this.featureTypeCategorical);
    })
  }

  /** Handler for accepting button to accept categorical feature user text element.
   *  Examine and validate the contents. 
   *  If valid, ingest the text and update the categorical features.
   *  If invalid, show an error message.
   * @param {Event} e - DOM Event from user interacting with UI text field
   * @returns {void} - no return value
  */
  handleCatFeaturesUserTextAccept(e) {
    //Validate the whole text
    let result = this.catFeaturesUserTextValidateAndExpand(this.state.catFeaturesUserText);
    if( result.success ) {
      this.catFeaturesUserTextIngest(result.expanded);
      //Close the user text dialog
      this.setState({catFeaturesUserTextModalOpen: false})
    }
    else {
      //On error, the modal window showing the text input will stay open, so user
      // must either cancel or correct the error
      this.setState({
          openErrorModal: true,
          errorModalHeader: "Error in Categorical Feature text entry",
          errorModalContent: result.message,
      })
      console.log("Error validating categorical feature user text: " + result.message);
    }
  }

/** Handle cancel button for user text input for categorical features.
 * Will reset the state string to the current state from getCatFeatures()
 */
handleCatFeaturesUserTextCancel() {
  this.setState({
    catFeaturesUserText: this.getCatFeatures().join(),
    catFeaturesUserTextModalOpen: false,
  })
}

  /** Handler for accepting button to accept oridinal feature user text element.
   *  Examine and validate the contents. 
   *  If valid, ingest the text and update the ordinal features.
   *  If invalid, show an error message.
   * @param {Event} e - DOM Event from user interacting with UI text field
   * @returns {void} - no return value
  */
  handleOrdinalFeaturesUserTextAccept(e) {
    //Validate the whole text
    let result = this.ordinalFeaturesUserTextValidate();
    if( result.success ) {
      this.ordinalFeaturesUserTextIngest();
      this.setState({ordinalFeaturesUserTextModalOpen: false})
    }
    else {
      //On error, the modal window showing the text input will stay open, so user
      // must either cancel or correct the error
      this.setState({
          openErrorModal: true,
          errorModalHeader: "Error in Ordinal Feature text entry",
          errorModalContent: result.message,
      })
      console.log("Error validating ordinal feature user text: " + result.message);
    }
  }

  /** Handle cancel but for ordinal user text modal. 
   *  Resets ordinalFeaturesUserText to state from ordinalFeaturesObject */
  handleOrdinalFeaturesUserTextCancel() {
    this.setState({
      ordinalFeaturesUserText: this.ordinalFeaturesObjectToUserText(),
      ordinalFeaturesUserTextModalOpen: false,
    })
  }

  /** Handle text change in the ordinal features user text input. 
   *  Simply stores the current value for use if user accepts the input. */
  handleOrdinalFeaturesUserTextOnChange(e) {
    this.setState({
      ordinalFeaturesUserText: e.target.value,
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
   * Helper method to consolidate user input to send with file upload form.
   * Does some validation of inputs.
   * @returns {FormData} - FormData object containing user input data
   */
  generateFileData = () => {
    const allowedPredictionTypes = ["classification", "regression"]

    const data = new FormData();
    this.setState({errorResp: undefined});
    let depCol = this.state.dependentCol;
    let ordFeatures = "";
    let predictionType = this.state.predictionType;

    if(this.state.selectedFile && this.state.selectedFile.name) {
      // get raw user input from state

      //Check predication type
      if (!allowedPredictionTypes.includes(predictionType)) {
        return { errorResp: `Invalid prediction type: ${predictionType}`};
      }

      //Check that dependent column is valid
      if (!this.validateFeatureName(this.state.dependentCol)) {
        return { errorResp: "Dependent Column must be defined and valid." };
      }

      // Ordinal features. 
      // If none are specified, pass empty string to the output, per
      //  original behavior
      if(Object.keys(this.state.ordinalFeaturesObject).length !== 0 ) {
        ordFeatures = this.state.ordinalFeaturesObject;
      }

      // Categorical feature assignments.
      // Array of string names of categorical features. Can be empty.
      let catFeaturesAssigned = this.getCatFeatures();

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

      //debug output in dev build
      if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
        console.log("Dev build debug out. metadata: ");
        console.log(metadata);
      }

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
      openErrorModal: true,
      errorModalHeader: "Invalid file type chosen",
      errorModalContent: "Please choose .cvs or .tsv files"
    });
  }

  /**
   * Called when a new dataset has been loaded for preview.
   * Do whatever needs to be done.
   * @returns {void} - no return value
   */
  initDatasetPreview = () => {
    let dataPrev = this.state.datasetPreview;
    //Init oridinal values
    this.ordinalFeaturesClearToDefault();  
    //Init the feature types
    this.setAllFeatureTypes('autoDefault');
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
            openErrorModal: false
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
          openErrorModal: false
        });

      } else {
        console.log('Filetype not csv or tsv:', uploadFile);
        this.setState({
          selectedFile: null,
          datasetPreview: null,
          errorResp: undefined,
          openErrorModal: true
        });
      }
    } else {
      // reset state as fallback
      this.setState({
        selectedFile: null,
        datasetPreview: null,
        errorResp: undefined,
        openErrorModal: false
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
   * For the currently-loaded data, get the unique values for the given feature name.
   * @param {string} feature - feature name
   * @returns {array} - array of unique values for the feature. Order is taken from row order in data.
   */
  getUniqueValuesForFeature(feature) {
    let dataPrev = this.state.datasetPreview;
    //Read the column of data for the feature and make a unique set
    let values = [];
    dataPrev.data.map( (row) => {
      //NOTE - empircally, at the end we get an extra row with a single member set to "".
      //So skip if row[field] is undefined or ""
      if(row[feature] !== "" && row[feature] !== undefined) 
        values.push( row[feature] );
    })
    return [...new Set(values)];
  } 

  /** 
   * Check if the passed feature name exists in the data set
   * @returns {boolean} - true if yes, false otherwise
   */
  validateFeatureName(feature) {
    return this.getFeatureIndex(feature) >= 0;
  }

  /**
   * For the passed feature name, return its type
   * @param {string} feature 
   * @returns {string} feature type (ordinal, categorical, numeric)
   */
  getFeatureType(feature) {
    let i = this.getFeatureIndex(feature);
    if( i === -1 ) {
      console.log("ERROR: unrecognized feature: " + feature);
      return this.featureTypeNumeric;
    }
    return this.state.featureType[i];
  }

  /** For the passed feature name, return the index of the feature within the data (ie its column number).
   *  0-based
   *  Returns -1 for not found
   */
  getFeatureIndex(feature) {
    return this.state.datasetPreview.meta.fields.indexOf(feature.trim());
  }

  /**
   * For the passed feature, get the default type for it based on automatic
   * feature-type assignment algorithm.
   * Simple algorithm: if any value in the feature is type string, consider it 
   *  Categorical. Otherwise its Numeric
   * @param {string} feature 
   * @returns {string} If feature does not exist in data, return Numeric and print error to console
   */
  getFeatureDefaultType(feature) {
    if( !this.validateFeatureName(feature)) {
      console.log("Cannot get default type for unrecognized feature: " + feature);
      return this.featureTypeNumeric;
    }
    let isCategorical = false;
    this.state.datasetPreview.data.forEach( (row) => {
      //NOTE - empircally, at the end we get an extra row with a single member set to "".
      //So skip if row[field] is undefined or ""
      if(row[feature] !== "" && row[feature] !== undefined && isNaN(row[feature])) {
        isCategorical = true;
      }
    })
    return isCategorical ? this.featureTypeCategorical : this.featureTypeNumeric;
  }

  /**
   * Set the feature type for all features in the data
   * @param {string} type - one of [featureTypeNumeric, featureTypeCategorical, featureTypeOrdinal, 'autoDefault'],
   *  where 'autoDefault' will set each feature type based on analysis of each feature's values
   */
  setAllFeatureTypes(type) {
    this.state.datasetPreview.meta.fields.forEach( (feature) => {
      let newType = type === 'autoDefault' ? this.getFeatureDefaultType(feature) : type;
      this.setFeatureType(feature, newType);
    })
  }

  /** 
   * Set the feature-type for the specified feature. Implicitly updates feature-type dropdowns.
   * Updates state vars that hold textural value of feature specifications for categorical and ordinal. 
   * @param {string} feature - feature name to update
   * @param {string} type - the new feature type for the feature (use of of the predefined featureType* accessors)
   * @param {array} ordinalValues - OPTIONAL array of strings, holding unique values for the feature. May be ranked or not.
   *                               If undefined, unique values are pulled from the data, without any particular ranking.
   * @returns {null}
  */
  setFeatureType(feature, type, ordinalValues) {
    if( type !== this.featureTypeNumeric && type !== this.featureTypeCategorical && type !== this.featureTypeOrdinal) {
      console.log("ERROR: unrecognized feature type: " + type);
      return;
    }
    if(!this.validateFeatureName(feature)) {
      console.log("ERROR: setFeatureType: invalid feature type " + feature);
      return;
    }

    //If type hasn't changed, just exit
    let prevType = this.getFeatureType(feature);
    if(prevType === type)
      return;
      
    // Handle ordinal type
    let ords = this.state.ordinalFeaturesObject;
    let ordsPrev = this.state.ordinalFeaturesObjectPrev;
    if( type === this.featureTypeOrdinal ) {
      //If we've passed in a list of values, use that. Otherwise if there's a stored list, use that,
      // otherwise pull list from the data.
      let values = ordinalValues !== undefined ? ordinalValues :
                  (ordsPrev[feature] !== undefined ? ordsPrev[feature] : this.getUniqueValuesForFeature(feature));
      ords[feature] = values;
      ordsPrev[feature] = values;
    }
    else {
      //Clear the ordinal list in case we had one from before.
      //But not the 'Prev' copy, in case user wants to restore.
      delete ords[feature];
    }

    // Store the type in the indexed-array
    let ftd = this.state.featureType;
    ftd[this.getFeatureIndex(feature)] = type;

    //Update state, including user text vars
    this.setState({
      featureType: ftd,
      ordinalFeaturesObject: ords,
      ordinalFeaturesObjectPrev: ordsPrev,
      ordinalFeaturesUserText: this.ordinalFeaturesObjectToUserText(),
      catFeaturesUserText: this.getCatFeatures().join()
    });
  }

  /** Handler for dropdowns show in Dataset Preview for specifying feature type */
  handleFeatureTypeDropdown = (e, data) => {
    //console.log(data);
    let feature = this.state.datasetPreview.meta.fields[data.customindexid];
    this.setFeatureType(feature, data.value);
  }

  /**
   * Handles button click to initiate ranking of an ordinal feature
   */
  handleOrdinalRankClick = (e, data) => {
    //console.log('Rank click')
    //Set this state var to track which field we're currently ranking.
    //Workaround for fact that I can't figure out how to get custom data into
    // the handleOrdinalSortDragRelease handler for sortable list
    this.setState( {
      ordinalFeatureToRank: data.customfeaturetorank,
      ordinalFeatureToRankValues: this.state.ordinalFeaturesObject[data.customfeaturetorank]
    })
  }

  /**
   * Handle event from sortable list, when user releaes an item after dragging it.
   * @param {Object} d 
   */
  handleOrdinalSortDragRelease (d) {
    if (this.state.ordinalFeatureToRank === undefined){
      console.log('Error: ordinal feature to rank is undefined')
      return;
    }
    let values = arrayMove(this.state.ordinalFeatureToRankValues, d.oldIndex, d.newIndex);
    this.setState({ordinalFeatureToRankValues: values});
  }

  /** Update state with the newly-ranked ordinal feature */
  handleOrdinalSortAccept() {
    let ordsAll = this.state.ordinalFeaturesObject;
    let ordsPrevAll = this.state.ordinalFeaturesObjectPrev;
    //For the feature the user has ranked, update the state to hold the newly ranked values
    ordsAll[this.state.ordinalFeatureToRank] = this.state.ordinalFeatureToRankValues;
    ordsPrevAll[this.state.ordinalFeatureToRank] = this.state.ordinalFeatureToRankValues;
    //Store newly ordered values in state, and clear vars used to show values for ranking.
    this.setState({
      ordinalFeaturesObject: ordsAll,
      ordinalFeaturesObjectPrev: ordsPrevAll,
      ordinalFeatureToRank: undefined,
      ordinalFeatureToRankValues: [],
      ordinalFeaturesUserText: this.ordinalFeaturesObjectToUserText()
    });
  }

  /** Handle user canceling the ordinal sort/ranking */
  handleOrdinalSortCancel() {
    this.setState({
      ordinalFeatureToRank: undefined,
      ordinalFeatureToRankValues: []
    })
  }

  /** Clear any features that have been specified as type ordinal, along with any related data,
   * and set them to type auto-determined default type.
   * Does NOT clear the storage of previous ordinal features, so you can still recover previous
   * settings even when changing from user text input.
  */
  ordinalFeaturesClearToDefault() {
    for(var feature in this.state.ordinalFeaturesObject) {
      this.setFeatureType(feature, this.getFeatureDefaultType(feature));
    }
    this.setState({
      ordinalFeaturesObject: {},
    })
  }

  /** From state, convert the lists of unique values for ordinal features into a string with
   * the ordinal feature name and its values, one per line.
   * @returns {string} - multi-line string with one ordinal feature and its unique values, comma-separated, per line
  */
  ordinalFeaturesObjectToUserText() {
    let result = "";
    for(var feature in this.state.ordinalFeaturesObject) {
      let values = this.state.ordinalFeaturesObject[feature];
      result += feature + ',' + values.join() + '\n';
    }
    return result;
  }

  /** Parse a single line of user text for specifying ordinal features. 
   *  Expects a comma-separated string of 2 or more field, with format 
   *    <feature name string>,<unique value 1>,<unique value 2>,...
   *  Leading and trailing whitespace is removed on the whole line and for each comma-separated item
   * Does not do any validation
   * @param {string} line - single line of user text for ordinal feature specification
   * @returns {object} - {feature: <feature name string>, values: <string array of unique values>}
  */
  ordinalFeaturesUserTextParse(line) {
    let feature = line.split(",")[0].trim();
    let values = line.split(",").slice(1);
    //Remove leading and trailing white space from each element
    values = values.map(function (el) {
      return el.trim();
    });
    return {feature: feature, values: values}
  }

  /** Take a SINGLE-line string for a SINGLE feature, of the format used in the UI box for a user to specify an ordinal feature and  
   *  the order of its unique values, and check whether it's valid. The contained feature name must exist and the specifed
   *  unqiue values must all exactly match (regardless of order) the unqiue values for the feature in the data.
   * @param {string} string - the string holding the user's specification 
   * @returns {object} - {success:[true|false], message: <relevant error message on failure>
   */
  ordinalFeatureUserTextLineValidate(string) {
    if( string.length === 0 ) {
      return {success: true, message: ""}
    }
    //Parse the line
    let ordObj = this.ordinalFeaturesUserTextParse(string);
    //Make sure feature name is valid
    if( !this.validateFeatureName(ordObj.feature) ) {
      return {success: false, message: "Feature '" + ordObj.feature + "' was not found in the data."}
    }
    //The remaining items in the string are the unique values
    if( ordObj.values === undefined || ordObj.values.length === 0) {
      return {success: false, message: "Feature '" + ordObj.feature + "' - no values specified"}
    }
    //Make sure the passed list of unique values matches the unique values from data,
    // ignoring order
    let dataValues = this.getUniqueValuesForFeature(ordObj.feature);
    if( dataValues.sort().join() !== ordObj.values.sort().join()) {
      return {success: false, message: "Feature '" + ordObj.feature + "': categories do not match (regardless of order) the unique values in the data: " + dataValues + "."}
    }
    //Otherwise we're good!
    return {success: true, message: ""}
  }

  /** Validate the whole text input for specify ordinal features 
   * Uses the current state var holding the ordinal features user text.
   * @returns {object} - {success: [true|false], message: <error message>}
  */
  ordinalFeaturesUserTextValidate() {
    //Return true if empty
    if(this.state.ordinalFeaturesUserText === ""){
      return {success: true, message: ""}
    }
    let success = true;
    let message = "";
    //Check each line individually
    this.state.ordinalFeaturesUserText.split(/\r?\n/).map((line) => {
      if(line === "")
        return;
      let result = this.ordinalFeatureUserTextLineValidate(line);
      if(result.success === false){
        success = false;
        message += result.message + "\n";
      }
    })
    return {success: success, message: message}
  }

  /** Process the current ordinal feature user text state variable to create
   *  relevant state data variables.
   *  Overrides any existing values in ordinalFeaturesObject
   *  Operates only on state variables.
   *  Does NOT perform any validation on the user text
   * @returns {null} 
   */
  ordinalFeaturesUserTextIngest() {
    this.ordinalFeaturesClearToDefault();
    //Process each line individually
    this.state.ordinalFeaturesUserText.split(/\r?\n/).map((line) => {
      if(line === "")
        return;
      let ordObj = this.ordinalFeaturesUserTextParse(line);
      this.setFeatureType(ordObj.feature, this.featureTypeOrdinal, ordObj.values);
    })    
    //console.log("ingest: ordinals: ");
    //console.log(this.state.ordinalFeaturesObject);
  }

  /** Helper method to generate a row of buttons with Sortable List popups for ordering ordinal features */
  getDataTableOrdinalRankButtons() {
    const result = (
      this.state.datasetPreview.meta.fields.map((field, i) => {
       
        //Helper method for sortable list component
        // https://github.com/clauderic/react-sortable-hoc
        // https://clauderic.github.io/react-sortable-hoc/#/basic-configuration/multiple-lists?_k=7ghtqv
        const SortableItem = SortableElement(({value}) => <li className={"file-upload-sortable-list-item"}>{value}</li>);
        //Helper method for sortable list component
        const SortableList = SortableContainer(({items}) => {
          return (
            <ul className={"file-upload-sortable-list"}>
              {items.map((value, index) => (
                <SortableItem key={`item-${value}`} index={index} value={value} />
              ))}
            </ul>
          );
        });

        //For each field in the data...
        //
        //If we're currently ranking this ordinal feature, show the sortable list
        if(this.state.ordinalFeatureToRank === field)
          return (
            //This puts the sortable list right in the cell. Awkward but it works.
            <Table.Cell key={'rankButton_'+field}>
              <SortableList items={this.state.ordinalFeatureToRankValues} onSortEnd={this.handleOrdinalSortDragRelease} />
              <Button
                content={"Accept"}
                inverted
                color="blue"
                compact
                size="small"
                onClick={this.handleOrdinalSortAccept}
              />
              <Button
                content={"Cancel"}
                inverted
                color="blue"
                compact
                size="small"
                onClick={this.handleOrdinalSortCancel}
              />
              </Table.Cell>
            /* NOTE
               This shows the modal pop-up like expected, and can properly drag the values around in the list,
               But I get a warning that all children in list should have a unique 'key' prop, even though code
               looks like they do. Can't figure out.
               ALSO the styles set in SortableList aren't coming through here.
            <Modal basic style={{ marginTop:'0' }} open={true} onClose={this.handleClose} closeIcon>
              <Modal.Header>Rank the feature's ordinal values</Modal.Header>
              <Modal.Content>
                <SortableList items={this.state.ordinalFeaturesObject[field]} onSortEnd={this.handleOrdinalSortDragRelease} />
              </Modal.Content>
            </Modal>
            */
          )

        //If it's ordinal add a button for user to define rank of values within the feature,
        // but only if we're not ranking another ordinal feature
        if(this.state.ordinalFeaturesObject[field] !== undefined && 
           this.state.ordinalFeatureToRank === undefined) {
              return (
                <Table.Cell key={'rankButton_'+field}>
                  <Button
                    content={"Rank"}
                    inverted
                    color="blue"
                    compact
                    size="small"
                    customfeaturetorank={field}
                    onClick={this.handleOrdinalRankClick}
                  />
                  
                  {/*<Popup 
                    key={'orderPopup_'+field}
                    on="click"
                    position="right center"
                    header="Rank the Feature Values"
                    content={
                      <div className="content">
                      {"Drag-n-drop to change rank"}
                      <SortableList items={this.state.ordinalFeaturesObject[field]} onSortEnd={this.handleOrdinalSortDragRelease} />
                      </div>
                    }
                    trigger={
                      <Button
                        content={"Rank"}
                        inverted
                        color="blue"
                        compact
                        size="small"
                        customfeaturetorank={field}
                        onClick={this.handleOrdinalRankClick}
                      />
                      } 
                  />*/}
                </Table.Cell> 
              )
           }

          //Otherwise just add an empty cell
          return <Table.Cell key={'orderButton_'+field} />;
        }
      )
    )
    return result;
  }

  /**
   * Helper method to create table for dataset preview upon selecting csv file.
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
                          value={this.state.featureType[i]}
                          fluid
                          selection
                          options={featureTypeOptions}
                          onChange={this.handleFeatureTypeDropdown}
                          customindexid={i}                       
                        />
                      </Table.Cell>
                      )
                    }
                  )}
                </Table.Row>
                <Table.Row>
                  {this.getDataTableOrdinalRankButtons()}
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
   * to type 'categorical'
   * @returns {array} - array of strings
   */
  getCatFeatures(){
    let dataPrev = this.state.datasetPreview;
    if(!dataPrev)
      return [];
    return dataPrev.meta.fields.filter( (field,i) => {
      return this.state.featureType[i] == this.featureTypeCategorical;
    })
  }

  /**
   * or a two hyphen-separated features denoting a range such as 'weight-height'.
   * The range is constructed using the indicies of the two feature names within the data fields.
   * @param {string} featureToken - either a solitary feature name, or a hyphen-separated two-feature range.
   * @returns {object} {success:[true|false], rangeExpanded:<array>} - on success, rangeExpanded is an array of all features names
   * within the range specified by input token. Fails if there are not two valid features in the token, or if they're out of index order.
   */
  parseFeatureToken(featureToken) {
    let features = featureToken.trim().split("-");
    //Make sure
    // the range has two features
    // features names are valid
    // the 2nd feature comes after the first in the data
    if( features.length != 2 ||
        !this.validateFeatureName(features[0]) ||
        !this.validateFeatureName(features[1]) ||
        this.getFeatureIndex(features[1]) < this.getFeatureIndex(features[0])
      ){
      return {success: false, rangeExpanded: ""};
    }
    let rangeExpanded = this.state.datasetPreview.meta.fields.slice(this.getFeatureIndex(features[0]), this.getFeatureIndex(features[1])+1 );    
    return {success: true, rangeExpanded: rangeExpanded}
  }

  /** 
   * Validate, and possibly expand, the passed string holding text input from user for specifying categorical-type feature.
   *  Validates that each token in the string is a valid feature name in the data,
   *  or is a valid feature-name range from the data.
   *  Expands any feature-name ranges in the string into a comman-separated string of single feature names
   *  and inserts them into the complete result.
   *  
   * @returns {object} - {success:<boolean>, // True if valid, False otherwise 
   *                      message:<string>   // error message on failure
   *                      expanded:<string>  // String holding fully-expanded list of categorical features
   */
  catFeaturesUserTextValidateAndExpand(userText) {
    if(userText === "") {
      return {success: true, message: "", expanded: ""}
    }
    let success = true;
    let message = "Invalid features or feature ranges ";
    let expanded= [];
    userText.split(",").forEach( (feature) => {
      if( !this.validateFeatureName(feature.trim())) {
        //Check if it's specifying a range
        let range = this.parseFeatureToken(feature);
        if( !range.success ) {
          success = false;
          message += ", " + feature;  
        } else {
          expanded.push(range.rangeExpanded);
        }
      } else {
        expanded.push(feature);
      }
    })
    return {success: success, message: message, expanded: expanded.join()}
  }

  /** Create the UI for users to enter feature types manually */
  getUserTextFeatureInputs() {
    //First determine whether there's a user-supplied string of cat features to show that
    // may contain feature ranges.
    let catFeaturesUserTextToDisplay = this.state.catFeaturesUserText;
    if( this.state.datasetPreview ) {
      let res = this.catFeaturesUserTextValidateAndExpand(this.state.catFeaturesUserTextRaw);
      if( res.success ) {
        // If the current fully expanded string equals the expanded verison of the raw string,
        // show the raw string since it may contain feature ranges.
        if( this.state.catFeaturesUserText.split(",").sort().join() === res.expanded.split(",").sort().join() ){
          catFeaturesUserTextToDisplay = this.state.catFeaturesUserTextRaw;
        }
      }  
    }

    let content = (
      //---- Ordinal Feature Text Input ----
      <div>
      <Form.Input>
      <Modal
        trigger=
          {<Button 
            color='blue'
            size='small'
            inverted
            disabled={this.state.ordinalFeatureToRank !== undefined}
          >
            Specify Ordinal Features
          </Button>}
        open={this.state.ordinalFeaturesUserTextModalOpen}
        onOpen={() => this.setState({ordinalFeaturesUserTextModalOpen: true})}
        onClose={() => this.handleOrdinalFeaturesUserTextCancel()}
        closeOnDimmerClick={false}
        closeOnEscape={true}
        disabled={this.state.ordinalFeatureToRank !== undefined}
      >
        <Modal.Header>Ordinal Feature Input</Modal.Header>
          <Modal.Description width={'95%'}>
            <p> For each ordinal feature, enter one comma-separated line with the following format (this overrides selections in the Dataset Preview): <br/>
              &emsp;[feature name],[1st unique value],[2nd unique value],...</p>
            <p>For example:<br/>
              &emsp;month,jan,feb,mar,apr,may,jun,jul,aug,sep,oct,nov,dec<br/>
              &emsp;day,mon,tue,wed,thu,fri,sat,sun</p>
            <p>To populate this text box with all features and their unique values, close this window and use the button to set all feature types as ordinal. </p>
            <br/>
          </Modal.Description>
          <Form>
          <textarea
             className="file-upload-ordinal-text-area"
             id="ordinal_features_text_area_input"
             label="Ordinal Features"
             onChange={this.handleOrdinalFeaturesUserTextOnChange}
             placeholder={this.ordinalFeaturesObjectToUserText().length === 0 ? "(No Ordinal features have been specified.)" : "" }
             value={this.state.ordinalFeaturesUserText}
          >
          </textarea>
          </Form>
        <Modal.Actions>
          <Button 
            color='red' 
            onClick={this.handleOrdinalFeaturesUserTextCancel}
            size="small"
            inverted
            content="Cancel"
          />
          <Button
            content="Accept"
            icon='checkmark'
            onClick={this.handleOrdinalFeaturesUserTextAccept}
            positive
            inverted
            color="blue"
            size="small"
          />
        </Modal.Actions>
      </Modal>
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
            className="file-upload-just-ordinal-help-icon"
            inverted
            size="large"
            color="orange"
            name="info circle"
          />
        }
      />
      </Form.Input>
      {/*---- Categorical Feature Text Input ----*/}
      <Form.Input>
      <Modal
        trigger={<Button 
          color='blue'
          size='small'
          inverted
          disabled={this.state.ordinalFeatureToRank !== undefined}
        >
          Specify Categorical Features
        </Button>}
        open={this.state.catFeaturesUserTextModalOpen}
        onOpen={() => this.setState({catFeaturesUserTextModalOpen: true})}
        onClose={() => this.handleCatFeaturesUserTextCancel()}
        closeOnDimmerClick={false}
        closeOnEscape={true}
      >
        <Modal.Header>Categorical Feature Input</Modal.Header>
          <Modal.Description width={'95%'}>
            <p>Enter a comma-separated list to specify which features are Categorical.<br/>
                This will override selections in the Dataset Preview. </p>
            <p>For example:<br/>
                &emsp;<i>sex,eye_color,hair_color,disease_state</i>
            </p>
            <p>Ranges - you can specify features using ranges. Each feature name in a range is converted to a column number within the data, 
              and the range is expanded using the column numbers. For example, working from the example above, entering <br/>
              &emsp;<i>sex-disease_state</i><br/>
              would expand to<br/>
              &emsp;<i>sex,eye_color,hair_color,disease_state</i>
            </p>
            <br/>
          </Modal.Description>
          <Form>
          <textarea
              className="file-upload-categorical-text-area"
              id="categorical_features_text_area_input"
              label="Categorical Features"
              onChange={this.handleCatFeaturesUserTextOnChange}
              onBlur={this.handleCatFeaturesUserTextBlur}
              placeholder={this.getCatFeatures().length === 0 ? "(No Categorical features have been specified)" : "" }
              value={catFeaturesUserTextToDisplay}
          >
          </textarea>
          </Form>
        <Modal.Actions>
          <Button 
            color='red' 
            onClick={this.handleCatFeaturesUserTextCancel}
            size="small"
            inverted
            content="Cancel"
          />
          <Button
            content="Accept"
            icon='checkmark'
            onClick={this.handleCatFeaturesUserTextAccept}
            positive
            inverted
            color="blue"
            size="small"
          />
        </Modal.Actions>
      </Modal>
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
            className="file-upload-just-categorical-help-icon"
            inverted
            size="large"
            color="orange"
            name="info circle"
          />
        }
      />
      </Form.Input>
      </div>
    )
    return content;
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
      openErrorModal: false,
      errorModalHeader: "",
      errorModalContent: ""
    });
  }  

  render() {

    //const { dataset } = this.props;

    let errorMsg = this.state.errorResp;
    let errorContent;
    let dataPrevTable = this.getDataTablePreview();
    let predictionSelector = this.getPredictionSelector();
    let userTextFeatureInputs = this.getUserTextFeatureInputs();

    // default to hidden until a file is selected, then display input areas
    let formInputClass = "file-upload-form-hide-inputs";
    // if error message present, display for 4.5 seconds
    if (errorMsg) {
      errorContent = ( <p style={{display: 'block'}}> {errorMsg} </p> );
      window.setTimeout(this.errorPopupTimeout, 10555);
    }
    // check if file with filename has been selected, if so then use css to show form
    this.state.selectedFile && this.state.selectedFile.name ?
      formInputClass = "file-upload-form-show-inputs" : null;

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
              <p>Drag 'n' drop, or click here</p>
            </div>
          </section>
        )}
      </Dropzone>
    );


    //Options for the dependent column selection dropdown
    const depColOptions = [];
    if( this.state.datasetPreview) {
      let features = this.state.datasetPreview.meta.fields;
      features.map( (value, index) => {
        depColOptions.push( { key: index, text: value, value: value })
      })  
    }

    return (
      <div>
        <SceneHeader header="Upload Datasets"/>
        <Form inverted>
          <Segment className="file-upload-segment">
            
            {fileInputElem}

            {/*Modal for error messages*/}
            <Modal style={{ marginTop:'0' }} open={this.state.openErrorModal} onClose={this.handleClose} closeIcon>
              <Modal.Header>{this.state.errorModalHeader}</Modal.Header>
              <Modal.Content>{this.state.errorModalContent}</Modal.Content>
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
              className="file-upload-prediction-title"
              label="Dependent Feature"
            >
              <Form.Dropdown
                selection
                search
                placeholder="Select a feature"
                options={depColOptions}
                onChange={this.handleDepColDropdown}
              />
            </Form.Input>

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
            
            <Form.Field
              className="file-upload-accordion-title"
              label="Features Types"
            >
              <Container text>
                <p> You can specify what type of data each feature/column holds. </p>
                <p> Each feature is assumed to be Numerical unless it is designated as either Ordinal or Categorical (aka Nominal).</p>
                <p> Designate feature types with either the text input boxes below, or by using the dropdown choices in the Dataset Preview.</p>
              </Container>
            </Form.Field>
            {userTextFeatureInputs}
            <Form.Input>
              <Button
                color='blue'
                size='small'
                inverted
                content="Set All Features To Type..."
                onClick={() => this.setState({allFeaturesMenuOpen: !this.state.allFeaturesMenuOpen})}
              />
            </Form.Input>
            <Form.Input>
              <div style={{ display: this.state.allFeaturesMenuOpen ? "block" : "none" }}>
                <Menu vertical open={this.state.allFeaturesMenuOpen}>
                  <Menu.Item content={'Numeric'}
                    onClick={() => {this.setAllFeatureTypes(this.featureTypeNumeric); this.setState({allFeaturesMenuOpen: false}) }}
                  />
                  <Menu.Item content={'Categorical'}
                    onClick={() => {this.setAllFeatureTypes(this.featureTypeCategorical); this.setState({allFeaturesMenuOpen: false}) }}
                  />
                  <Menu.Item content={'Ordinal'}
                    onClick={() => {this.setAllFeatureTypes(this.featureTypeOrdinal); this.setState({allFeaturesMenuOpen: false}) }}
                  />
                  <Menu.Item content={'Default (auto-detect)'}
                    onClick={() => {this.setAllFeatureTypes('autoDefault'); this.setState({allFeaturesMenuOpen: false}) }}
                  />
                </Menu>
              </div>
            </Form.Input>
            <Form.Input label="Upload" >
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
            </Form.Input>
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
