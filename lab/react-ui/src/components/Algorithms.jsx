import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setCurrentAlgorithm } from '../actions';
import { Grid, Button, Segment, Header, Modal, List, Icon } from 'semantic-ui-react';

export class Algorithms extends React.Component {
  render() {
        const color = 'orange';
        const action = 'Select algorithm';
        const btn = <Button color={color} inverted onClick={() => this.toggleModal()}>{action}</Button>;
        return <Grid.Column mobile={16} tablet={8} computer={4} widescreen={4} largeScreen={4}>
            <Segment color={color} inverted>
                <Header as='h1' color={color} inverted content="Algorithm" subheader="Select a machine learning algorithm" />
                {this.props.algorithms.map(item =>
                    <Button key={item} color={color} inverted content={item.get('name')} active={item.get('name') === this.props.currentAlgorithm.get('name')} onClick={() => this.props.setCurrentAlgorithm(item)} />
                )}
            </Segment>
        </Grid.Column>;
    }
}

function mapStateToProps(state) {
    return {
        algorithms: state.algorithms,
        currentAlgorithm: state.currentAlgorithm
    };
}

function mapDispatchToProps(dispatch) {
    return {
        setCurrentAlgorithm: bindActionCreators(setCurrentAlgorithm, dispatch)
    };
}

export const AlgorithmsContainer = connect(mapStateToProps, mapDispatchToProps)(Algorithms);