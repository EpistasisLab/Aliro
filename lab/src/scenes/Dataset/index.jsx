import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
//import { setParameterValue } from '../../../../data/currentAlgorithm/actions';
import { Accordion, Table } from 'semantic-ui-react';

export class Dataset extends React.Component {
	render() {
		return  <Accordion inverted fluid activeIndex={0}>
			<Accordion.Title>
				BernoulliNB
			</Accordion.Title>
			<Accordion.Content>
				<Table inverted selectable columns='7' compact>
			      <Table.Header>
			        <Table.Row>
			        	<Table.HeaderCell>Completed</Table.HeaderCell>
			        	<Table.HeaderCell>Accuracy</Table.HeaderCell>
			        	<Table.HeaderCell>Precision</Table.HeaderCell>
			        	<Table.HeaderCell>Recall</Table.HeaderCell>
			        	<Table.HeaderCell>Alpha</Table.HeaderCell>
			        	<Table.HeaderCell>Binarize</Table.HeaderCell>
			        	<Table.HeaderCell>Fit Prior</Table.HeaderCell>
			        </Table.Row>
			      </Table.Header>

			      <Table.Body>
			        <Table.Row>
			        	<Table.Cell>20 mins ago</Table.Cell>
			          <Table.Cell>0.71</Table.Cell>
			          <Table.Cell>0.83</Table.Cell>
			          <Table.Cell>0.70</Table.Cell>
			          <Table.Cell>100</Table.Cell>
			          <Table.Cell>0.25</Table.Cell>
			          <Table.Cell>false</Table.Cell>
			        </Table.Row>
			        <Table.Row>
			        	<Table.Cell>40 mins ago</Table.Cell>
			          <Table.Cell>0.78</Table.Cell>
			          <Table.Cell>0.85</Table.Cell>
			          <Table.Cell>0.75</Table.Cell>
			          <Table.Cell>10</Table.Cell>
			          <Table.Cell>0.50</Table.Cell>
			          <Table.Cell>false</Table.Cell>
			        </Table.Row>
			        <Table.Row>
			        	<Table.Cell>Thursday 10:02 pm</Table.Cell>
			          <Table.Cell>0.86</Table.Cell>
			          <Table.Cell>0.92</Table.Cell>
			          <Table.Cell>0.79</Table.Cell>
			          <Table.Cell>0.01</Table.Cell>
			          <Table.Cell>1.00</Table.Cell>
			          <Table.Cell>true</Table.Cell>
			        </Table.Row>
			      </Table.Body>
			    </Table>
			</Accordion.Content>
		</Accordion>;
	}
}

function mapStateToProps(state) {
	return {
		//isFetching: state.data.datasets.get('isFetching'),
		//datasets: state.data.datasets.get('items')
	};
}

function mapDispatchToProps(dispatch) {
	return {
		//setParameterValue: bindActionCreators(setParameterValue, dispatch)
	};
}

export const DatasetContainer = connect(mapStateToProps, mapDispatchToProps)(Dataset);