import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Header, Segment, Table } from 'semantic-ui-react';

class Metafeatures extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    const {allMetafeatures, dataset} = this.props;
    return (
      <div>
        <Segment inverted attached="top" className="panel-header">
          <Header as="h3" content="Metafeatures" style={{ display: 'inline', marginRight: '0.5em' }} />
          <span className="muted">{`${Object.keys(dataset.metafeatures).length} total`}</span>
        </Segment>
        <Segment inverted attached="bottom">
          <div style={{ overflow: 'scroll', maxHeight: '594px' }}>
            <Table inverted celled compact unstackable>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Field</Table.HeaderCell>
                  <Table.HeaderCell>Value</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {allMetafeatures.map(field =>
                  <Table.Row key={field}>
                    <Table.Cell>{field}</Table.Cell>
                    <Table.Cell>{dataset.metafeatures[field]}</Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table>
          </div>
        </Segment>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({

});

export { Metafeatures };
export default connect(mapStateToProps, {})(Metafeatures);
