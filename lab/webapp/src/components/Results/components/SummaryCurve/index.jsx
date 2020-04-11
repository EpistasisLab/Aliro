require('es6-promise').polyfill();
import fetch from 'isomorphic-fetch';
import React, { Component } from 'react';
import InvertedCardWithDropdown from '../../../InvertedCardWithDropdown';
import InvertedCard from '../../../InvertedCard';
import { Popup, Icon, Image, Loader } from 'semantic-ui-react';

class SummaryCurve extends Component {
  constructor(props) {
    super(props);
    this.handle_class_change = this.handle_class_change.bind(this);
    this.state = { image_url: null, class_name: null, class_options: null };
  }

  componentDidMount() {
    const { fileDict } = this.props;

    if(!(Object.keys(fileDict).length === 0)) {
      const class_name = Object.keys(fileDict)[0];
      const file = fileDict[class_name];

      fetch(`/api/v1/files/${file._id}`)
        .then(response => {
          if(response.status >= 400) {
            throw new Error(`${response.status}: ${response.statusText}`);
          }  
          return response.blob();
        })
        .then(blob => this.setState({
          image_url: URL.createObjectURL(blob), 
          class_name: class_name,
        }));

      // Populate dropdown list values
      let class_options = [];
      Object.keys(fileDict).forEach(function(class_name) {
        class_options.push({key: class_name, value: class_name, text: class_name})
      });
      this.setState({class_options});
    }
  }

  handle_class_change(e, { value }) {
    const { fileDict } = this.props;
    const file = fileDict[value];

    fetch(`/api/v1/files/${file._id}`)
        .then(response => {
          if(response.status >= 400) {
            throw new Error(`${response.status}: ${response.statusText}`);
          }  
          return response.blob();
        })
        .then(blob => this.setState({
          image_url: URL.createObjectURL(blob), 
          class_name: value,
        }));
  }

  render() {
    const { fileDict } = this.props;
    const { image_url, class_name, class_options } = this.state;
    const desc = "Summary plot sorts features by their impact. It uses SHAP values to explain the output of ML models.";
    let headericon = (
      <Popup
        position="top center"
        content={desc}
        trigger={
          <Icon
            name="info circle"
            className="info-icon float-right"
          />
        }
      />
    );

    if(Object.keys(fileDict).length === 0) {
      return (
        <InvertedCard
          header="SHAP Summary Plot"
          content="Summary curve not generated for this model."
          headericon={headericon}
        />
      );
    }

    if(!image_url) {
      return (
        <Loader active inverted inline="centered" content="Retrieving Summary curve..." />
      );
    }
    
    if (Object.keys(fileDict).length === 1) {
      return (
        <InvertedCard
          header="SHAP Summary Plot"
          content={<Image src={image_url} />}
          headericon={headericon}
        />
      );
    }

    return (
        <InvertedCardWithDropdown
          header="SHAP Summary Plot"
          placeholder="Select Output Class"
          selectoption={class_name}
          dropdownoptions={class_options}
          onoptionchange={this.handle_class_change}
          content={<Image src={image_url} />}
          headericon={headericon}
        />
    );
  }
}

export default SummaryCurve;
