

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

import { last, slidingWindow, zipper } from "../utils";
import { SmiOscillator as defaultOptions } from "./defaultOptionsForComputation";
import myEma from "../indicator/myEma";

export default function() {

	let options = defaultOptions;

	let source = d => ({ open: d.open, high: d.high, low: d.low, close: d.close });

	function calculator(data) {
		const { emaWindowSize, kWindowSize, dWindowSize } = options;

		const high = d => source(d).high,
			low = d => source(d).low,
			close = d => source(d).close;

		const getValue = d => d;

		const cmParam = slidingWindow()
			.windowSize(kWindowSize)
			.accumulator((values) => {

				const highestHigh = max(values, high);
				const lowestLow = min(values, low);

				const currentClose = close(last(values));
				const k = currentClose -  (highestHigh + lowestLow) / 2;

				return k;
			});

		const emaCmParam = slidingWindow()
			.windowSize(emaWindowSize)
			.misc({ "prevValue": 0, "print": true })
			.accumulator((values, i, accumulatorIdx, misc) => {
				const ema = myEma(getValue, values, i, emaWindowSize, misc);
				return ema;
			});

		const ema2CmParam = slidingWindow()
			.windowSize(emaWindowSize)
			.misc({ "prevValue": 0 })
			.accumulator((values, i, accumulatorIdx, misc) => {
				return myEma(getValue, values, i, emaWindowSize, misc);
			});

		const ema2CmValue = ema2CmParam(emaCmParam(cmParam(data)));

		const hlParam = slidingWindow()
			.windowSize(kWindowSize)
			.accumulator(values => {

				const highestHigh = max(values, high);
				const lowestLow = min(values, low);

				const k = (highestHigh - lowestLow) / 2;

				return k;
			});

		const emaHlParam = slidingWindow()
			.windowSize(emaWindowSize)
			.misc({ "prevValue": 0 })
			.accumulator((values, i, accumulatorIdx, misc) => {
				return myEma(getValue, values, i, emaWindowSize, misc);
			});

		const ema2HlParam = slidingWindow()
			.windowSize(emaWindowSize)
			.misc({ "prevValue": 0 })
			.accumulator((values, i, accumulatorIdx, misc) => {
				return myEma(getValue, values, i, emaWindowSize, misc);
			});

		const ema2HlValue = ema2HlParam(emaHlParam(hlParam(data)));

		const cmHlZipper = zipper()
			.combine((cm, hl) => ({ cm, hl }));
		const cmHlPair = cmHlZipper(ema2CmValue, ema2HlValue);
		const smiValue = cmHlPair.map(function(cmHlPair) {
			return 100 * cmHlPair.cm / cmHlPair.hl;
		});

		const emaSmiSignal = slidingWindow()
			.windowSize(dWindowSize)
			.misc({ "prevValue": 0 })
			.accumulator((values, i, accumulatorIdx, misc) => {
				return myEma(getValue, values, i, dWindowSize, misc);
			});
		const smiSignal = emaSmiSignal(smiValue);

		const smiAlgorithm = zipper()
			.combine((K, D) => ({ K, D }));
		const indicatorData = smiAlgorithm(smiValue, smiSignal);

		return indicatorData;
	}
	calculator.undefinedLength = function() {
		const { emaWindowSize, kWindowSize, dWindowSize } = options;
		return emaWindowSize + kWindowSize + dWindowSize;
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
