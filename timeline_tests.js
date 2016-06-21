// building off http://bl.ocks.org/bunkat/2338034
//
var json_fname = 'Climate_change.json'

d3.json(json_fname, function(error, data) {
	data.forEach(function(d) {
		d.lane = 0;
		d.id = d.title;
		// d.start = +d.pubdate.split('-')[0];
		// d.end = d.start + 1;
		d.start = new Date(d.pubdate);
		d.end = new Date(d.pubdate);
		d.end = new Date(d.end.setFullYear(d.end.getFullYear()+5));
	})
	data = data.sort(function(a, b) {
			return d3.descending(a.eigenfactor_score, b.eigenfactor_score); 
		}).slice(0,25);
	console.log(data);
	var lanes = ["Climate change"],
				laneLength = lanes.length,
			timeBegin = d3.min(data, function(d) { return d.start; }),
			timeEnd = d3.max(data, function(d) { return d.end; });
	console.log(timeBegin);
	console.log(timeEnd);

		var m = [20, 15, 15, 120], //top right bottom left
			w = 960 - m[1] - m[3],
			h = 500 - m[0] - m[2],
			miniHeight = laneLength * 12 + 50,
			mainHeight = h - miniHeight - 50;

		//scales
		// var x = d3.scale.linear()
		var x = d3.time.scale()
				.domain([timeBegin, timeEnd])
				.range([0, w]);
		// var x1 = d3.scale.linear()
		var x1 = d3.time.scale()
				.range([0, w]);
		var y1 = d3.scale.linear()
				.domain([0, laneLength])
				.range([0, mainHeight]);
		var y2 = d3.scale.linear()
				.domain([0, laneLength])
				.range([0, miniHeight]);

		var chart = d3.select("body")
					.append("svg")
					.attr("width", w + m[1] + m[3])
					.attr("height", h + m[0] + m[2])
					.attr("class", "chart");
		
		chart.append("defs").append("clipPath")
			.attr("id", "clip")
			.append("rect")
			.attr("width", w)
			.attr("height", mainHeight);

		var main = chart.append("g")
					.attr("transform", "translate(" + m[3] + "," + m[0] + ")")
					.attr("width", w)
					.attr("height", mainHeight)
					.attr("class", "main");

		var mini = chart.append("g")
					.attr("transform", "translate(" + m[3] + "," + (mainHeight + m[0]) + ")")
					.attr("width", w)
					.attr("height", miniHeight)
					.attr("class", "mini");
		
		//main lanes and texts
		main.append("g").selectAll(".laneLines")
			.data(data)
			.enter().append("line")
			.attr("x1", m[1])
			.attr("y1", function(d) {return y1(d.lane);})
			.attr("x2", w)
			.attr("y2", function(d) {return y1(d.lane);})
			.attr("stroke", "lightgray")

		main.append("g").selectAll(".laneText")
			.data(lanes)
			.enter().append("text")
			.text(function(d) {return d;})
			.attr("x", -m[1])
			.attr("y", function(d, i) {return y1(i + .5);})
			.attr("dy", ".5ex")
			.attr("text-anchor", "end")
			.attr("class", "laneText");
		
		//mini lanes and texts
		mini.append("g").selectAll(".laneLines")
			.data(data)
			.enter().append("line")
			.attr("x1", m[1])
			.attr("y1", function(d) {return y2(d.lane);})
			.attr("x2", w)
			.attr("y2", function(d) {return y2(d.lane);})
			.attr("stroke", "lightgray");

		mini.append("g").selectAll(".laneText")
			.data(lanes)
			.enter().append("text")
			.text(function(d) {return d;})
			.attr("x", -m[1])
			.attr("y", function(d, i) {return y2(i + .5);})
			.attr("dy", ".5ex")
			.attr("text-anchor", "end")
			.attr("class", "laneText");

		var xAxisMini = d3.svg.axis()
			.orient("bottom")
			.ticks(5)
			.scale(x);

		mini.append("g")
			.attr("class", "xaxis")
			.attr("transform", "translate(0," + (miniHeight) + ")")
			.call(xAxisMini);

		var itemRects = main.append("g")
							.attr("clip-path", "url(#clip)");
		
		//mini item rects
		mini.append("g").selectAll("miniItems")
			.data(data)
			.enter().append("rect")
			.attr("class", function(d) {return "miniItem" + d.lane;})
			.attr("x", function(d) {return x(d.start);})
			.attr("y", function(d) {return y2(d.lane + .5) - 5;})
			.attr("width", function(d) { return x(d.end) - x(d.start);})
			.attr("height", 10);

		//mini labels
		mini.append("g").selectAll(".miniLabels")
			.data(data)
			.enter().append("text")
			.text(function(d) {return d.id;})
			.attr("x", function(d) {return x(d.start);})
			.attr("y", function(d) {return y2(d.lane + .5);})
			.attr("dy", ".5ex");

		//brush
		var brush = d3.svg.brush()
							.x(x)
							.on("brush", display);

		mini.append("g")
			.attr("class", "x brush")
			.call(brush)
			.selectAll("rect")
			.attr("y", 1)
			.attr("height", miniHeight - 1);

		display();
		
		function display() {
			var marks, labels,
				minExtent = brush.extent()[0],
				maxExtent = brush.extent()[1],
				visItems = data.filter(function(d) {return d.start < maxExtent && d.end > minExtent;});

			mini.select(".brush")
				.call(brush.extent([minExtent, maxExtent]));

			x1.domain([minExtent, maxExtent]);

			//update main item marks
			marks = itemRects.selectAll("circle")
			        .data(visItems, function(d) { return d.id; })
				.attr("cx", function(d) {return x1(d.start);});
				// .attr("x", function(d) {return x1(d.start);})
				// .attr("width", function(d) {return x1(d.end) - x1(d.start);});
			
			marks.enter().append("circle")
				.attr("class", function(d) {return "miniItem" + d.lane;})
				.attr("cx", function(d) {return x1(d.start);})
				.attr("cy", function(d) {return y1(d.lane) + mainHeight/2;})
				.attr('r', 25);
				// .attr("width", function(d) {return x1(d.end) - x1(d.start);})
				// .attr("height", function(d) {return .8 * y1(1);});

			marks.exit().remove();

			//update the item labels
			var rotate = -20;
			labels = itemRects.selectAll("text")
				.data(visItems, function (d) { return d.id; })
				// .attr("x", function(d) {return x1(Math.max(d.start, minExtent) + 2);});
				.attr("x", function(d) {d.x = x1(Math.max(d.start, minExtent)); return d.x;})
				.attr("transform", function(d) { return "rotate(" + rotate + "," + d.x + "," + d.y + ")"; });

			labels.enter().append("text")
				.text(function(d) {return d.id;})
				.attr("x", function(d) {d.x = x1(Math.max(d.start, minExtent)); return d.x;})
				.attr("y", function(d) {d.y = y1(d.lane + .5); return d.y;})
				.attr("transform", function(d) { return "rotate(" + rotate + "," + d.x + "," + d.y + ")"; })
				.attr("text-anchor", "end");

			labels.exit().remove();

		}
});
