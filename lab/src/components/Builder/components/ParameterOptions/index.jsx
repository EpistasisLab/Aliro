import React, { Component } from 'react';
import { fmtParam } from '../../../../utils/formatter';
import { Grid, Segment, Header, Popup, Icon, Button } from 'semantic-ui-react';

class ParameterOptions extends Component {
	calcCols(choices) {
		return choices.size > 2 ? 2 : 1;
	}

	isActive(param, value) {
		return value === this.props.currentParams.get(param);
	}

	render() {

		const { 
			params,
			setParamValue
		} = this.props;

		return (
			<Grid.Row>
				{params && params.entrySeq().map(([param, info]) =>
					<Grid.Column 
						key={param} 
						mobile={16} 
						tablet={8} 
						computer={8} 
						widescreen={8} 
						largeScreen={8}
					>
						<Segment inverted attached="top" className="panel-header">
							<Popup 
								size="large"
								on="click"
								trigger={
									<Icon 
										inverted
										size="large"
										color="blue"
										name="info circle"
										className="info-icon float-right"
									/>
								}
								content={info.get('description')}
							/>
							<Header 
								as="h2"
								inverted 
								color="blue"
								content={fmtParam(info.get('alias') || param)}
								className="param-name"
							/>
						</Segment>	
						<Segment inverted attached="bottom">
							<Grid columns={this.calcCols(info.getIn(['ui', 'choices']))} className="compressed">
								{info.getIn(['ui', 'choices']).map(value =>
									<Grid.Column key={value}>
										<Button
											inverted 
											color="blue"
											fluid
											content={value.toString()} 
											active={this.isActive(param, value)} 
											onClick={() => setParamValue(param, value)} 
										/>
									</Grid.Column>
								)}
							</Grid>	
						</Segment>
					</Grid.Column>
				)}
			</Grid.Row>
		);
	}
}

export default ParameterOptions;