import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setCurrentAlgorithm } from '../../actions';
import { Grid, Segment, Header, Button } from 'semantic-ui-react';
import { Guide } from './components/Guide';

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
                {this.props.algorithms.get('Algorithms') &&
                    this.props.algorithms.get('Algorithms').map(item =>
                    <Button
                        key={item}
                        inverted color={color}
                        icon={item.get('name') === 'auto' ? 'refresh' : false}
                        content={item.get('name') === 'auto' ? false : item.get('name')} 
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
        algorithms: state.preferences.get('items'),
        currentAlgorithm: state.currentAlgorithm
    };
}

function mapDispatchToProps(dispatch) {
    return {
        setCurrentAlgorithm: bindActionCreators(setCurrentAlgorithm, dispatch)
    };
}

export const AlgorithmsContainer = connect(mapStateToProps, mapDispatchToProps)(Algorithms);