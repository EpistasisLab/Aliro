import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setParameterValue } from '../actions';
import { Grid, Segment, Header, Button } from 'semantic-ui-react';

export class Parameters extends React.Component {
    render() {
        const color = 'blue';
        return <Grid.Row>
            {this.props.currentAlgorithm.has('name') &&
                this.props.currentAlgorithm.get('params').entrySeq().map(([key, value]) =>
                    <Grid.Column key={key} mobile={16} tablet={8} computer={4} widescreen={4} largeScreen={4}>
                        <Segment inverted color={color}>
                            <Header as='h1' inverted color={color} content={value.get('alias') || key} subheader={value.get('help')} />
                            {value.getIn(['ui', 'choices']).map(choice =>
                                <Button inverted key={choice} color={color} content={choice} active={choice === (value.get('currentValue') || value.get('default'))} onClick={() => this.props.setParameterValue(key, choice)} />
                            )}
                        </Segment>
                    </Grid.Column>
                )
            }
        </Grid.Row>;
    }
}

function mapStateToProps(state) {
    return {
        currentAlgorithm: state.currentAlgorithm
    };
}

function mapDispatchToProps(dispatch) {
    return {
        setParameterValue: bindActionCreators(setParameterValue, dispatch)
    };
}

export const ParametersContainer = connect(mapStateToProps, mapDispatchToProps)(Parameters);