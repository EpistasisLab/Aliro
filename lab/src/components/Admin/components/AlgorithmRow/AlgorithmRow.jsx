import React, { Component } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Table, Header, Dropdown, Button } from 'semantic-ui-react';
import { formatAlgorithm } from '../../../../utils/formatter';

class AlgorithmRow extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currentCategory: props.algorithm.get('category')
    };

    this.onChangeCategory = this.onChangeCategory.bind(this);
    this.onUpdateCategory = this.onUpdateCategory.bind(this);
  }

  getCategoryOptions() {
    const categoryOptions = [
      { text: 'Classification', value: 'Classification' },
      { text: 'Regression', value: 'Regression' }
    ];

    return categoryOptions;
  }

  getCanUpdateCategory() {
    return this.state.currentCategory === this.props.algorithm.get('category');
  }

  onChangeCategory(e, data) {
    this.setState({ currentCategory: data.value });
  }

  onUpdateCategory() {
    this.props.updateCategory(this.props.algorithm.get('_id'), this.state.currentCategory);
  };

  render() {
    const { algorithm } = this.props;
    return (
      <Table.Row>
        <Table.Cell width={5}>
          <Header
            inverted 
            size="small"
            content={formatAlgorithm(algorithm.get('name'))}
            subheader={`#${algorithm.get('_id')}`}
          />
        </Table.Cell>
        <Table.Cell width={5}>
          <Button.Group size="small" fluid>
            <Dropdown
              floating
              fluid
              button
              options={this.getCategoryOptions()}
              defaultValue={algorithm.get('category')}
              onChange={this.onChangeCategory}
              className="icon partial"
            />
            <Button 
              inverted 
              color="blue" 
              content="Save"
              onClick={this.onUpdateCategory}
              disabled={this.getCanUpdateCategory()}
              loading={algorithm.get('isUpdatingCategory')}
            />
          </Button.Group>
        </Table.Cell>
        <Table.Cell width={5}>
          
        </Table.Cell>
        <Table.Cell width={1}>
          
        </Table.Cell>
      </Table.Row>
    );
  }
}

AlgorithmRow.propTypes = {
  algorithm: ImmutablePropTypes.map.isRequired
};

export default AlgorithmRow;