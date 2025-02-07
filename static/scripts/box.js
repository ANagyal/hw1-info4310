const svg = d3.select("svg#box");
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

const requestData = async function () {
	const data = await d3.csv("../datasets/SF-Tree_FILTERED_speciesCount.csv", d3.autoType);

	data.forEach((tree) => {
		let splitArr = tree.qSpecies.split("::");
		tree.qSpecies =
			(splitArr[1].trim() === "") | (splitArr[1].trim() === undefined)
				? splitArr[0].trim()
				: splitArr[1].trim();
	});
	const treeData = data.slice(101, data.length);

	var sumstat = Array.from(
		d3.group(treeData, (d) => d.total_count),
		([key, values]) => ({
			key: key,
			value: (() => {
				const sorted = values.map((g) => g.average_age_years).sort(d3.ascending);
				const q1 = d3.quantile(sorted, 0.25);
				const median = d3.quantile(sorted, 0.5);
				const q3 = d3.quantile(sorted, 0.75);
				const interQuantileRange = q3 - q1;
				const min = d3.min(sorted);
				const max = d3.max(sorted);

				return {
					q1: q1,
					median: median,
					q3: q3,
					interQuantileRange: interQuantileRange,
					min: min,
					max: max,
				};
			})(),
		})
	);

	const avgAgeExtent = d3.extent(treeData, (tree) => tree.average_age_years);
	const countExtent = d3.extent(treeData, (tree) => tree.total_count);
	var boxWidth = width / 35;

	var countScale = d3.scaleLinear(
		[countExtent[0] - 0.5, countExtent[1] + 0.5],
		[0, chartWidth]
	);
	var xAxis = d3.axisBottom(countScale);
	chartArea
		.append("g")
		.attr("transform", `translate(0,${chartHeight})`)
		.attr("class", "x axis")
		.call(xAxis);

	var ageScale = d3.scaleLinear(
		[Math.floor(avgAgeExtent[0] / 5) * 5, Math.ceil(avgAgeExtent[1] / 5) * 5],
		[chartHeight, 0]
	);
	var yAxis = d3.axisLeft(ageScale);
	chartArea.append("g").attr("class", "y axis").call(yAxis);

	const colorScale = d3.scaleOrdinal(d3.schemeTableau10);

	chartArea
		.selectAll("minLine")
		.data(sumstat)
		.enter()
		.append("line")
		.attr("x1", (d) => countScale(d.key))
		.attr("x2", (d) => countScale(d.key))
		.attr("y1", (d) => ageScale(d.value.min))
		.attr("y2", (d) => ageScale(d.value.q1))
		.attr("stroke-dasharray", 5)
		.attr("stroke", (d) => colorScale(d))
		.style("stroke-width", "2px");

	chartArea
		.selectAll("maxLine")
		.data(sumstat)
		.enter()
		.append("line")
		.attr("x1", (d) => countScale(d.key))
		.attr("x2", (d) => countScale(d.key))
		.attr("y1", (d) => ageScale(d.value.q3))
		.attr("y2", (d) => ageScale(d.value.max))
		.attr("stroke-dasharray", 5)
		.attr("stroke", (d) => colorScale(d))
		.style("stroke-width", "2px");

	chartArea
		.selectAll("minWhiskers")
		.data(sumstat)
		.enter()
		.append("line")
		.attr("x1", (d) => countScale(d.key) - boxWidth / 2)
		.attr("x2", (d) => countScale(d.key) + boxWidth / 2)
		.attr("y1", (d) => ageScale(d.value.min))
		.attr("y2", (d) => ageScale(d.value.min))
		.attr("stroke", (d) => colorScale(d))
		.style("stroke-width", "2px");

	chartArea
		.selectAll("maxWhiskers")
		.data(sumstat)
		.enter()
		.append("line")
		.attr("x1", (d) => countScale(d.key) - boxWidth / 2)
		.attr("x2", (d) => countScale(d.key) + boxWidth / 2)
		.attr("y1", (d) => ageScale(d.value.max))
		.attr("y2", (d) => ageScale(d.value.max))
		.attr("stroke", (d) => colorScale(d))
		.style("stroke-width", "2px");

	chartArea
		.selectAll("boxes")
		.data(sumstat)
		.enter()
		.append("rect")
		.attr("x", (d) => countScale(d.key) - boxWidth / 2)
		.attr("y", (d) => ageScale(d.value.q3))
		.attr("height", (d) => ageScale(d.value.q1) - ageScale(d.value.q3))
		.attr("width", boxWidth)
		.attr("stroke", (d) => colorScale(d.key))
		.attr("stroke-width", "2px")
		.style("fill", (d) => colorScale(d.key))
		.style("fill-opacity", 0.5);

	chartArea
		.selectAll("medianLines")
		.data(sumstat)
		.enter()
		.append("line")
		.attr("x1", (d) => countScale(d.key) - boxWidth / 2)
		.attr("x2", (d) => countScale(d.key) + boxWidth / 2)
		.attr("y1", (d) => ageScale(d.value.median))
		.attr("y2", (d) => ageScale(d.value.median))
		.attr("stroke", (d) => colorScale(d))
		.attr("stroke-width", "2px");

	var jitterWidth = boxWidth + 5;
	chartArea
		.selectAll("indPoints")
		.data(treeData)
		.enter()
		.append("circle")
		.attr(
			"cx",
			(d) => countScale(d.total_count) - jitterWidth / 2 + Math.random() * jitterWidth
		)
		.attr("cy", (d) => ageScale(d.average_age_years))
		.attr("r", 2)
		.style("fill", "white")
		.attr("stroke", "black");
};

requestData();
