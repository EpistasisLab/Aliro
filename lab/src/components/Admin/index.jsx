import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../../data/machines/actions';
import { Header, Segment, Grid, Table, Icon } from 'semantic-ui-react';

class Admin extends Component {
  constructor(props) {
    super(props); 
    this.state = { status: {} };
  }

  componentDidMount() {
    this.props.fetchMachines();
  }

  componentDidUpdate(prevProps) {
    if(this.props.machines !== prevProps.machines) {
      this.props.machines.list.forEach(m => {
        let host = m.address.replace(/^http/, 'ws');
        let ws = new WebSocket(host); // Attempt to connect
        this.setState({ status: Object.assign({}, this.state.status, { [m._id]: "grey" }) });

        ws.onopen = (event) =>
          this.setState({ status: Object.assign({}, this.state.status, { [m._id]: "green" }) });

        ws.onclose = (event) =>
          this.setState({ status: Object.assign({}, this.state.status, { [m._id]: "red" }) });
      });
    }
  }

  render() {
    const { status } = this.state;
    const { machines } = this.props;

    return (
      <div className="admin-scene">
        <div className="scene-header">
          <Header inverted size="huge" content="Admin" />
        </div>
        <p>{`Total machines: ${machines.list.length}`}</p>
        {machines.list.map(m =>
          <div key={m._id}>
            <Segment inverted attached="top" className="panel-header">
              <Header as="h3" inverted content={`Machine: ${m.hostname}`} />
              <span className="muted">{m._id}</span>
              <span className="float-right">
                <span className="muted">Status: </span>
                <Icon inverted name="circle" color={status[m._id]} />
              </span>
            </Segment>
            <Segment inverted attached="bottom">
              <Grid divided="vertically">
                <Grid.Row columns={2}>
                  <Grid.Column>
                    <Header as="h4" inverted content="Specifications" attached="top" />
                    <Table inverted definition attached="bottom">
                      <Table.Body>
                        <Table.Row>  
                          <Table.Cell>Hostname</Table.Cell>
                          <Table.Cell>{m.hostname}</Table.Cell>
                        </Table.Row>
                        <Table.Row>  
                          <Table.Cell>Address</Table.Cell>
                          <Table.Cell>{m.address}</Table.Cell>
                        </Table.Row>
                        <Table.Row>  
                          <Table.Cell>OS</Table.Cell>
                          <Table.Cell>{`${m.os.type} ${m.os.arch} ${m.os.release}`}</Table.Cell>
                        </Table.Row>
                        <Table.Row>  
                          <Table.Cell>CPUs</Table.Cell>
                          <Table.Cell>
                            {!m.cpus.length && 
                              <span>None</span>
                            }
                            {m.cpus.map((cpu, i) => 
                              <span key={i}>{cpu}<br /></span>
                            )}
                          </Table.Cell>
                        </Table.Row>
                        <Table.Row>  
                          <Table.Cell>RAM</Table.Cell>
                          <Table.Cell>{m.mem}</Table.Cell>
                        </Table.Row>
                        <Table.Row>  
                          <Table.Cell>GPUs</Table.Cell>
                          <Table.Cell>
                            {!m.gpus.length && 
                              <span>None</span>
                            }
                            {m.gpus.map((gpu, i) => 
                              <span key={i}>{gpu}<br /></span>
                            )}
                          </Table.Cell>
                        </Table.Row>
                      </Table.Body>
                    </Table>
                  </Grid.Column>
                  <Grid.Column>
                    <Header as="h4" inverted content="Algorithms" attached="top" />
                    <Table inverted attached="bottom">
                      <Table.Body>
                        {Object.entries(m.projects).map(([key, value]) =>
                          <Table.Row key={key}>
                            <Table.Cell>
                              <span>{value.name}</span><br />
                              <span className="muted">{key}</span>
                            </Table.Cell>
                          </Table.Row>
                        )}  
                      </Table.Body>  
                    </Table>    
                  </Grid.Column>
                </Grid.Row>  
              </Grid>
            </Segment>
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  machines: state.get('machines')
});

export { Admin };
export default connect(mapStateToProps, actions)(Admin);