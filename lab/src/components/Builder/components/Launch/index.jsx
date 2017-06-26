import React from 'react';
import { Grid, Segment, Header, Button, Modal, List, Icon, Table, Image, Progress } from 'semantic-ui-react';

export class Launch extends React.Component {
    constructor() {
        super();
        this.state = { modalOpen: false, loading: true };
    }

    render() {
        const color = 'olive';
        const action = 'Launch';
        return <Grid.Column mobile={16} tablet={8} computer={8} widescreen={8} largeScreen={8}>
             <Button fluid size='massive' color={color} inverted content={action} />
        </Grid.Column>;
    }
}