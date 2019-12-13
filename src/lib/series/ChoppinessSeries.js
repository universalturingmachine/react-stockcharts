

import React, { Component } from "react";
import PropTypes from "prop-types";

import LineSeries from "./LineSeries";
import StraightLine from "./StraightLine";

class ChoppinessSeries extends Component {
	constructor(props) {
		super(props);
		this.yAccessor = this.yAccessor.bind(this);
	}
	yAccessor(d) {
		const { yAccessor } = this.props;
		return yAccessor(d);
	}
	render() {
		const { className, stroke, refLineOpacity } = this.props;
		const { choppy, middle, trending } = this.props;
		return (
			<g className={className}>
				<LineSeries yAccessor={this.yAccessor}
					stroke={stroke.kLine}
					fill="none"
					strokeWidth = {2} />
				<StraightLine
					stroke={stroke.top}
					opacity={refLineOpacity}
					yValue={choppy} />
				<StraightLine
					stroke={stroke.middle}
					opacity={refLineOpacity}
					yValue={middle} />
				<StraightLine
					stroke={stroke.bottom}
					opacity={refLineOpacity}
					yValue={trending} />
			</g>
		);
	}
}

ChoppinessSeries.propTypes = {
	className: PropTypes.string,
	yAccessor: PropTypes.func.isRequired,
	stroke: PropTypes.shape({
		top: PropTypes.string.isRequired,
		middle: PropTypes.string.isRequired,
		bottom: PropTypes.string.isRequired,
		kLine: PropTypes.string.isRequired,
	}).isRequired,
	choppy: PropTypes.number.isRequired,
	middle: PropTypes.number.isRequired,
	trending: PropTypes.number.isRequired,
	refLineOpacity: PropTypes.number.isRequired,
};

ChoppinessSeries.defaultProps = {
	className: "react-stockcharts-choppiness-series",
	stroke: {
		top: "#964B00",
		middle: "#000000",
		bottom: "#964B00",
		kLine: "#000000",
	},
	choppy: 61.8,
	middle: 50,
	trending: 38.2,
	refLineOpacity: 0.3,
};

export default ChoppinessSeries;
