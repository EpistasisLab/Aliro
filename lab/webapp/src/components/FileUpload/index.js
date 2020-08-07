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
import {SortableContainer, SortableElement} from 'react-sortable-hoc';
import arrayMove from 'array-move';

class FileUpload extends Component {
  
  //Some pseudo-constants to avoid typos
  get featureTypeNumeric() { return 'numeric'; }
  get featureTypeCategorical() { return 'categorical'; }
  get featureTypeOrdinal() { return 'ordinal'; }
  get featureTypeDefault() { return this.featureTypeNumeric; }
  
  /**
  * FileUpload reac component - UI form for uploading datasets
  * @constructor
  */
  constructor(props) {
    super(props);

    //NOTE - see ComponentDidMount for comments on these state members
    //TODO - make a method to init state and use it here and in ComponentDidMount
    this.state = {
      selectedFile: null,
      dependentCol: '',
      catFeaturesUserText: '',
      catFeaturesUserTextInUse: false,
      ordinalFeaturesUserText: '',
      ordinalFeaturesUserTextInUse: false,
      ordinalFeaturesUserTextInError: false,
      ordinalFeaturesObject: {},
      ordinalFeatureToRank: undefined,
      ordinalFeatureToRankValues: [],
      activeAccordionIndexes: [],
      openFileTypePop: false,
      /** {array} String-array holding the type for each feature, in same index order */
      featureTypeFromDropdown: [],
      
    };

    // enter info in text fields
    this.handleDepColField = this.handleDepColField.bind(this);
    this.handleCatFeaturesUserText = this.handleCatFeaturesUserText.bind(this);
    this.handleOrdinalFeaturesUserTextOnChange = this.handleOrdinalFeaturesUserTextOnChange.bind(this);
    this.handleOrdinalFeaturesUserTextFocusLost = this.handleOrdinalFeaturesUserTextFocusLost.bind(this);
    this.handlePredictionType = this.handlePredictionType.bind(this);
    this.getDataTablePreview = this.getDataTablePreview.bind(this);
    this.getAccordionInputs = this.getAccordionInputs.bind(this);
    this.generateFileData = this.generateFileData.bind(this);
    this.errorPopupTimeout = this.errorPopupTimeout.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleFeatureTypeDropdown = this.handleFeatureTypeDropdown.bind(this);
    this.initDatasetPreview = this.initDatasetPreview.bind(this);
    this.getCatFeaturesFromDropdowns = this.getCatFeaturesFromDropdowns.bind(this);
    this.onOrdinalSortDragRelease = this.onOrdinalSortDragRelease.bind(this);
    this.handleOrdinalRankClick = this.handleOrdinalRankClick.bind(this);
    this.handleOrdinalSortAccept = this.handleOrdinalSortAccept.bind(this);
    this.handleOrdinalSortCancel = this.handleOrdinalSortCancel.bind(this);
    this.getUniqueValuesForFeature = this.getUniqueValuesForFeature.bind(this);
    this.specifyFeatureAsOrdinal = this.specifyFeatureAsOrdinal.bind(this);
    this.clearOrdinalFeatures = this.clearOrdinalFeatures.bind(this);
    this.ordinalFeaturesObjectToUserText = this.ordinalFeaturesObjectToUserText.bind(this);

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
    and the categories have a logical order. Some examples include size ("small",
    "medium", "large"), or rank results ("first", "second", "third").
    <br/><br/>
    You can either specify these features in this text box using the format described in the box,
    or, in the Dataset Preview, use the dropdown boxes to specify ordinal features, then rank them
    using a drag-and-drop list of unique categories.</p>);

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
      catFeaturesUserText: '',
      /** {boolean} True when user has specified the categorical features via the text box */
      catFeaturesUserTextInUse: false,
      /** {string} Text from the text box for user to optionally enter ordinal feature specifications */
      ordinalFeaturesUserText: '',
      /** {boolean} True when user has specified the ordinal features via the text box */
      ordinalFeaturesUserTextInUse: false,
      /** True if the text currently in the user text box for ordinal features is invalid */
      ordinalFeaturesUserTextInError: false,
      /** {object} Object used as dictionary to track the features designated as ordinal by user via dataset preview UI.
       *  key: feature name from dataPreview
       *  value: string-array holding possibly-ordered values for the feature.
       *  Will be empty object if none defined.
       *  Gets updated with new order as user orders them using the UI in dataset preview.
       *  Using objects as dictionary: https://pietschsoft.com/post/2015/09/05/javascript-basics-how-to-create-a-dictionary-with-keyvalue-pairs
       */
      ordinalFeaturesObject: {},
      /** {string} The ordinal feature that is currently being ranked by sortable list, when sortable list is active. */
      ordinalFeatureToRank: undefined,
      /** {array} Array of unique (and possibly sorted) values for the ordinal feature currently being ranked. This gets
       *  modified while user is ranking the values, and then stored to state if user finalizes changes. */
      ordinalFeatureToRankValues: [],
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
  handleCatFeaturesUserText(e) {
    //let safeInput = this.purgeUserInput(e.target.value);
    //window.console.log('safe input cat: ', safeInput);
    this.setState({
      catFeaturesUserText: e.target.value,
      catFeaturesUserTextInUse: e.target.value != "",
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
  handleOrdinalFeaturesUserTextOnChange(e) {
    //window.console.log('ord props: ', props);
    //let safeInput = this.purgeUserInput(props.value);
    //window.console.log('safe input ord: ', safeInput);
    if(e.target.value === "") {
      this.clearOrdinalFeatures();
    }
    this.setState({
      ordinalFeaturesUserText: e.target.value,
      ordinalFeaturesUserTextInUse: e.target.value != "",
      errorResp: undefined
    });
  }

  /** Handler for when the oridinal feature user text element loses focus.
   *  Examine and validate the contents. Will clear existing specifications for
   *  oridinal features and repopulate from text contents if valid.
   *  If invalid, show an error message.
  */
  handleOrdinalFeaturesUserTextFocusLost(e) {
    //Clear any existing ordinal feature specifications. This also handles letting
    // the user text input override anything already input by the tools in the
    // Dataset Preview for specifying ordinal features
    this.clearOrdinalFeatures();  

    //If the text is now empty, just ignore it
    if(!this.state.ordinalFeaturesUserTextInUse) {
      return;
    }

    //Validate the whole text
    let result = this.ordinalFeaturesUserTextValidate();
    if( result.success ) {
      this.setState({
        ordinalFeaturesUserTextInError: false
      })
      this.ordinalFeaturesUserTextIngest();
    }
    else {
      //On error, no features will be type ordinal since we cleared them on entry to this method
      this.setState({
          openErrorModal: true,
          errorModalHeader: "Error in Ordinal Feature text entry",
          errorModalContent: result.message,
          ordinalFeaturesUserTextInError: true
      })
      console.log("Error validating ordinal feature user text: " + result.message);
    }
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
    let ordFeaturesAsJson = ""
    let catFeaturesUserText = this.state.catFeaturesUserText;
    let predictionType = this.state.predictionType;

    if(this.state.selectedFile && this.state.selectedFile.name) {
      // get raw user input from state

      if (!allowedPredictionTypes.includes(predictionType)) {
        return { errorResp: `Invalid prediction type: ${predictionType}`};
      }

      // Ordinal features. 
      // If any are specified, create json text from the object.
      if(Object.keys(this.state.ordinalFeaturesObject).length !== 0 ) {
        try {
          ordFeaturesAsJson = JSON.stringify(this.state.ordinalFeaturesObject);
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
      if(catFeaturesUserText !== "") {
        // remove all whitespace
        catFeaturesUserText = catFeaturesUserText.replace(/ /g, '');
        // parse on comma
        catFeaturesUserText = catFeaturesUserText.split(',');
        // if input contains empty items - ex: 'one,,two,three'
        // filter out resulting empty item
        catFeaturesAssigned = catFeaturesUserText.filter(item => {
          return item !== ""
        })
      }
      //console.log('catFeaturesAssigned: ' + catFeaturesAssigned);

      // keys specified for server to upload repsective fields,
      // filter
      let metadata =  JSON.stringify({
                'name': this.state.selectedFile.name,
                'username': 'testuser',
                'timestamp': Date.now(),
                'dependent_col' : depCol,
                'prediction_type' : predictionType,
                'categorical_features': catFeaturesAssigned,
                'ordinal_features': ordFeaturesAsJson
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
    //Init the state-tracking of feature-type dropdowns
    let featureTypes = Array(dataPrev.meta.fields.length).fill(this.featureTypeDefault);
    this.setState({featureTypeFromDropdown: featureTypes})
    //Init oridinal values
    this.clearOrdinalFeatures();  
  }

  /** Clear any features that have been specified as type ordinal, along with any related data. */
  clearOrdinalFeatures() {
    for(var feature in this.state.ordinalFeaturesObject) {
      this.specifyFeatureAsOrdinal(false, feature);
    }
    this.setState({ordinalFeaturesObject: {}})
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
 
  /** For the currently-loaded data, get the unique values for the given feature name.
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

  /** Specify that a feature should either be type ordinal or not. Optionally supply list of unique values.
   * @param {boolean} isOrdinal - true to add the feature and its values to the list of ordinals, false to remove it.
   *                            It's safe to pass false even if feature is not already in the list.
   * @param {string} feature - name of feature to operate on
   * @param {array} uniqueValues - OPTIONAL array of strings, holding unique values for the feature. May be ranked or not.
   *                               If undefined, unique values are pulled from the data, without any particular ranking.
   * @returns {null}
   */
  specifyFeatureAsOrdinal( isOrdinal, feature, uniqueValues ) {
    let ords = this.state.ordinalFeaturesObject;
    if( isOrdinal ) {
      ords[feature] = uniqueValues === undefined ? this.getUniqueValuesForFeature(feature) : uniqueValues;
    }
    else {
      //Reset the feature type to default
      let i = this.state.datasetPreview.meta.fields.indexOf(feature);
      let ft = this.state.featureTypeFromDropdown;
      ft[i] = this.featureTypeDefault;
      this.setState({featureTypeFromDropdown: ft})
      //Clear the ordinal list in case we had one from before
      delete ords[feature];
    }
    this.setState({ordinalFeaturesObject: ords});
    //console.log('ords: '); for(var f in ords) { console.log(f + ': ' + ords[f]) }
  }

  handleFeatureTypeDropdown = (e, data) => {
    //console.log(data);

    // Store the new feature type
    let featureTypes = this.state.featureTypeFromDropdown;
    featureTypes[data.customindexid] = data.value; //NOTE would be better to have this just be an object and use feature name
    this.setState({featureTypeFromDropdown: featureTypes})
    //console.log(this.state.featureTypeFromDropdown);

    //Type ordinal - special handling
    //
    let dataPrev = this.state.datasetPreview;
    let feature = dataPrev.meta.fields[data.customindexid];
    //If type ordinal, will pull unique values and assign to ordinal-tracking state var. Otherwise it will be cleared for the feature.
    this.specifyFeatureAsOrdinal( data.value === this.featureTypeOrdinal, feature );
  }

  /**
   * Handles button click to initiate ranking of an ordinal feature
   */
  handleOrdinalRankClick = (e, data) => {
    //console.log('Rank click')
    //Set this state var to track which field we're currently ranking.
    //Workaround for fact that I can't figure out how to get custom data into
    // the onOrdinalSortDragRelease handler for sortable list
    this.setState( {
      ordinalFeatureToRank: data.customfeaturetorank,
      ordinalFeatureToRankValues: this.state.ordinalFeaturesObject[data.customfeaturetorank]
    })
  }

  /**
   * Handle event from sortable list, when user releaes an item after dragging it.
   * @param {Object} d 
   */
  onOrdinalSortDragRelease (d) {
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
    //For the feature the user has ranked, update the state to hold the newly ranked values
    ordsAll[this.state.ordinalFeatureToRank] = this.state.ordinalFeatureToRankValues;
    //Store newly ordered values in state, and clear vars used to show values for ranking.
    this.setState({
      ordinalFeaturesObject: ordsAll,
      ordinalFeatureToRank: undefined,
      ordinalFeatureToRankValues: []
    });
  }

  handleOrdinalSortCancel() {
    this.setState({
      ordinalFeatureToRank: undefined,
      ordinalFeatureToRankValues: []
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
      return {success: false, message: "Empty string"}
    }
    //Parse the line
    let ordObj = this.ordinalFeaturesUserTextParse(string);
    //Make sure feature name is valid
    let allFeatures = this.state.datasetPreview.meta.fields;
    if( allFeatures.indexOf(ordObj.feature) < 0 ) {
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
      return {success: false, message: "Feature '" + ordObj.feature + "' - values do not match (regardless of order) the unique values in the data: " + dataValues + "."}
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
   *  Operates only on state variables.
   *  Does NOT perform any validation on the user text
   * @returns {null} 
   */
  ordinalFeaturesUserTextIngest() {
    //Process each line individually
    this.state.ordinalFeaturesUserText.split(/\r?\n/).map((line) => {
      let ordObj = this.ordinalFeaturesUserTextParse(line);
      this.specifyFeatureAsOrdinal(true, ordObj.feature, ordObj.values);
    })    
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
                          value={this.state.featureTypeFromDropdown[i]}
                          fluid
                          selection
                          options={featureTypeOptions}
                          onChange={this.handleFeatureTypeDropdown}
                          customindexid={i}
                          disabled={this.state.catFeaturesUserTextInUse || this.state.ordinalFeaturesUserTextInUse}
                        />
                      </Table.Cell>
                      )
                    }
                  )}
                </Table.Row>

                {/* Row of buttons with Sortable List popups for ordering ordinal features 
                  * https://github.com/clauderic/react-sortable-hoc
                  * https://clauderic.github.io/react-sortable-hoc/#/basic-configuration/multiple-lists?_k=7ghtqv
                  */}
                <Table.Row>
                  
                  {/*TODO - put all this in a separate func and call it here to populate*/}

                  { dataPrev.meta.fields.map((field, i) => {
                    //Helper method for sortable list component
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
                    //If user has entered field information into either of the user text boxes
                    if(this.state.catFeaturesUserTextInUse || this.state.ordinalFeaturesUserTextInUse) {
                      return <Table.Cell key={'orderButton_'+field} />;
                    }
                    //If we're currently ranking this ordinal feature, show the sortable list
                    if(this.state.ordinalFeatureToRank === field)
                      return (
                        //This puts the sortable list right in the cell. Awkward but it works.
                        <Table.Cell key={'rankButton_'+field}>
                          <SortableList items={this.state.ordinalFeatureToRankValues} onSortEnd={this.onOrdinalSortDragRelease} />
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
                            <SortableList items={this.state.ordinalFeaturesObject[field]} onSortEnd={this.onOrdinalSortDragRelease} />
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
                                  <SortableList items={this.state.ordinalFeaturesObject[field]} onSortEnd={this.onOrdinalSortDragRelease} />
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
           Manually Enter Categorical Features
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
               ("Enter a comma-separated list here to specify which features are Categorical and override selections in the Dataset Preview.\n"+
                "For example:\n\n \tsex,eye_color,disease_state\n\n" +
               "Current selections from Dataset Preview: \n" + 
               (this.getCatFeaturesFromDropdowns().length > 0 ? this.getCatFeaturesFromDropdowns().join() : "(none)"))
              }
             onChange={this.handleCatFeaturesUserText}
           />
         </Accordion.Content>
         <Accordion.Title
           className="file-upload-ordinal-accord-title"
           active={activeAccordionIndexes.includes(0)}
           index={0}
           onClick={this.handleAccordionClick}
          >
           <Icon name='dropdown' />
           Manually Enter Ordinal Features
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
             placeholder= {
              ("For each ordinal feature, enter one comma-separated line with the following format (this overrides selections in the Dataset Preview):\n"+
              "\t<feature name>,<1st unique value>,<2nd unique value>,...\n" +
              "For example:\n\tmonth,jan,feb,mar,apr,may,jun,jul,aug,sep,oct,nov,dec\n" +
              "\tday,mon,tue,wed,thu,fri,sat,sun\n" +
              "\nCurrent selections from Dataset Preview: \n" + 
              (this.ordinalFeaturesObjectToUserText().length > 0 ? this.ordinalFeaturesObjectToUserText() : "(none)"))
             }
             onChange={this.handleOrdinalFeaturesUserTextOnChange}
             onBlur={this.handleOrdinalFeaturesUserTextFocusLost}
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
    let accordionInputs = this.getAccordionInputs();
    let predictionSelector = this.getPredictionSelector();
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


    return (
      <div>
        <SceneHeader header="Upload Datasets"/>
        <Form inverted>
          <Segment className="file-upload-segment">
            {fileInputElem}
            <Modal basic style={{ marginTop:'0' }} open={this.state.openErrorModal} onClose={this.handleClose} closeIcon>
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
                    Each feature is assumed to be Numerical unless it is designated as Categorical (aka Nominal), or Ordinal.
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
