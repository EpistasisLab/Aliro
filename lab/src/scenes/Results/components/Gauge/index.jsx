import React from 'react';
import c3 from 'c3';

export class Gauge extends React.Component {
	renderChart(chartName, color, value) {
		c3.generate({
			bindto: `.${chartName}`,
			data: {
				columns: [
					['data', value]
				],
						type: 'gauge',
						onclick: function (d, i) { console.log("onclick", d, i); },
						onmouseover: function (d, i) { console.log("onmouseover", d, i); },
						onmouseout: function (d, i) { console.log("onmouseout", d, i); }
				},
				gauge: {
					label: {
						format: function(value, ratio) {
							return value;
						},
						show: true
					},
					min: 0.5, 
					max: 1.0
				},
				color: {
					pattern: [color], // the three color levels for the percentage values.
					threshold: {
						unit: 'value', // percentage is default
						max: 200, // 100 is default
						values: [30, 60, 90, 100]
					}
				},
				interaction: {
					enabled: false
				}
		});
	}

	render() {
		const { chartName, color, value } = this.props;
		this.renderChart(chartName, color, value);
		return (
      <div className={chartName}></div>
		);
	}
}