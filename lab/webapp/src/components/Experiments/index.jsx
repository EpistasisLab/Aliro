/* This file is part of the PennAI library.

Copyright (C) 2017 Epistasis Lab, University of Pennsylvania

PennAI is maintained by:
    - Heather Williams (hwilli@upenn.edu)
    - Weixuan Fu (weixuanf@pennmedicine.upenn.edu)
    - William La Cava (lacava@upenn.edu)
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

*/
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { 
  getVisibleExperiments, 
  getFilters,
  getSort
} from 'data/experiments';
import * as actions from 'data/experiments/actions';
import SceneHeader from '../SceneHeader';
import FetchError from '../FetchError';
import ExperimentFilters from './components/ExperimentFilters';
import ExperimentsTable from './components/ExperimentsTable';
import { Segment, Header, Loader } from 'semantic-ui-react';
import { hashHistory } from 'react-router';

class Experiments extends Component {
  constructor(props) {
    super(props);
    this.updateQuery = this.updateQuery.bind(this);
    this.resetQuery = this.resetQuery.bind(this);
  }

  componentDidMount() {
    this.props.fetchExperiments();
  }

  updateQuery(key, value) {
    const { location } = this.props;
    const nextLocation = Object.assign({}, location);
    if(value === 'all') {
      delete nextLocation.query[key];
    } else {
      Object.assign(nextLocation.query, { [key]: value });
    }
    hashHistory.push(nextLocation);
  }

  resetQuery() {
    const { location } = this.props;
    const nextLocation = Object.assign({}, location);
    Object.keys(nextLocation.query).forEach((key) => {
      delete nextLocation.query[key];
    });
    hashHistory.push(nextLocation);
  }

  render() {
    const { experiments, fetchExperiments, filters, sort } = this.props;
    
    if(experiments.isFetching) {
      return (
        <Loader active inverted size="large" content="Retrieving your experiments..." />
      );
    }

    if(experiments.error) {
      return (
        <FetchError 
          message={experiments.error}
          onRetry={() => fetchExperiments()}
        />
      );
    }

    return (
      <div className="experiments-scene">
        <SceneHeader header="Experiments" />
          <Segment inverted attached="top">
            <ExperimentFilters
              filters={filters}
              displayCount={experiments.list.length}
              updateQuery={this.updateQuery}
              resetQuery={this.resetQuery}
            />
          </Segment>
          <Segment inverted attached="bottom">
            {experiments.list.length > 0 ? (
              <ExperimentsTable 
                experiments={experiments.list}
                filters={filters}
                sort={sort}
                updateQuery={this.updateQuery}
              />
            ) : (
              <Header inverted size="small" content="No results available." />
            )}
        </Segment>
      </div>
    );
  }
}

const mapStateToProps = (state, props) => ({
  experiments: getVisibleExperiments(state, props),
  filters: getFilters(state, props),
  sort: getSort(state, props)
});

export { Experiments };
export default withRouter(connect(mapStateToProps, actions)(Experiments));