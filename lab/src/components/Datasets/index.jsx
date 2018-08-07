import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getSortedDatasets } from 'data/datasets';
import * as actions from 'data/datasets/actions';
import SceneHeader from '../SceneHeader';
import ResponsiveGrid from '../ResponsiveGrid';
import DatasetCard from './components/DatasetCard';
import FetchError from '../FetchError';
import { Header, Loader } from 'semantic-ui-react';

class Datasets extends Component {
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
        <SceneHeader header="Datasets" btnText="Add new" btnIcon="plus" />
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
