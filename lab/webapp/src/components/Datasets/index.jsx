import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getSortedDatasets } from 'data/datasets';
import * as actions from 'data/datasets/actions';
import SceneHeader from '../SceneHeader';
import FileUpload from '../FileUpload';
import ResponsiveGrid from '../ResponsiveGrid';
import DatasetCard from './components/DatasetCard';
import FetchError from '../FetchError';
import { Header, Loader } from 'semantic-ui-react';


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
  }

  render() {
    const { datasets, isFetching, error, fetchDatasets } = this.props;

    if(isFetching) {
      return (
        <Loader active inverted size="large" content="Retrieving your datasets..." />
      );
    }

    if(error) {
      return (
        <FetchError
          message={datasets.error}
          onRetry={() => fetchDatasets()}
        />
      );
    }

    return (
      <div>
        {/*<FileUpload />*/}
        <SceneHeader header="Datasets" btnText="Add new" btnIcon="plus" linkText='/upload_datasets' />
        {datasets.length > 0 ? (
          <ResponsiveGrid mobile={1} tablet={2} desktop={3} lgscreen={4}>
            {datasets.map(dataset => (
              <DatasetCard
                key={dataset._id}
                dataset={dataset}
              />
            ))}
          </ResponsiveGrid>
        ) : (
          <Header inverted size="small" content="You have no datasets uploaded yet." />
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  datasets: getSortedDatasets(state),
  isFetching: state.datasets.isFetching,
  error: state.datasets.error
});

export { Datasets };
export default connect(mapStateToProps, actions)(Datasets);
