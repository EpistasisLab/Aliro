import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setCurrentAlgorithm } from '../../../../data/currentAlgorithm/actions';
import { Grid, Segment, Header, Button, Icon } from 'semantic-ui-react';

export class Algorithms extends React.Component {
    render() {
        const color = 'orange';
        return <Grid.Column mobile={16} tablet={8} computer={8} widescreen={8} largeScreen={8}>
            <Segment inverted color={color}>
                <Header 
                    as='h1' 
                    inverted color={color} 
                    content="Algorithm" 
                />

                {this.props.isFetching && 
                    <Header size='small'>Retrieving your algorithms...<Icon loading name='refresh' /></Header>
                }

                {!this.props.isFetching &&
                    this.props.algorithms.map(item =>
                    <Button
                        key={item}
                        inverted color={color}
                        content={item.get('name')} 
                        active={item.get('name') === this.props.currentAlgorithm.get('name')} 
                        onClick={() => this.props.setCurrentAlgorithm(item)} 
                    />
                )}
            </Segment>
        </Grid.Column>;
    }
}

function mapStateToProps(state) {
    return {
        isFetching: state.data.preferences.get('isFetching'),
        algorithms: state.data.preferences.getIn(['preferences', 'Algorithms']),
        currentAlgorithm: state.data.currentAlgorithm
    };
}

function mapDispatchToProps(dispatch) {
    return {
        setCurrentAlgorithm: bindActionCreators(setCurrentAlgorithm, dispatch)
    };
}

export const AlgorithmsContainer = connect(mapStateToProps, mapDispatchToProps)(Algorithms);