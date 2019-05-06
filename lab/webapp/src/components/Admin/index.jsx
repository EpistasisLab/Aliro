import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from 'data/machines/actions';
import ProjectModal from './components/ProjectModal';
import { Header, Segment, Grid, Table, Modal, Popup, Icon } from 'semantic-ui-react';

class Admin extends Component {
  constructor(props) {
    super(props); 
    this.state = { 
      status: {},
      sockets: {},
      activeProject: null
    };
    this.handleOpenProject = this.handleOpenProject.bind(this);
    this.handleCloseProject = this.handleCloseProject.bind(this);
  }

  componentDidMount() {
    this.props.fetchMachines();
  }

  componentDidUpdate(prevProps) {
    if(this.props.machines !== prevProps.machines) {
      this.props.machines.list.forEach(m => {
        //let host = m.address.replace(/^http/, 'ws');
        //let ws = new WebSocket(host); // Attempt to connect
        this.setState({ status: Object.assign({}, this.state.status, { [m._id]: "grey" }) });
        //this.setState({ sockets: Object.assign({}, this.state.sockets, { [m._id]: ws }) });

        /*ws.onopen = (event) =>
          this.setState({ status: Object.assign({}, this.state.status, { [m._id]: "green" }) });

        ws.onclose = (event) =>
          this.setState({ status: Object.assign({}, this.state.status, { [m._id]: "red" }) });*/
      });
    }
  }

  /* componentWillUnmount() {
    const { sockets } = this.state;
    for(var key in sockets) {
      sockets[key].close();
    }
  } */

  handleOpenProject(e, id) {
    e.preventDefault(); // prevent link from firing, it's only for styling
    fetch(`/api/v1/projects/${id}`)
      .then(response => {
        if(response.status >= 400) {
          throw new Error(`${response.status}: ${response.statusText}`);
        }  
        return response.json();
      })
      .then(project => this.setState({ activeProject: project }));
  }

  handleCloseProject() {
    this.setState({ activeProject: null });
  }

  render() {
    const { status, activeProject } = this.state;
    const { machines } = this.props;

    // mock server response with fake Environmental variables 
    const mockEnvVars = [
      {key1: 'val1'},
      {key2: 'val2'},
      {testThing: 'Some_kind_of_value'}
    ]

    return (
      <div className="admin-scene">
        <ProjectModal project={activeProject} handleClose={this.handleCloseProject} />
        <div className="scene-header">
          <Header inverted size="huge" content="Admin" />
        </div>
        <Segment inverted attached="top" className="panel-header">
          <Header as="h3" content="Environmental Variables" style={{ display: 'inline', marginRight: '0.5em' }} />
        </Segment>
        <Segment inverted attached="bottom">
          <Table inverted celled compact unstackable>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Key</Table.HeaderCell>
                <Table.HeaderCell>Value</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {mockEnvVars.map((envObj, index) => {
                  let tempKey = 'envObj_' + index;
                  let envKey = Object.keys(envObj)[0];
                  return (
                    <Table.Row key={tempKey}>
                      <Table.Cell>{envKey}</Table.Cell>
                      <Table.Cell>{envObj[envKey]}</Table.Cell>
                    </Table.Row>
                  )
                }
              )}
            </Table.Body>
          </Table>
        </Segment>
        <p>{`Total machines: ${machines.list.length}`}</p>
        {machines.list.map(m =>
          <div key={m._id}>
            <Segment inverted attached="top" className="panel-header">
              <Header as="h3" inverted content={`Machine: ${m.hostname}`} />
              <span className="muted">{m._id}</span>
              <span className="float-right">
                {/*<span className="muted">Status: </span>
                <Popup
                  size="tiny"
                  position="top center"
                  content="Unknown"
                  trigger={<Icon link inverted name="circle" color={status[m._id]} />}
                />*/}
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
                          <Table.Row key={key} onClick={(e) => this.handleOpenProject(e, key)}>
                            <Table.Cell selectable>
                              <a href="#">
                                <span>{value.name}</span><br />
                                <span className="muted">{key}</span>
                              </a>
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
  machines: state.machines
});

export { Admin };
export default connect(mapStateToProps, actions)(Admin);