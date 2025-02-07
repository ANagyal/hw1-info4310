const svg = d3.select("#map");
const width = svg.attr("width");
const height = svg.attr("height");
const margins = { top: 20, bottom: 20, right: 0, left: 0 };
const mapWidth = width - margins.left - margins.right;
const mapHeight = height - margins.top - margins.bottom;
const map = svg
	.append("g")
	.attr("transform", "translate(" + margins.left + "," + margins.top + ")");

const dataRequest = async function () {
	const sf = await d3.json("../json/SF-Neighborhoods.geo.json");

	var hoods = topojson.feature(sf, sf.objects.SFNeighborhoods);
	var hoodsMesh = topojson.mesh(sf, sf.objects.SFNeighborhoods);
	var projections = d3.geoMercator().fitSize([mapWidth, mapHeight], hoods);
	var path = d3.geoPath().projection(projections);

	let hoodPaths = map
		.selectAll("path.hood")
		.data(hoods.features)
		.join("path")
		.attr("class", "hoods")
		.attr("d", path);

	map.append("path").datum(hoodsMesh).attr("class", "outlines").attr("d", path);

	const treeData = await d3.csv("../datasets/SF-Tree_FILTERED.csv");

	let todayDate = new Date();
	treeData.forEach((tree) => {
		tree.Position = projections([tree.Longitude, tree.Latitude]);
		tree.PlantDate = d3.timeParse("%-m/%-d/%y %I:%M")(tree.PlantDate);
		if (tree.PlantDate > todayDate) {
			tree.PlantDate.setFullYear(tree.PlantDate.getFullYear() - 100);
		}
	});

	var sizeScale = d3.scaleLinear(
		d3.extent(treeData, (tree) => tree.DBH),
		[1, 10]
	);

	var ageScale = d3.scaleSequential(
		d3.extent(treeData, (tree) => tree.PlantDate),
		d3.interpolateInferno
	);

	let circles = map
		.selectAll("circle")
		.data(treeData)
		.join("circle")
		.attr("r", (d) => sizeScale(d["DBH"]))
		.attr("fill", (d) => ageScale(d["PlantDate"]))
		.attr("cx", (d) => d.Position[0])
		.attr("cy", (d) => d.Position[1])
		.attr("class", "dots");
};

dataRequest();
