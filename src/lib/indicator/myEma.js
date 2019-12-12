import sum from "d3-array/src/sum";
import { last } from "../utils";

export default function(getClose, values, i, windowSize, misc) {
	const alpha = 2 / (windowSize + 1);
	const totalValues = values.length;
	let output;

	if (misc.print && i < 100) {
		// console.log("i = ", i, " windowSize = ", windowSize, " totalValues = ", totalValues);
		// console.log("prevValue = ", misc.prevValue);
		// console.log("values = ", JSON.stringify(values));
	}

	if (i < windowSize) {
		const size = getMin(totalValues, windowSize);
		output = sum(values, getClose) / size;
	} else {
		const prevValue = misc.prevValue;
		const lastValue = last(values);
		const currClose = getClose(lastValue);
		if (misc.print && i < 100) {
			// console.log("prevValue = ", prevValue, " lastValue = ", lastValue, " currClose = ", currClose);
		}
		output = alpha * currClose + (1 - alpha) * prevValue;
	}
	misc.prevValue = output;
	// if (misc.print && i < 100) console.log("output = ", output);
	return output;
}

function getMin(left, right) {
	return left <= right ? left : right;
}
