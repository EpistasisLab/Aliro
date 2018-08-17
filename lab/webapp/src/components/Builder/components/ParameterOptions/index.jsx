import React from 'react';
import { Grid, Segment, Header, Popup, Icon, Button } from 'semantic-ui-react';
import { formatParam } from 'utils/formatter';

function ParameterOptions({ 
  params,
  currentParams,
  setParamValue
}) {
  const calcCols = (choices) => choices.length > 2 ? 2 : 1;

  const isActive = (param, value) => value === currentParams[param];

  return (
    <Grid.Row>
      {params && Object.entries(params).map(([param, info]) => (
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
              content={info.description}
            />
            <Header 
              as="h2"
              inverted 
              color="blue"
              content={formatParam(info.alias || param)}
              className="param-name"
            />
          </Segment>  
          <Segment inverted attached="bottom">
            <Grid columns={calcCols(info.ui.choices)} className="compressed">
              {info.ui.choices.map(value => (
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

export default ParameterOptions;