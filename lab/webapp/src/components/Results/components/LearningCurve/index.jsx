/* ~This file is part of the Aliro library~

Copyright (C) 2023 Epistasis Lab, 
Center for Artificial Intelligence Research and Education (CAIRE),
Department of Computational Biomedicine (CBM),
Cedars-Sinai Medical Center.

Aliro is maintained by:
    - Hyunjun Choi (hyunjun.choi@cshs.org)
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
import InvertedCard from '../../../InvertedCard';
import { Header, Image, Loader } from 'semantic-ui-react';

class ImportanceScore extends Component {
  constructor(props) {
    super(props);
    this.state = { image_url: null };
  }

  componentDidMount() {
    const { file } = this.props;

    if(file) {
      fetch(`/api/v1/files/${file._id}`)
        .then(response => {
          if(response.status >= 400) {
            throw new Error(`${response.status}: ${response.statusText}`);
          }  
          return response.blob();
        })
        .then(blob => this.setState({ 
          image_url: URL.createObjectURL(blob) 
        }));
    }
  }

  render() {
    const { file } = this.props;
    const { image_url } = this.state;

    if(!file) {
      return (
        <Header inverted size="tiny" content="Learning curve is not available." />
      );
    }

    if(!image_url) {
      return (
        <Loader active inverted inline="centered" content="Retrieving learning curve..." />
      );
    }

    return (
      <InvertedCard
        header="Learning Curve"
        content={<Image src={image_url} />}
      />
    );
  }
}

export default ImportanceScore;
