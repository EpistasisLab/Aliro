import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
//import { launchExperiment } from '../actions';
import { Grid, Segment, Header, Button, Modal, List, Icon, Table, Image, Progress } from 'semantic-ui-react';

export class Launch extends React.Component {
    constructor() {
        super();
        this.state = { modalOpen: false, loading: true };
    }

    toggleModal() {
        this.setState({ modalOpen: !this.state.modalOpen });

        if(this.state.modalOpen) {
            this.setState({loading: true});
        } else {
            setTimeout(() => {
                this.setState({loading: false}); }, 5000);
        }
    }

    render() {
        const color = 'olive';
        const action = 'Launch';
        const btn = <Button color={color} inverted content={action} onClick={() => this.toggleModal()} />
        return <Grid.Column mobile={16} tablet={8} computer={4} widescreen={4} largeScreen={4}>
            <Segment color={color} inverted>
                <Header as='h1' color={color} inverted content='Launch experiment' subheader='Start your experiment' />
                <Modal id='modal' basic size='small' dimmer="blurring" trigger={btn} open={this.state.modalOpen} onClose={() => this.toggleModal()}>
                    <Modal.Content>
                        <Modal.Description>
                            <Header as="h1" inverted>Experiment Results</Header>
                            {this.state.loading &&
                                <Progress percent={100} active inverted color='blue'>
                                    Getting your results...
                                </Progress>
                            }    
                            {!this.state.loading &&
                            <Table inverted definition size='large'>
                                <Table.Row>
                                  <Table.HeaderCell />
                                </Table.Row>
                                <Table.Body>
                                 <Table.Row>
                                    <Table.Cell>Status</Table.Cell>
                                    <Table.Cell>success</Table.Cell>
                                 </Table.Row>
                                 <Table.Row>
                                     <Table.Cell>Dataset</Table.Cell>
                                     <Table.Cell>Gametes</Table.Cell>
                                 </Table.Row>
                                 <Table.Row>
                                     <Table.Cell>Project</Table.Cell>
                                     <Table.Cell>BernoulliNB</Table.Cell>
                                 </Table.Row>
                                 <Table.Row>
                                     <Table.Cell>Parameters</Table.Cell>
                                     <Table.Cell>
                                         <Table inverted definition fixed size="small">
                                             <Table.Row>
                                                <Table.HeaderCell />
                                            </Table.Row>
                                            <Table.Row>
                                                <Table.Cell>alpha</Table.Cell>
                                                <Table.Cell>100</Table.Cell>
                                             </Table.Row>
                                             <Table.Row>
                                                <Table.Cell>binzarize</Table.Cell>
                                                <Table.Cell>0</Table.Cell>
                                             </Table.Row>
                                             <Table.Row>
                                                <Table.Cell>fit prior</Table.Cell>
                                                <Table.Cell>true</Table.Cell>
                                             </Table.Row>
                                         </Table>   
                                     </Table.Cell>
                                 </Table.Row>
                                  <Table.Row>
                                     <Table.Cell>Scores</Table.Cell>
                                    <Table.Cell>
                                        <Table inverted definition fixed size="small">
                                         <Table.Row>
                                            <Table.HeaderCell />
                                        </Table.Row>
                                        <Table.Row>
                                            <Table.Cell>train</Table.Cell>
                                            <Table.Cell>0.9854014598540146</Table.Cell>
                                         </Table.Row>
                                         <Table.Row>
                                            <Table.Cell>test</Table.Cell>
                                            <Table.Cell>0.9782608695652174</Table.Cell>
                                         </Table.Row>
                                         <Table.Row>
                                            <Table.Cell>accuracy</Table.Cell>
                                            <Table.Cell>0.9782608695652174</Table.Cell>
                                         </Table.Row>
                                         <Table.Row>
                                            <Table.Cell>precision</Table.Cell>
                                            <Table.Cell>0.9727095516569201</Table.Cell>
                                         </Table.Row>
                                         <Table.Row>
                                            <Table.Cell>recall</Table.Cell>
                                            <Table.Cell>0.9727095516569201</Table.Cell>
                                         </Table.Row>
                                          <Table.Row>
                                            <Table.Cell>f1</Table.Cell>
                                            <Table.Cell>0.9727095516569201</Table.Cell>
                                         </Table.Row>
                                          <Table.Row>
                                            <Table.Cell>roc auc</Table.Cell>
                                            <Table.Cell>not supported for multiclass</Table.Cell>
                                         </Table.Row>
                                     </Table>   
                                     </Table.Cell>
                                 </Table.Row>
                                 <Table.Row>
                                     <Table.Cell>Charts</Table.Cell>
                                     <Table.Cell>
                                        <Image src="/images/confusion_matrix.png" />
                                     </Table.Cell>
                                 </Table.Row>
                                 </Table.Body>
                            </Table>
                        }
                        </Modal.Description>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button color='grey' inverted onClick={() => this.toggleModal()}>
                            <Icon name='close' /> Close
                        </Button>
                    </Modal.Actions>
                </Modal>
            </Segment>
        </Grid.Column>;
    }
}

function mapStateToProps(state) {
    return {};
}

function mapDispatchToProps(dispatch) {
    return {
        //launchExperiment: bindActionCreators(launchExperiment, dispatch)
    };
}

export const LaunchContainer = connect(mapStateToProps, mapDispatchToProps)(Launch);
