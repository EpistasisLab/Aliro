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
import React, { Component } from "react";
import { connect } from "react-redux";
import { getSortedDatasets } from "data/datasets";
import { fetchDatasets } from "data/datasets/actions";
import { fetchRecommender } from "data/recommender/actions";
import SceneHeader from "../SceneHeader";
// import tooltip from '../testTest';
import FileUpload from "../FileUpload";
import ResponsiveGrid from "../ResponsiveGrid";
import DatasetCard from "./components/DatasetCard";
// import AddNewDataset from '../src/components/AddNewDataset';
import FetchError from "../FetchError";
import { Header, Loader, Popup, Icon, Button } from "semantic-ui-react";
import { AddNewDatasetCard } from "./components/AddNewDatasetCard";

import ChatGPT from "../ChatGPT";

// import styled from 'styled-components';

/**
 * This is the main 'Datasets' page - contains button to add/upload new datasets
 * and 0 or more dataset 'cards' with info about each dataset and UI for interacting
 * with each dataset: toggle AI recommender, view current experiment status, or build
 * new experiment
 */
class Datasets extends Component {
  /**
   * react lifecycle method, when component is done loading, after it is mounted in
   * DOM, use dataset action creator, fetchDatasets, to request retrieval of all
   * datasets
   */
  componentDidMount() {
    this.props.fetchDatasets();
    this.props.fetchRecommender();
  }

  render() {
    const {
      datasets,
      recommender,
      isFetching,
      error,
      fetchDatasets,
      fetchRecommender,
    } = this.props;

    if (isFetching) {
      return (
        <Loader
          active="active"
          inverted="inverted"
          size="large"
          content="Retrieving your datasets..."
        />
      );
    }

    if (error) {
      return (
        <FetchError message={datasets.error} onRetry={() => fetchDatasets()} />
      );
    }

    if (document.getElementById("aiTooglePopupready") == null) {
      // create a new div element id with aiTooglePopupready
      var temp = document.createElement("div");
      document.body.appendChild(temp);
      // make it invisible .setAttribute("id", "aiTooglePopupready")
      temp.id = "aiTooglePopupready";
      temp.style.display = "none";
      // add the newly created element to the body
      // document.body.appendChild(document.getElementById("aiTooglePopupready"));
    }

    return (
      <div>
        {/*<FileUpload />*/}
        <SceneHeader
          header="Datasets"
          btnText="Add new"
          btnIcon="plus"
          linkText="/upload_datasets"
        />{" "}
        {/* <>
      <Popup
        id = "popup"
        trigger={<Button content='Trigger Popup' />}
        // context={"test"}
        content='Hello'
        position='top center'

        open={true}

      />

      </> */}
        {datasets.length > 0 ? (
          <ResponsiveGrid mobile={1} tablet={2} desktop={3} lgscreen={4}>
            {datasets.map((dataset) => (
              <DatasetCard
                key={dataset._id}
                recommender={recommender}
                dataset={dataset}
              />
            ))}

            <AddNewDatasetCard />
          </ResponsiveGrid>
        ) : (
          // <Header inverted size="small" content="You have no datasets uploaded yet." />

          <ResponsiveGrid mobile={1} tablet={2} desktop={3} lgscreen={4}>
            <AddNewDatasetCard />
            <Header
              inverted="inverted"
              size="small"
              content="You have no datasets uploaded yet."
            />
          </ResponsiveGrid>
        )}
        {/* GPT Space Candidate*/}
        <div
          style={{
            overflowY: "auto",
            maxHeight: "350px",
            //  // red color
            // backgroundColor: '#ff0000'
            // black
            backgroundColor: "#1B1C1D",
          }}
          className="table-sticky-header file-upload-table temp-chatgpt-location-cand"
        >
          <p>GPT</p>
        </div>
        {/* <div id="chatgpt-space" class="chartschat chatbaseright">
                        <ChatGPT />
                </div> */}
      </div>
    );
  }
}

const mapDispatchToProps = {
  fetchDatasets,
  fetchRecommender,
};

const mapStateToProps = (state) => ({
  datasets: getSortedDatasets(state),
  recommender: state.recommender.data,
  isFetching: state.datasets.isFetching,
  error: state.datasets.error,
});

export { Datasets };
export default connect(mapStateToProps, mapDispatchToProps)(Datasets);
