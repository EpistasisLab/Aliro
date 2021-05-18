import React, { Component } from 'react';
import { Header, Grid } from 'semantic-ui-react';
import Papa from 'papaparse';
import PlotlyBarPlot from '../PlotlyBarPlot';
import PlotlyStackedBarPlot from '../PlotlyStackedBarPlot';
import PlotlyBoxPlot from '../PlotlyBoxPlot';

class DataStats extends Component {
    constructor(props) {
        super(props);

        this.state = {
            dataset: 'fetching',
            fullDataset: null,
            fields: null,
            isReady: false
        };

        this.modifyFilterData = this.modifyFilterData.bind(this);
    }

    componentDidMount() {
       console.log("Component did mount called")
        fetch(`/api/datasets/${this.props.params.id}`)
          .then(response => {
            if(response.status >= 400) {
              throw new Error(`${response.status}: ${response.statusText}`);
            }
            return response.json();
        })
        .then(dataset => {
          this.setState({ dataset: dataset[0] })
          this.forceUpdate()
        });
    }
    
    componentDidUpdate(prevProps, prevState) {
        if(this.state.dataset !== prevState.dataset) {
            fetch(`/api/v1/files/${this.state.dataset.files[0]._id}`)
            .then(response => {
                if(response.status >= 400) {
                throw new Error(`${response.status}: ${response.statusText}`);
                }
                return response.text();
            })
            .then(text => {
                var parsedData = Papa.parse(text, { header: true, preview: 5 });
                this.setState({
                  fullDataset: this.modifyFilterData(parsedData.data),
                  fields: parsedData.meta.fields,
                  isReady: true
               });
            })
        }
    }

    // Mofifies Papa Parse data format to get an object { feature : array of values }
    modifyFilterData(originalData) {
      var finalData = {}
      originalData.forEach(row => {
        for (const [colname, value] of Object.entries(row)) {
          if(colname in finalData){
            finalData[colname].push(value)
          } else{
            finalData[colname] = [value]
          }
        }
      });
      return finalData
    }

    render() {
      const { dataset, fullDataset, fields, isReady } = this.state;
      
      if(isReady === false){
        console.log("isReady: "+isReady);
        return null;
      }

      console.log("full data: ")
      console.log(fullDataset)
      console.log("dataset: ")
      console.log(dataset)
      // categorical_features & ordinal_features
      const n = 20;
      let cat_feats = dataset.files[0].categorical_features;
      let ord_feats = dataset.files[0].ordinal_features;
      let num_feats = fields.filter(n => !cat_feats.includes(n) && !ord_feats.includes(n)).slice(0, n);
      cat_feats = cat_feats.slice(0,n);
      ord_feats = ord_feats.slice(0,n);

      return (
        <Grid columns={1}>
        { Object.keys(cat_feats).length ?
              <Grid.Column>
                <Grid.Column>
                <Header as="h2" content="Categorical Features" style={{ display: 'inline', marginRight: '0.5em', color: 'white' }} />
                </Grid.Column>
                <Grid.Column>
                {cat_feats.map(field =>
                  <PlotlyBarPlot 
                    data={fullDataset[field]}
                    width={300}
                    height={400}
                    header={'Plotly BarPlot for '+field} 
                    axis_color={"#fff"}
                    font_color={"#fff"}
                /> 
                )}
                </Grid.Column>
              </Grid.Column>
              : <Grid.Column>
                  <Header as="h2" content="No Categorical Features" style={{ display: 'inline', marginRight: '0.5em', color: 'white' }} />
                </Grid.Column>
        }
        { Object.keys(num_feats).length ?
                <Grid.Column>
                <Grid.Column>
                <Header as="h2" content="Numerical Features" style={{ display: 'inline', marginRight: '0.5em', color: 'white' }} />
                </Grid.Column>
                <Grid.Column>
                {num_feats.map(field =>
                  <PlotlyBoxPlot 
                    data={[
                      {
                        x: fullDataset[field],
                        type: 'box',
                        name: field
                      }
                    ]}
                    width={300}
                    height={400}
                    header={'Horizontal Box Plot for '+field} 
                    axis_color={"#fff"}
                    font_color={"#fff"}
                    bg_color={"#2D2E2F"}
                /> 
                )} 
              </Grid.Column>
              </Grid.Column>
              : <Grid.Column>
                  <Header as="h2" content="No Numerical Features" style={{ display: 'inline', marginRight: '0.5em', color: 'white' }} />
                </Grid.Column>
        }
        </Grid>
        )
    }
}

export default DataStats;