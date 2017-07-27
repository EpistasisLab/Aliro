import React from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Grid, Segment, Header, Form, Dropdown } from 'semantic-ui-react';
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
      <Segment inverted attached='top' className="panel-header">
        <Header
          inverted 
          size="medium"
          content={formatAlgorithm(algorithm.get('name'))}
          subheader={`#${algorithm.get('_id')}`}
        />
      </Segment>
      <Segment inverted attached='bottom'className="panel-body">
        <Form inverted>
          <Form.Group>
            <Form.Field 
              inline
              label="Category:"
              control={Dropdown} 
              value={algorithm.get('category')}
              options={categoryOptions} 
              //onChange={(e, data) => updateQuery('algorithm', data.value)}
              className="filter"
            />
            <Form.Button
              inline
              inverted 
              color="blue"
              size="mini" 
              compact
              content="Update category"
              type="button"
              onClick={() => resetQuery()}
              className="reset"
            />
          </Form.Group>
        </Form>  
      </Segment>
    </Grid.Column>
  );
}

AlgorithmCard.propTypes = {
  algorithm: ImmutablePropTypes.map.isRequired
};

export default AlgorithmCard;