import React, { Component } from 'react';
import { connect } from 'react-redux';
import { formatDataset, formatTime } from 'utils/formatter';
import { Header, Tab, Segment, Grid, Loader, Table, Icon, Container } from 'semantic-ui-react';
import Metafeatures from './components/Metafeatures/';
import Details from './components/Details/';
import Summary from './components/Summary/';

class DatasetMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
    this.getTabMenu = this.getTabMenu.bind(this);
    this.getDataValByRow = this.getDataValByRow.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    //this.createCharts();
  }

  // aggregate all available column values grouped by row, i.e all values for
  // column 'At1' into returned obj
  getDataValByRow() {
    const { dataset, dataPreview } = this.props;
    if(dataPreview) {
      let dataStuff = dataPreview.data;
      // grab dataset columns names from first entry
      let dataKeys = Object.keys(dataStuff[0]);
      let valByRowObj = {};
      // initialize empty obj with dataset column names as keys
      dataKeys.forEach(key => {
        let tempKey = key.replace(/ /g, "_");
        valByRowObj[tempKey] = []
      });

      dataStuff.forEach(entry => {
        dataKeys.forEach(key => {
          let tempKey = key.replace(/ /g, "_");
          // add some checks to prevent loading empty/garbage data

          // first try to parse entry to test for number, without parsing
          // numerical values are entered as strings
          let parsedEntry = parseFloat(entry[key]);
          // if not a number and not empty, record entry, this will ignore entries
          // that are empty string or undefined
          typeof entry[key] !== 'undefined'
            && entry[key] !== ''
            && isNaN(parsedEntry)
            && valByRowObj[tempKey].push(entry[key]);
          // if entry is a number, enter parsed value
          !isNaN(parsedEntry) && valByRowObj[tempKey].push(parsedEntry)
        })
      });
      //window.console.log('val test ', valByRowObj);
      return valByRowObj;
    }
  }

  getTabMenu() {
    const { dataset, dataPreview, fileDetailsClick } = this.props;
    // sort metafeatures in desired order
    let first = ['n_rows', 'n_columns', 'n_classes']; // priority metafeatures
    let empty = []; // metafeatures that have no value
    let rest = [];  // rest of metafeatures
    let dataKeys;
    Object.entries(dataset.metafeatures).forEach(([key, value]) => {
      if(first.includes(key)) { return; }
      if(value === null) { empty.push(key); }
      else { rest.push(key); }
    });
    // join the categorized metafeatures into one array
    const allMetafeatures = first.concat(rest).concat(empty);
    if(dataset === 'fetching') { return null; }

    // categorical_features & ordinal_features
    let cat_feats = dataset.files[0].categorical_features; // list of column names
    // object with key/val pair - key is column name, val is ordered list
    let ord_feats = dataset.files[0].ordinal_features;
    let dep_col = dataset.files[0].dependent_col;
    let ordKeys =  Object.keys(ord_feats);
    let valByRowObj = this.getDataValByRow();

    if(dataPreview) {
      let dataStuff = dataPreview.data;
      // grab all dataset columns names from first entry
      dataKeys = Object.keys(dataStuff[0]);
      // rearrange array - last element tends to be target class/dependent_col
      // not sure if it's safe to make this assumption
      //dataKeys.splice(0, 0, dataKeys.pop());
      // check place of dependent_col manually/safetly
      let depColIndex = dataKeys.indexOf(dep_col);
      // remove item
      dataKeys.splice(depColIndex, 1);
      // add target class/dependent_col as first element
      dataKeys.splice(0, 0, dep_col);
      let dataType;
      let testPain = [
        {
          menuItem: 'Summary',
          render: () => (
            <Tab.Pane style={{border: 'none' }}>
              <Summary
                dataPreview={dataPreview}
                valByRowObj={valByRowObj}
                dataset={dataset}
                dataKeys={dataKeys}
                cat_feats={cat_feats}
                ordKeys={ordKeys}
                dep_col={dep_col}
              />
            </Tab.Pane>
          )
        },
        {
          menuItem: 'Details',
          render: () => (
            <Tab.Pane style={{border: 'none' }}>
              <Details
                fileDetailsClick={fileDetailsClick}
                formatTime={formatTime}
                dataPreview={dataPreview}
                dataset={dataset}
              />
            </Tab.Pane>
          )
        },{
          menuItem: 'Metafeatures',
          render: () => (
            <Tab.Pane style={{border: 'none' }}>
              <Metafeatures
                allMetafeatures={allMetafeatures}
                dataset={dataset}
              />
            </Tab.Pane>
          )
        }
      ];
      return testPain;
  }
}

  render() {
    let stuff = this.getTabMenu();
    return (
      <div>
        <Tab
          menu={{ attached: 'top', inverted: true }}
          panes={stuff}
          renderActiveOnly={true}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({

});

export { DatasetMenu };
export default connect(mapStateToProps, {})(DatasetMenu);
