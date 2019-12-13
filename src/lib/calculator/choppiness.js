

/*
https://github.com/ScottLogic/d3fc/blob/master/src/indicator/algorithm/calculator/stochasticOscillator.js

The MIT License (MIT)

Copyright (c) 2014-2015 Scott Logic Ltd.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

import { max, min } from "d3-array";

import { slidingWindow } from "../utils";
import { ChoppinessOscillator as defaultOptions } from "./defaultOptionsForComputation";

export default function() {

	let options = defaultOptions;

	let source = d => ({ open: d.open, high: d.high, low: d.low, close: d.close });

	function getAtrSum(values) {
		let atrSum = 0;
		for (let i = 0; i < values.length; i++) {
			const atr = getAtr(values, i);
			atrSum += atr;
		}
		return atrSum;
	}

	function getAtr(values, i) {
		const currHigh = values[i].high;
		const currLow = values[i].low;
		const prevIndex = Math.max(i - 1, 0);
		const prevClose = values[prevIndex].close;

		console.log("currHigh = ", currHigh, " currLow = ", currLow, " prevClose = ", prevClose);
		const hlDiff = currHigh - currLow;
		const hcDiff = Math.abs(currHigh - prevClose);
		const lcDiff = Math.abs(currLow - prevClose);

		const trueRange = Math.max(hlDiff, hcDiff, lcDiff);
		console.log("trueRange = ", trueRange);
		return trueRange;
	}

	function calculator(data) {
		const { windowSize } = options;

		const high = d => source(d).high,
			low = d => source(d).low;

		const choppinessParam = slidingWindow()
			.windowSize(windowSize)
			.accumulator((values, i) => {
				const atrSum = getAtrSum(values);

				console.log(JSON.stringify(values));
				const highestHigh = max(values, high);
				const lowestLow = min(values, low);
				console.log("highestHigh = ", highestHigh, " lowestLow = ", lowestLow);
				const range = highestHigh - lowestLow;

				const numerator = Math.log10(atrSum / range);

				const actualPeriod = Math.min(i + 1, windowSize);
				const denominator = actualPeriod === 1 ? 1 : Math.log10(actualPeriod);
				console.log("numerator = ", numerator, " denominator = ", denominator);

				const choppiness = 100 * numerator / denominator;
				return choppiness;
			});

		const choppinessValue = choppinessParam(data);

		return choppinessValue;
	}
	calculator.undefinedLength = function() {
		const { windowSize } = options;
		return windowSize;
	};
	calculator.source = function(x) {
		if (!arguments.length) {
			return source;
		}
		source = x;
		return calculator;
	};
	calculator.options = function(x) {
		if (!arguments.length) {
			return options;
		}
		options = { ...defaultOptions, ...x };
		return calculator;
	};

	return calculator;
}
