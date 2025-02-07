const svg = d3.select("svg#line");
const width = svg.attr("width");
const height = svg.attr("height");
const margin = { top: 10, right: 10, bottom: 40, left: 40 };
const chartWidth = width - margin.left - margin.right;
const chartHeight = height - margin.top - margin.bottom;
let annotations = svg
	.append("g")
	.attr("id", "annotations")
	.attr("transform", `translate(${margin.left},${margin.top})`);
let chartArea = svg
	.append("g")
	.attr("transform", `translate(${margin.left},${margin.top})`);

const dataRequest = async function () {
	const treeData = await d3.csv(
		"../datasets/SF-Tree_FILTERED_speciesCount.csv",
		d3.autoType
	);

	treeData.forEach((tree) => {
		let splitArr = tree.qSpecies.split("::");
		tree.qSpecies =
			(splitArr[1].trim() === "") | (splitArr[1].trim() === undefined)
				? splitArr[0].trim()
				: splitArr[1].trim();
	});
	console.log(treeData);

	const avgAgeExtent = d3.extent(treeData, (tree) => tree.average_age_years);
	const avgAgeScale = d3.scaleLinear(avgAgeExtent, [0, chartWidth]);
	const countExtent = d3.extent(treeData, (tree) => tree.total_count);
	const countScale = d3.scaleLog(countExtent, [chartHeight, 0]);

	let leftAxis = d3.axisLeft(countScale);
	let bottomAxis = d3.axisBottom(avgAgeScale);
	let horizontalGrid = d3
		.axisLeft(countScale)
		.tickSize(-chartWidth - 12)
		.tickFormat(" ");

	annotations
		.append("g")
		.attr("class", "y-axis")
		.attr("transform", "translate(-12, 0)")
		.call(leftAxis);
	annotations
		.append("g")
		.attr("class", "y-grid")
		.attr("transform", "translate(-12, 0)")
		.call(horizontalGrid);
	annotations
		.append("g")
		.attr("class", "x-axis")
		.attr("transform", `translate(0, ${chartHeight + 12})`)
		.call(bottomAxis);

	let gen = d3
		.line(
			(d) => avgAgeScale(d.average_age_years),
			(d) => countScale(d.total_count)
		)
		.curve(d3.curveMonotoneX);

	chartArea.append("path").datum(treeData).attr("class", "line").attr("d", gen);
	chartArea
		.selectAll("circle")
		.data(treeData)
		.join("circle")
		.attr("class", "circle")
		.attr("r", 2)
		.attr("cx", (d) => avgAgeScale(d.average_age_years))
		.attr("cy", (d) => countScale(d.total_count));
};

dataRequest();
