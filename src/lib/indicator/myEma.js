import sum from "d3-array/src/sum";
import { last } from "../utils";

export default function(getClose, values, i, windowSize, misc) {
	const alpha = 2 / (windowSize + 1);
	const totalValues = values.length;
	let output;

	console.log("i = ", i, " windowSize = ", windowSize, " totalValues = ", totalValues);
	console.log("prevValue = ", misc.prevValue);

	if (i < windowSize) {
		const size = getMin(totalValues, windowSize);
		output = sum(values, getClose) / size;
	} else {
		const prevValue = misc.prevValue;
		const currClose = getClose(last(values));
		console.log("currClose = ", currClose);
		output = alpha * currClose + (1 - alpha) * prevValue;
	}
	misc.prevValue = output;
	console.log("output = ", output);
	return output;
}

function getMin(left, right) {
	return left <= right ? left : right;
}
