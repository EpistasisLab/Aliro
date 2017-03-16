import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setParameterValue } from '../../actions';
import { Grid, Segment, Header, Button, Popup, Icon, Label } from 'semantic-ui-react';

export class Parameters extends React.Component {
    render() {
        const color = 'blue';
        return <Grid.Row>
            {this.props.currentAlgorithm.get('params') &&
                this.props.currentAlgorithm.get('params').entrySeq().map(([key, value]) =>
                <Grid.Column key={key} mobile={16} tablet={8} computer={8} widescreen={8} largeScreen={8}>
                    <Segment inverted color={color}>
                        <Popup 
                            size='large' 
                            on='click'
                            trigger={<Label color={color} className='inverted' corner='right' icon='info'></Label>}
                            content={value.get('help')}
                        />
                        <Header 
                            as='h1'
                            inverted color={color} 
                            content={value.get('alias') || key}
                        />
                        {value.getIn(['ui', 'choices']).map(choice =>
                            <Button
                                key={choice}
                                inverted color={color}
                                content={choice} 
                                active={choice === (value.get('currentValue') || value.get('default'))} 
                                onClick={() => this.props.setParameterValue(key, choice)} 
                            />
                        )}
                    </Segment>
                </Grid.Column>
            )}
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