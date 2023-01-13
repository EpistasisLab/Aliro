/* ~This file is part of the Aliro library~

Copyright (C) 2023 Epistasis Lab, Cedars-Sinai Medical Center

Aliro is maintained by:
    - Jun Choi (hyunjun.choi@cshs.org)
    - Miguel Hernandez (miguel.e.hernandez@cshs.org)
    - Nick Matsumoto (nicholas.matsumoto@cshs.org)
    - Jay Moran (jay.moran@cshs.org)
    - and many other generous open source contributors

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.

(Autogenerated header, do not modify)

*/
require('es6-promise').polyfill();
import fetch from 'isomorphic-fetch';
import React, { Component } from 'react';
import InvertedCardWithDropdown from '../../../InvertedCardWithDropdown';
import InvertedCard from '../../../InvertedCard';
import { Popup, Icon, Image, Loader } from 'semantic-ui-react';

class ShapSummaryCurve extends Component {
  constructor(props) {
    super(props);
    this.handle_class_change = this.handle_class_change.bind(this);
    this.state = { image_url: null, class_name: null, class_options: null };
  }

  componentDidMount() {
    const { fileDict, shap_explainer, shap_num_samples } = this.props;

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
    const { fileDict, shap_explainer, shap_num_samples } = this.props;
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
    const { fileDict, shap_explainer, shap_num_samples } = this.props;
    const { image_url, class_name, class_options } = this.state;
    const desc = "SHAP summary feature importance plot (left) shows the effect (i.e., Shap value) of each sample and feature on the outputs of the ML model.  \
    The features are sorted by the sum of absolute SHAP values.";
    const desc2 = "SHAP decision plot (right) shows how the model arrives at its predictions for specific \
    samples. We plot a subset of positive and negative samples and highlight misclassified samples \
    via dotted-dashed lines.";

    const shap_url = "https://github.com/slundberg/shap"
    let headericon = (
      <Popup
        on="click"
        position="top center"
        content={
          <div className="content">
            <p>{desc}</p>
            <p>{desc2}</p>
            { (shap_explainer && shap_num_samples>=0) &&
              <p>The plot below uses the SHAP <strong>{shap_explainer}</strong> with <strong>{shap_num_samples}</strong> randomly selected samples.</p>
            }

            { (shap_explainer && shap_num_samples<0) &&
              <p>The plot below uses the <strong>{shap_explainer}</strong>.</p>
            }

            {shap_url &&
              <a href={shap_url} target="_blank"><strong>Read more here <Icon name="angle double right" /></strong></a>
            }
          </div>
        }
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
          header="SHAP Analysis"
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
          header="SHAP Analysis"
          content={<Image src={image_url} />}
          headericon={headericon}
        />
      );
    }

    return (
        <InvertedCardWithDropdown
          header="SHAP Analysis"
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

export default ShapSummaryCurve;
