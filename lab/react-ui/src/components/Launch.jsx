import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
//import { launchExperiment } from '../actions';
import { Grid, Segment, Header, Button } from 'semantic-ui-react';

export class Launch extends React.Component {
    render() {
        const color = 'olive';
        return <Grid.Column mobile={16} tablet={8} computer={4} widescreen={4} largeScreen={4}>
            <Segment inverted color={color}>
                <Header as='h1' inverted color={color} content='Launch experiment' subheader='Start your experiment' />
                <Button inverted color={color}>Launch</Button>
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