import React from 'react';
import { Table } from 'semantic-ui-react';

export class Status extends React.Component {
		render() {
				return <Table celled inverted selectable striped columns='4'>
		      <Table.Header>
		        <Table.Row>
		          <Table.HeaderCell>Experiment</Table.HeaderCell>
		          <Table.HeaderCell>Dataset</Table.HeaderCell>
		          <Table.HeaderCell>Algorithm</Table.HeaderCell>
		          <Table.HeaderCell>Status</Table.HeaderCell>
		        </Table.Row>
		      </Table.Header>

		      <Table.Body>
		        <Table.Row>
		          <Table.Cell>58790471ff41ab0031b94d4a</Table.Cell>
		          <Table.Cell>Thyroid</Table.Cell>
		          <Table.Cell>BernoulliNB</Table.Cell>
		          <Table.Cell>Running</Table.Cell>
		        </Table.Row>
		        <Table.Row>
		          <Table.Cell>588a4f28ec019e0032d5f868</Table.Cell>
		          <Table.Cell>Mushrooms</Table.Cell>
		          <Table.Cell>LinearSVC</Table.Cell>
		          <Table.Cell>Complete</Table.Cell>
		        </Table.Row>
		      </Table.Body>
		    </Table>;
		}
}