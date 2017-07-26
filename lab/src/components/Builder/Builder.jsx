import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { hashHistory } from 'react-router';
import NotFound from '../NotFound';
import FetchError from '../FetchError';
import AlgorithmOptions from './components/AlgorithmOptions';
import ParameterOptions from './components/ParameterOptions';
import { Grid, Button, Icon, Loader } from 'semantic-ui-react';

function Builder({
  dataset,
  //experiment,
  isFetching,
  errorMessage,
  defaultAlgorithms,
  currentAlgorithm,
  currentParams,
  isSubmitting,
  fetchDataset,
  fetchExperiment,
  submitExperiment,
  setCurrentAlgorithm,
  setParamValue,
  location
}) {
  const onSubmitExperiment = () => {
    submitExperiment(
      currentAlgorithm.get('_id'), 
      currentParams.set('dataset', dataset.get('_id'))
    ).then(() => hashHistory.push('/experiments')); // redirect to experiments page
  };

  const onResetExperiment = () => {
    setCurrentAlgorithm(currentAlgorithm);
  };

  const getRetry = () => {
    if(location.query.dataset) {
      return fetchDataset(location.query.dataset);
    } else if(location.query.experiment) {
      return fetchExperiment(location.query.experiment);
    }
  };

  if(!location.query.dataset && !location.query.experiment) {
    return (
      <NotFound />
    );
  } else if(errorMessage) {
    return (
      <FetchError 
        message={errorMessage}
        onRetry={() => getRetry()}
      />
    );
  } else if(isFetching) {
    return (
      <Loader active inverted size="large">
        Preparing the builder...
      </Loader>
    );
  }

  return (
    <div>
      <Grid stretched>
        <AlgorithmOptions
          algorithms={defaultAlgorithms}
          currentAlgorithm={currentAlgorithm}
          setCurrentAlgorithm={setCurrentAlgorithm}
        />
        <ParameterOptions
          params={currentAlgorithm.get('schema')}
          currentParams={currentParams}
          setParamValue={setParamValue}
        />
      </Grid>
      <div className="builder-btns">
        <Button 
          color="blue"
          size="large"
          content="Launch Experiment"
          icon={isSubmitting ? <Icon loading name="spinner" /> : null}
          disabled={isSubmitting}
          onClick={onSubmitExperiment}
        />
        <Button 
          color="grey"
          size="large"
          disabled={isSubmitting}
          onClick={onResetExperiment}
        >
          Reset
        </Button>
      </div>
    </div>
  );
}

Builder.propTypes = {
  dataset: ImmutablePropTypes.map,
  //experiment: ImmutablePropTypes.map,
  isFetching: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string,
  defaultAlgorithms: ImmutablePropTypes.list,
  currentAlgorithm: ImmutablePropTypes.map.isRequired,
  currentParams: ImmutablePropTypes.map.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  fetchDataset: PropTypes.func.isRequired,
  fetchExperiment: PropTypes.func.isRequired,
  submitExperiment: PropTypes.func.isRequired,
  setCurrentAlgorithm: PropTypes.func.isRequired,
  setParamValue: PropTypes.func.isRequired,
  location: PropTypes.shape({ query: PropTypes.object }).isRequired
};

export default Builder;