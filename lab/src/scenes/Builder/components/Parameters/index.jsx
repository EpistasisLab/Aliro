import React from 'react';
import { Grid, Segment, Header, Button, Popup, Icon } from 'semantic-ui-react';

export class Parameters extends React.Component {
	render() {

		const { 
			params,
			currentParams,
			setParamValue
		} = this.props;

		const getParams = () => {
			return params.entrySeq();
		};

		const calcCols = (choices) => {
			if(choices.size > 2) {
				return 2;
			} else {
				return 1;
			}
		};

		const isActive = (param, value) => {
			return value === currentParams.get(param);
		};

		const color = 'blue';

		return (
			<Grid.Row>
				{params && getParams().map(([param, info]) =>
					<Grid.Column 
						key={param} 
						mobile={16} 
						tablet={4} 
						computer={4} 
						widescreen={4} 
						largeScreen={4}
					>
						<Segment inverted attached="top" className="panel-header">
							<Popup 
								size="large"
								on="click"
								trigger={
									<Icon 
										inverted
										color={color}
										name="info circle"
										className="info-icon float-right"
									/>
								}
								content={info.get('help')}
							/>
							<Header 
								as="h1"
								inverted 
								color={color} 
								content={info.get('alias') || param}
								className="param-name"
							/>
						</Segment>	
						<Segment inverted attached="bottom">
							<Grid columns={calcCols(info.getIn(['ui', 'choices']))} className="compressed">
								{info.getIn(['ui', 'choices']).map(value =>
									<Grid.Column key={value}>
										<Button
											inverted 
											color={color}
											fluid
											content={value} 
											active={isActive(param, value)} 
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