import React from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Grid, Segment, Header, Dropdown, Button } from 'semantic-ui-react';
import { formatAlgorithm } from '../../../../utils/formatter';

function AlgorithmCard({ algorithm }) {
  const categoryOptions = [
    {
      text: 'Classification', 
      value: 'Classification'
    },
    {
      text: 'Regression', 
      value: 'Regression'
    },
    {
      text: 'ML', 
      value: 'ML'
    },
    {
      text: 'AI', 
      value: 'AI'
    }
  ];

  return (
    <Grid.Column>
      <Segment inverted attached="top" className="panel-header">
        <Header
          inverted 
          size="medium"
          content={formatAlgorithm(algorithm.get('name'))}
          subheader={`#${algorithm.get('_id')}`}
        />
      </Segment>
      <Segment inverted attached="bottom" className="panel-body">
        <Header 
          inverted 
          size="small" 
          content="Category" 
          style={{ 'display': 'inline-block', 'margin-right': '1rem' }} 
        />
        <Button 
          inverted 
          color="blue" 
          compact 
          size="mini" 
          content="Update category" 
          style={{ 'vertical-align': 'middle', 'margin-bottom': '0.4rem' }} 
        />
        <Dropdown fluid selection options={categoryOptions} defaultValue={algorithm.get('category')} />
      </Segment>
    </Grid.Column>
  );
}

AlgorithmCard.propTypes = {
  algorithm: ImmutablePropTypes.map.isRequired
};

export default AlgorithmCard;