function gaussianPDF(x, mean, stdDev) {
	let exponent = -0.5 * ((x - mean) / stdDev) ** 2;
	let denominator = stdDev * sqrt(2 * PI);
	return (1 / denominator) * exp(exponent);
}

function mapX(x, a) {
	return map(x, -a, a, 0, width);
}

function plotGaussianPDF(mean, stdDev, a, offset) {
	let maxGaussianPDF = gaussianPDF(mean, mean, stdDev);
	let step = 0.01;
	stroke(150, 0, 0);
	fill(200);
	beginShape(LINES);
	for (let x = -a; x <= a; x += step) {
		let pdf = gaussianPDF(x, mean, stdDev);
		let y = map(pdf, 0, maxGaussianPDF, height - offset, offset);
		vertex(mapX(x, a), y);
	}
	endShape();
}

function drawSamples(samples, mean, stdDev, a, offset) {
	let maxGaussianPDF = gaussianPDF(mean, mean, stdDev);
	stroke(0);
	strokeWeight(0.2);
	for (let sample of samples) {
		let pdf = gaussianPDF(sample, mean, stdDev);
		let y = map(pdf, 0, maxGaussianPDF, height - offset, offset);
		line(mapX(sample, a), y, mapX(sample, a), height * 0.9);
	}
	strokeWeight(1);
}

function computePDFs(samples, mean, stdDev, a, step, kernelSTD) {
	let mainPDFs = [];
	let sampledPDFs = [];
	let maxMainPDF = gaussianPDF(mean, mean, stdDev);
	let maxSamplePDF;
	for (let x = -a; x <= a; x += step) {
		let mainPDF = gaussianPDF(x, mean, stdDev);
		mainPDFs.push(mainPDF);

		let totalPDF = 0;
		maxSamplePDF = 0;
		for (let sample of samples) {
			totalPDF += gaussianPDF(x, sample, kernelSTD);
			maxSamplePDF += gaussianPDF(sample, sample, kernelSTD);
		}
		sampledPDFs.push(totalPDF / samples.length);  // Taking the average if multiple samples.
	}
	maxSamplePDF /= samples.length;
	return { mainPDFs, sampledPDFs, maxMainPDF, maxSamplePDF };
}

function drawSampledPDF(samples, mean, stdDev, a, offset, kernelSTD) {
	let step = 0.01;
	let { mainPDFs, sampledPDFs, maxMainPDF, maxSamplePDF } = computePDFs(samples, mean, stdDev, a, step, kernelSTD);

	// Drawing the overlap shade
	noStroke();
	fill(150, 150, 250, 150);  // A light blue shade with some transparency
	beginShape();
	for (let i = 0; i < mainPDFs.length; i++) {
		let x = -a + i * step;
		let yMain = map(mainPDFs[i], 0, maxMainPDF, height - offset, offset);
		let ySampled = map(sampledPDFs[i], 0, maxSamplePDF, height - offset, offset);

		// Using the minimum value for overlap
		let yMin = Math.max(yMain, ySampled);
		vertex(mapX(x, a), yMin);
	}
	vertex(mapX(a, a), height - offset);
	vertex(mapX(-a, a), height - offset);
	endShape(CLOSE);

	// Drawing the sampled PDF line
	stroke(0, 150, 0);
	fill(200);
	beginShape(LINES);
	for (let i = 0; i < mainPDFs.length; i++) {
		let x = -a + i * step;
		let ySampled = map(sampledPDFs[i], 0, maxSamplePDF, height - offset, offset);
		vertex(mapX(x, a), ySampled);
	}
	endShape();
}

function drawAxes(offset) {
	stroke(0);
	line(0, height - offset, width, height - offset);

	textAlign(CENTER, CENTER);
	textSize(16);
	text("x", width - 20, height - offset - 10);
	text("PDF(x)", width / 2 + 40, 40);
}

function setup() {
	createCanvas(windowWidth, windowHeight);
	let mean = 0;
	let stdDev = 1;
	let a = 10 * stdDev;
	let offset = height * 0.1;
	let numSamples = 2;

	plotGaussianPDF(mean, stdDev, a, offset);

	let samples = Array.from({ length: numSamples }, () => randomGaussian(mean, stdDev));

	drawAxes(offset);
	drawSamples(samples, mean, stdDev, a, offset);
	drawSampledPDF(samples, mean, stdDev, a, offset, stdDev);
}
