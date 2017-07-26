import React from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Grid, Segment, Header, Popup, Icon, Button } from 'semantic-ui-react';
import { formatParam } from '../../../../utils/formatter';

function ParameterOptions({ 
  params,
  currentParams,
  setParamValue
}) {
  const calcCols = (choices) => choices.size > 2 ? 2 : 1;

  const isActive = (param, value) => value === currentParams.get(param);

  return (
    <Grid.Row>
      {params && params.entrySeq().map(([param, info]) => (
        <Grid.Column 
          key={param} 
          mobile={16} 
          tablet={8} 
          computer={8} 
          widescreen={8} 
          largeScreen={8}
        >
          <Segment inverted attached="top" className="panel-header">
            <Popup 
              size="large"
              on="click"
              trigger={
                <Icon 
                  inverted
                  size="large"
                  color="blue"
                  name="info circle"
                  className="info-icon float-right"
                />
              }
              content={info.get('description')}
            />
            <Header 
              as="h2"
              inverted 
              color="blue"
              content={formatParam(info.get('alias') || param)}
              className="param-name"
            />
          </Segment>  
          <Segment inverted attached="bottom">
            <Grid columns={calcCols(info.getIn(['ui', 'choices']))} className="compressed">
              {info.getIn(['ui', 'choices']).map(value => (
                <Grid.Column key={value}>
                  <Button
                    inverted 
                    color="blue"
                    fluid
                    content={value.toString()} 
                    active={isActive(param, value)}
                    onClick={() => setParamValue(param, value)} 
                  />
                </Grid.Column>
              ))}
            </Grid> 
          </Segment>
        </Grid.Column>
      ))}
    </Grid.Row>
  );
}

ParameterOptions.propTypes = {
  params: ImmutablePropTypes.map,
  currentParams: ImmutablePropTypes.map.isRequired,
  setParamValue: PropTypes.func.isRequired
};

export default ParameterOptions;