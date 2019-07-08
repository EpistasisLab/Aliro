require('es6-promise').polyfill();
import fetch from 'isomorphic-fetch';
import React, { Component } from 'react';
import SceneHeader from '../SceneHeader';
import DatasetModal from './components/DatasetModal/';
import BarChart from './components/BarChart/';
import DatasetMenu from './components/DatasetMenu/';
import { Grid, Segment, Header, Table, Loader, Icon, Menu, Tab } from 'semantic-ui-react';
import { formatDataset, formatTime } from 'utils/formatter';
import Papa from 'papaparse';
import * as d3 from "d3";

class Dataset extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataset: 'fetching',
      dataPreview: null
    };
    this.fileDetailsClick = this.fileDetailsClick.bind(this);
    //this.getCatAndOrdTable = this.getCatAndOrdTable.bind(this);
    this.handleCloseFileDetails = this.handleCloseFileDetails.bind(this);

  }

  componentDidMount() {
    fetch(`/api/datasets/${this.props.params.id}`)
      .then(response => {
        if(response.status >= 400) {
          throw new Error(`${response.status}: ${response.statusText}`);
        }
        return response.json();
      })
      .then(dataset => this.setState({ dataset: dataset[0] }));
  }

  componentDidUpdate(prevProps, prevState) {
    if(this.state.dataset !== prevState.dataset) {
      fetch(`/api/v1/files/${this.state.dataset.files[0]._id}`)
        .then(response => {
          if(response.status >= 400) {
            throw new Error(`${response.status}: ${response.statusText}`);
          }
          return response.text();
        })
        .then(text => {
          this.setState({ dataPreview: Papa.parse(text, { header: true }) });
          //this.createCharts();
        });
    }
  }

  //handleItemClick = (e, { name }) => this.setState({ activeItem: name });
  fileDetailsClick(e) {
    //e.preventDefault();
    //window.console.log('clicked file details');
    const { dataset } = this.state;
    const tempFile = dataset.files[0];
    let testObj = {
      name: tempFile.filename,
      schema: tempFile
    };
    this.setState({
      metadataStuff: testObj
    });
  }

  handleCloseFileDetails() {
    this.setState({ metadataStuff: null });
  }

  render() {
    const { dataset, dataPreview, metadataStuff } = this.state;
    let dataKeys;

    if(dataset === 'fetching') { return null; }
    if(dataPreview) {
      let dataStuff = dataPreview.data;
      // grab dataset columns names from first entry
      dataKeys = Object.keys(dataStuff[0]);
    }

    return (
      <div>
        <DatasetModal
          project={metadataStuff} 
          handleClose={this.handleCloseFileDetails}
        />
        <DatasetMenu
          dataset={dataset}
          dataPreview={dataPreview}
          fileDetailsClick={this.fileDetailsClick}
        />
      </div>
    );
  }
}

export default Dataset;
