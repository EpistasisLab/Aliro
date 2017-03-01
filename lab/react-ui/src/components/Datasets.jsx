import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setCurrentDataset } from '../actions';
import { Grid, Button, Segment, Header, Modal, List, Icon } from 'semantic-ui-react';

export class Datasets extends React.Component {
    constructor() {
        super();
        this.state = { modalOpen: false };
    }

    toggleModal() {
        this.setState({ modalOpen: !this.state.modalOpen });
    }

    render() {
        const color = 'orange';
        const action = 'Select dataset';
        const btn = <Button inverted color={color} onClick={() => this.toggleModal()}>{action}</Button>;

        return <Grid.Column mobile={16} tablet={8} computer={4} widescreen={4} largeScreen={4}>
            <Segment inverted color={color}>

                <Header as='h1' inverted color={color}>
                    Dataset
                    <Header.Subheader>Select a dataset for analysis</Header.Subheader>
                </Header>

                <Header inverted>
                    Selected: {this.props.currentDataset.get('name') || 'none'}
                </Header>

                <Modal id='modal' basic size='small' dimmer="blurring" trigger={btn} open={this.state.modalOpen} onClose={() => this.toggleModal()}>
                    <Header>{action}</Header>
                    <Modal.Content>
                        <Modal.Description>
                            <Header inverted>Choose from the following:</Header>
                            <List inverted selection divided size="massive">
                                {this.props.datasets.map(item =>
                                    <List.Item key={item} onClick={() => this.props.setCurrentDataset(item) && this.toggleModal()}>
                                        <List.Header>
                                            {item.get('name')} {item === this.props.currentDataset &&
                                                <List.Icon name='check' color={color} className="right" />
                                            }
                                        </List.Header>
                                    </List.Item>
                                )}
                            </List>
                        </Modal.Description>
                    </Modal.Content>
                    <Modal.Actions>
                        <Button inverted color='grey' onClick={() => this.toggleModal()}>
                            <Icon name='close' /> Close
                        </Button>
                        <Button inverted color={color} onClick={() => this.toggleModal()}>
                            <Icon name='checkmark' /> Done
                        </Button>
                    </Modal.Actions>
                </Modal>
            </Segment>
        </Grid.Column>;
    }
}

function mapStateToProps(state) {
    return {
        datasets: state.datasets,
        currentDataset: state.currentDataset
    };
}

function mapDispatchToProps(dispatch) {
    return {
        setCurrentDataset: bindActionCreators(setCurrentDataset, dispatch)
    };
}

export const DatasetsContainer = connect(mapStateToProps, mapDispatchToProps)(Datasets);