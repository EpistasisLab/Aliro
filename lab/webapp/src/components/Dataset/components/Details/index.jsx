import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Header, Segment, Table, Grid, Icon, Loader } from 'semantic-ui-react';
import * as d3 from "d3";

class Details extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    const {fileDetailsClick, formatTime, dataPreview, dataset} = this.props;
    return (
      <div>
        <Segment inverted attached="top" className="panel-header" style={{maxHeight: '53px'}}>
          <Header as="h3" content="File Details" />
          <Icon
            name="info circle"
            onClick={(e) => fileDetailsClick(e)}
            style={{position: 'absolute', top: '11px', left: '95%', cursor: 'pointer'}}
          />
        </Segment>
        <Segment inverted attached="bottom">
          <Grid>
            <Grid.Row columns={2}>
              <Grid.Column>
                <Header
                  as="h4"
                  inverted
                  color="grey"
                  content="Upload Date"
                  subheader={formatTime(dataset.files[0].timestamp)}
                />
              </Grid.Column>
              <Grid.Column>
                <Header
                  as="h4"
                  inverted
                  color="grey"
                  content="Filename"
                  subheader={dataset.files[0].filename}
                />
              </Grid.Column>
            </Grid.Row>
            <Grid.Row columns={1}>
              <Grid.Column>
                <Header
                  as="h4"
                  inverted
                  color="grey"
                  content="Data Preview"
                  style={{ display: 'inline', marginRight: '0.5em' }}
                />
                <span className="muted">(first 100 rows)</span>
                <Segment style={{ height: '500px' }}>
                  {dataPreview ? (
                    <div style={{ overflow: 'scroll', maxHeight: '470px' }}>
                      <Table inverted celled compact unstackable singleLine>
                        <Table.Header>
                          <Table.Row>
                            {dataPreview.meta.fields.map(field =>
                              <Table.HeaderCell key={field}>{field}</Table.HeaderCell>
                            )}
                          </Table.Row>
                        </Table.Header>
                        <Table.Body>
                          {dataPreview.data.slice(0, 100).map((row, i) =>
                            <Table.Row key={i}>
                              {dataPreview.meta.fields.map(field =>
                                <Table.Cell key={`${i}-${field}`}>{row[field]}</Table.Cell>
                              )}
                            </Table.Row>
                          )}
                        </Table.Body>
                      </Table>
                    </div>
                  ) : (
                    <Loader inverted active content="Loading data preview" />
                  )}
                </Segment>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Segment>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({

});

export { Details };
export default connect(mapStateToProps, {})(Details);
