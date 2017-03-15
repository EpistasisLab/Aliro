import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { setCurrentLevel } from '../../actions';
import { Grid, Segment, Header, Dropdown } from 'semantic-ui-react';

export class Levels extends React.Component {
    render() {
        const color = 'orange';
        const options = [
            {text: 'Basic', value: 'BASIC'},
            {text: 'Advanced', value: 'ADVANCED'},
            {text: 'Grid Search', value: 'GRID'},
            {text: 'Random Search', value: 'RANDOM'}
        ];
        return <Grid.Column mobile={16} tablet={8} computer={4} widescreen={4} largeScreen={4}>
            <Segment inverted color={color}>
                <Header as='h1' inverted color={color} content='Parameter Level' subheader='Select the level of control over parameters' />
                <Dropdown selection button options={options} defaultValue={this.props.currentLevel} onChange={(e,d) => this.props.setCurrentLevel(d.value)} />
            </Segment>
        </Grid.Column>;
    }
}

function mapStateToProps(state) {
    return {
        currentLevel: state.currentLevel
    };
}

function mapDispatchToProps(dispatch) {
    return {
        setCurrentLevel: bindActionCreators(setCurrentLevel, dispatch)
    };
}

export const LevelsContainer = connect(mapStateToProps, mapDispatchToProps)(Levels);