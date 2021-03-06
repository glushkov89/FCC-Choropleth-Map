// Objective: Build a CodePen.io app that is functionally similar to this: https://codepen.io/freeCodeCamp/full/EZKqza.
// Fulfill the below user stories and get all of the tests to pass. Give it your own personal style.
// You can use HTML, JavaScript, CSS, and the D3 svg-based visualization library. Required (non-virtual)
// DOM elements are queried on the moment of each test. If you use a frontend framework (like Vue for example),
// the test results may be inaccurate for dynamic content. We hope to accommodate them eventually,
// but these frameworks are not currently supported for D3 projects.
// User Story #1: My choropleth should have a title with a corresponding id="title".
// User Story #2: My choropleth should have a description element with a corresponding id="description".
// User Story #3: My choropleth should have counties with a corresponding class="county" that represent the data.
// User Story #4: There should be at least 4 different fill colors used for the counties.
// User Story #5: My counties should each have data-fips and data-education properties containing their corresponding fips and education values.
// User Story #6: My choropleth should have a county for each provided data point.
// User Story #7: The counties should have data-fips and data-education values that match the sample data.
// User Story #8: My choropleth should have a legend with a corresponding id="legend".
// User Story #9: There should be at least 4 different fill colors used for the legend.
// User Story #10: I can mouse over an area and see a tooltip with a corresponding id="tooltip" which displays more information about the area.
// User Story #11: My tooltip should have a data-education property that corresponds to the data-education of the active area.
// Here are the datasets you will need to complete this project:
// 	US Education Data: https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json
// 	US County Data: https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json
// You can build your project by forking this CodePen pen. Or you can use this CDN link to run the tests in any environment you like:
// https://cdn.freecodecamp.org/testable-projects-fcc/v1/bundle.js
// Once you're done, submit the URL to your working project with all its tests passing.
// Remember to use the Read-Search-Ask method if you get stuck.

document.addEventListener("DOMContentLoaded", function() {
	const d3 = require("d3");
	d3.json(
		"https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json"
	).then((data) => {
		d3.json(
			"https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json"
		).then((geo) => {
			console.log(data);
			console.log(geo);

			//Margins
			const mg = { t: 70, b: 90, r: 30, l: 70 };
			//Diag
			const d = {
				h: 600,
				w: 1000
			};
			//SVG
			const s = {
				h: mg.t + d.h + mg.b,
				w: mg.l + d.w + mg.r,
				i: "svg-canvas"
			};
			//COLORBREWER
			const clr = [
				"#ffffd9",
				"#edf8b1",
				"#c7e9b4",
				"#7fcdbb",
				"#41b6c4",
				"#1d91c0",
				"#225ea8",
				"#253494",
				"#081d58"
			];
			//Legend rect
			const lg = { h: 15, w: 50 };

			/*----------Color scale------------*/
			const color = d3
				.scaleQuantize()
				.domain([
					d3.min(data, (d) => d.bachelorsOrHigher),
					d3.max(data, (d) => d.bachelorsOrHigher)
				])
				.range(clr);

			/*----------Tooltip------------*/

			const tooltipParse = (id) => {
				let data = findData(id);
				return `${data.area_name}, ${data.state}: ${data.bachelorsOrHigher}%`;
			};

			let tooltipDiv = d3
				.select("body")
				.append("div")
				.style("opacity", 0)
				.attr("id", "tooltip")
				.attr("class", "mytooltip")
				.attr("data-education", 0);

			/*----------Map------------*/

			const findData = (id) => {
				let tmp = {};
				data.forEach((obj) => {
					if (obj.fips === id) tmp = { ...obj };
				});
				return tmp;
			};

			let path = d3.geoPath();
			const svg = d3
				.select("main")
				.append("svg")
				.attr("height", s.h)
				.attr("width", s.w);
			const map = svg
				.append("g")
				.attr("transform", `translate(${mg.l},${mg.t})`);
			map
				.selectAll("path")
				.data(topojson.feature(geo, geo.objects.counties).features)
				.enter()
				.append("path")
				.attr("d", path)
				.attr("class", "county")
				.attr("fill", (d) => color(findData(d.id).bachelorsOrHigher))
				.style("stroke", "black")
				.style("stroke-width", "0.2")
				.attr("data-fips", (d) => findData(d.id).fips)
				.attr("data-education", (d) => findData(d.id).bachelorsOrHigher)
				.on("mouseover", (d) => {
					let id = d.id;
					tooltipDiv
						.html(tooltipParse(id))
						.attr("data-education", findData(id).bachelorsOrHigher)
						.style("left", d3.event.pageX + 10 + "px")
						.style("top", d3.event.pageY - 20 + "px");
					tooltipDiv
						.transition()
						.duration(100)
						.style("opacity", 0.9);
				})
				.on("mouseout", () => {
					tooltipDiv
						.transition()
						.duration(300)
						.style("opacity", 0);
				});

			map
				.append("path")
				.datum(topojson.mesh(geo, geo.objects.states, (a, b) => a !== b))
				.attr("class", "states")
				.attr("d", path);

			/*----------Legend------------*/
			const legend = svg.append("g").attr("id", "legend");
			legend
				.selectAll("rect")
				.data(clr)
				.enter()
				.append("rect")
				.attr("x", (d, i) => i * lg.w)
				.attr("height", lg.h)
				.attr("width", lg.w)
				.attr("fill", (d) => d)
				.attr("stroke", "black")
				.style("stroke-width", "0.2");
			//Legend scale
			const lgSc = d3
				.scaleLinear()
				.domain(color.domain())
				.range([0, lg.w * clr.length]);
			const tickVals = color.range().reduce((acc, d, i) => {
				let tmp = color.invertExtent(d);
				acc.push(tmp[0]);
				if (i === color.range().length - 1) acc.push(tmp[1]);
				return acc;
			}, []);
			//Legend axis
			const lgAxis = d3
				.axisBottom(lgSc)
				.tickFormat(d3.format(".1f"))
				.tickValues(tickVals)
				.tickFormat((n) => n.toFixed(1) + "%");
			//.tickFormat((n) => Math.round((n + 0.00001) * 100) / 100 + "%");
			legend
				.append("g")
				.call(lgAxis)
				.attr("id", "lg-axis")
				.attr("transform", `translate(0,${lg.h})`);
			//Positioning legend
			legend.attr(
				"transform",
				`translate(${mg.l +
					(d.w - legend.node().getBoundingClientRect().width) / 2},${mg.t})`
			);

			/*----------Title + Description------------*/
			const title = svg
				.append("text")
				.attr("id", "title")
				.text("United States Educational Attainment");
			const description = svg
				.append("text")
				.attr("id", "description")
				.html(
					"Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014)"
				);
			//Centering title and description in top margin
			title
				.attr(
					"x",
					mg.l + d.w / 2 - title.node().getBoundingClientRect().width / 2
				)
				.attr("y", title.node().getBoundingClientRect().height / 2 + 20);
			description
				.attr(
					"x",
					mg.l + d.w / 2 - description.node().getBoundingClientRect().width / 2
				)
				.attr(
					"y",
					title.node().getBoundingClientRect().height +
						description.node().getBoundingClientRect().height +
						10
				);
		});
	});
});
