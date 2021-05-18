import React , { Component } from 'react';
import { Grid, Tab } from 'semantic-ui-react';
import Dataset from '../Dataset';
import DataStats from '../DataStats';
import PlotlyBarPlot from '../PlotlyBarPlot';
import PlotlyStackedBarPlot from '../PlotlyStackedBarPlot';
import PlotlyBoxPlot from '../PlotlyBoxPlot';

class DatasetTabbed extends Component {
    constructor(props) {
        super(props);
        this.getsampleplot = this.getsampleplot.bind(this);
    }
    
    getsampleplot() {
        return (
            <Grid columns={1}>
                <Grid.Column>
                <PlotlyBarPlot 
                    xdata={[1, 2, 3]}
                    ydata={[2, 6, 3]}
                    width={600}
                    height={400}
                    header={'Plotly BarPlot'} 
                    axis_color={"#fff"}
                    font_color={"#fff"}
                />
                </Grid.Column>
                <Grid.Column>
                <PlotlyStackedBarPlot 
                    data={[
                    {
                        x: ['banana','poacee','sorgho','triticum'],
                        y: [12,6,11,19],
                        name: 'Nitrogen',
                        type: 'bar'
                    },
                    {
                        x: ['banana','poacee','sorgho','triticum'],
                        y: [1,6,28,6],
                        name: 'normal',
                        type: 'bar'
                    },
                    {
                        x: ['banana','poacee','sorgho','triticum'],
                        y: [13,33,12,1],
                        name: 'stress',
                        type: 'bar'
                    }
                    ]}
                    width={600}
                    height={400}
                    header={'Plotly Stacked BarPlot'} 
                    axis_color={"#fff"}
                    font_color={"#fff"}
                />
                </Grid.Column>
                <Grid.Column>
                    <PlotlyBoxPlot 
                    data={[
                        {
                        x: [1, 2, 3, 4, 4, 4, 8, 9, 10],
                        type: 'box',
                        name: 'Set 1'
                        },
                        {
                        x: [2, 3, 3, 3, 3, 5, 6, 6, 7],
                        type: 'box',
                        name: 'Set 2'
                        }
                    ]}
                    width={600}
                    height={400}
                    header={'Horizontal Box Plot'} 
                    axis_color={"#fff"}
                    font_color={"#fff"}
                    bg_color={"#2D2E2F"}
                    />
                </Grid.Column>
            </Grid>
        )
    }

    render() {
        const panes = [
            { menuItem: 'Preview', render: () => <Tab.Pane ><Dataset params = {this.props.params}/></Tab.Pane>},
            { menuItem: 'Basic Stats', render: () => <Tab.Pane><DataStats params = {this.props.params}/></Tab.Pane> },
            { menuItem: 'Sample', render: () => <Tab.Pane>{this.getsampleplot()}</Tab.Pane> },
          ]

        return ( <Tab panes={panes}/> )
    }
}

export default DatasetTabbed;
