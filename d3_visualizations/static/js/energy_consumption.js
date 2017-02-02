(function(){

var data_filename = "static/data/Total_International_Primary_Energy_Consumption.csv",
	worldmap_svg = "static/maps/worldIndiaHigh.svg",
	chart_id = "#chart",
	mini_chart_id = "#chart-mini",
	side_chart_id = "#chart-side",
	map_legend_id = "#map-legend",
	years_dropdown = "#years",
	selected_year_id = "#selected_year",
	selected_country_id = "#selected_country",
	countries_dropdown = "#countries",
	colors = ['#fee5d9','#fcbba1','#fc9272','#fb6a4a','#ef3b2c','#cb181d','#99000d'],
	thresholds = [1,5,10,15,20,35];

var selected_year, selected_country, years, countries, mini_chart_svg, side_chart_svg, color,
	margins = { top:10, bottom:80, left:40, right:50},
	width = 1000,
	height = 100,
	margins_side = { top:40, bottom:80, left:40, right:80},
	width_side = 200,
	height_side = 400,
	y_side = d3.scaleBand().rangeRound([height_side+margins_side.top,0]).padding(0.1),
    x_side = d3.scaleLinear().range([width_side,0]);		
	x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
    y = d3.scaleLinear().rangeRound([height, 0]);	

mini_chart_svg = d3.select(mini_chart_id).append('svg')
					.attr("width",width + margins.left + margins.right)
					.attr("height",height + margins.top + margins.bottom)
					.append("g")
					.attr("transform","translate("+margins.left+","+margins.top+")");

side_chart_svg = d3.select(side_chart_id).append('svg')
					.attr("width",width_side + margins_side.left + margins_side.right)
					.attr("height",height_side + margins_side.top + margins_side.bottom)
					.append("g")
					.attr("transform","translate("+margins_side.left+","+margins_side.top+")");

color = d3.scaleThreshold()
			.domain(thresholds)
			.range(colors);				
				

// load world map svg
d3.xml(worldmap_svg).mimeType("image/svg+xml").get(function(error, xml) {
  if (error) throw error;
  $(chart_id).html(xml.documentElement);
  d3.select(chart_id + " svg").attr('viewBox',"0 0 1050 650");

  d3.selectAll(chart_id+" svg g path")
  .on('mouseover',function(){
  	d3.select(this).classed("highlight-country",true);
  })
  .on('mouseout',function(){
  	d3.select(this).classed("highlight-country",false);
  })  

  loadData(data_filename);
});

// load data
function loadData(filename){

	d3.csv(filename, function(d){

		// parse data
		d3.keys(d).forEach(function(k){
			if(k.match(/^\d*$/)){
				d[k] = +d[k];
			}
		});
		return d;

	}, function(err, data){
		if(err) console.log(err);

		console.log(data);

		// get the years except the Country
		years = d3.keys(data[0])
			.filter(function(d){ return d.match(/^\d*$/ )})
			.map(function(d){ return +d });

		countries = data.map(function(d){ return d.Country }).sort();

		// selected year in years dropdown
		selected_year = years.slice(-1)[0];		

		// selected country in countries dropdown
		selected_country = "United States";

		createChart(data);

		$("body").tooltip({
	    	container: "body",
	    	html: true,
	    	selector: "path",
	    	placement: "right"
	    });

	});

}

// work on the chart
function createChart(data){

	createYearsDropdown(data);
	createCountriesDropdown(data);
	createDataOnMap(data);
	createGraph(data, {country:selected_country});
	createMapLegend();

}

// create the years dropdown
function createCountriesDropdown(data){

	d3.select(selected_country_id).text(selected_country);

	// years dropdown
	var li = d3.select(countries_dropdown).selectAll("li")
		.data(countries).enter()
		.append("li")
		.append("a")
		//.attr("href","#")
		.text(String);

	li.on('click', function(d){
		selected_country = d;
		d3.select(selected_country_id).text(selected_country);
		createGraph(data, {country:selected_country});
	});
}

// create the years dropdown
function createYearsDropdown(data){

	d3.select(selected_year_id).text(selected_year);

	// years dropdown
	var li = d3.select(years_dropdown).selectAll("li")
		.data(years).enter()
		.append("li")
		.append("a")
		// .attr("href","#")
		.text(String);

	li.on('click', function(d){
		selected_year = d;
		d3.select(selected_year_id).text(selected_year);
		createDataOnMap(data);
	});
}

// put data on the world map
function createDataOnMap(data){

	var filtered_data, values;

	filtered_data = data.map(function(d){
		var temp = {};
		temp.year = selected_year;
		temp.value = d[selected_year];
		temp.country = d.Country;
		return temp;
	});

	values = filtered_data
				.map(function(d){ return d.value })
				.filter(function(d){ return !isNaN(d) })
				.sort(function(a,b){ return b-a;});

	var sorted_desc = filtered_data.sort(function(a,b){ return b.value - a.value});

	createSideGraph(data, sorted_desc.slice(0,10));

	d3.selectAll(chart_id+" svg g path").style("fill","#CCCCCC");

	d3.selectAll(chart_id+" svg g path").each(function(){

		if(!d3.select(this).attr("data-title")){
			d3.select(this).attr("data-title", d3.select(this).attr("title"));
		}

		var title = d3.select(this).attr("data-title"),
			dat = filtered_data.filter(function(d){
				switch(d.country){
					case "Congo (Brazzaville)":
						return title == "Republic of Congo";
						break;
					case "Korea, North":
						return title == "North Korea";
						break;
					case "Korea, South":
						return title == "South Korea";
						break;
					case "Congo (Kinshasa)":
						return title == "Democratic Republic of Congo";
						break;
					case "Cote dIvoire (IvoryCoast)":
						return title.indexOf("Ivoire") != -1;
						break;	
					case "Laos":
						return title == "Lao People's Democratic Republic";
						break;	
					case "Former U.S.S.R.":
						return ["Russia","Kazakhstan","Uzbekistan","Kyrgyzstan",
								"Tajikistan","Turkmenistan","Azerbaijan","Georgia",
								"Ukraine","Belarus","Slovakia","Estonia","Latvia",
								"Lithuania","Moldova","Armenia"].indexOf(title) != -1;
						break;	
					case "Former Czechoslovakia":
						return title == "Czech Republic";
						break;																																					
					case "Former Serbia and Montenegro":
						return ["Serbia","Montenegro"].indexOf(title) != -1;
						break;	
					case "Serbia":
						return ["Serbia","Kosovo"].indexOf(title) != -1;
						break;
					case "Sudan":
						return ["Sudan","South Sudan"].indexOf(title) != -1;
						break;
					case "Norway":
						return ["Norway","Svalbard and Jan Mayen"].indexOf(title) != -1;
						break;	
					case "Former Yugoslavia":
						return ["Slovenia","Bosnia and Herzegovina",
								"Montenegro","Croatia","Macedonia",
								"Serbia","Kosovo"].indexOf(title) != -1;
						break;																																										
					default:
						return d.country == title || d.country.indexOf(title) != -1;
				}

			})[0];

		if(dat){

			if(isNaN(dat.value)){
				var fill = '#CCCCCC';
			} else {
				var fill = color(dat.value);
				d3.select(this).attr("title","<p>"+dat.country+"</p><p>Energy Consumption: "+dat.value+"</p><p>Year: "+dat.year+"</p>")
			}

			d3.select(this)
				.style('fill',fill)
				.on('click',function(d){
					selected_country = dat.country;
					d3.select(selected_country_id).text(selected_country);
					createGraph(data, dat);
				})			
		} else {
			d3.select(this)
				.on('click',function(d){
					mini_chart_svg.selectAll("*").remove();
					mini_chart_svg
						.append("text")
						.attr("id","no-data")
						.attr("x",width/2)
						.attr("y",height/2)
						.text("No Data Available")
				})
		}
	});
}

// create mini bar chart 
function createGraph(data, clicked_data){

	var filtered_data = data.filter(function(d){
		return d.Country == clicked_data.country;
	})[0];

	var chart_data = years.map(function(d){
		var temp = {};
		temp.value = filtered_data[d];
		temp.year = d;
		return temp;
	});

	x.domain(years);
  	y.domain([0, d3.max(chart_data, function(d) { return d.value; })]);

	mini_chart_svg.select("#no-data").remove();
	mini_chart_svg.selectAll(".axis").remove()

	mini_chart_svg.append("g")
	      .attr("class", "axis axis--x")
	      .attr("transform", "translate(0," + height + ")")
	      .call(d3.axisBottom(x));

	mini_chart_svg.append("g")
	      .attr("class", "axis axis--y")
	      .call(d3.axisLeft(y).ticks(5))
	    .append("text")
	      .attr("transform", "rotate(-90)")
	      .attr("y", 6)
	      .attr("dy", "0.71em")
	      .attr("text-anchor", "end")
	      .text("Frequency");

	var bars = mini_chart_svg.selectAll(".bar")
	    .data(chart_data, function(d){ return d.value});

	var bar = bars.enter().append("g")
				.attr("class", "bar ")
				.attr("transform",function(d){
					return "translate("+x(d.year)+","+y(d.value)+")";
				})
		        .attr("title", function(d){
		      		return "Value: "+d.value;
		      	})
			    .on('click', function(d){
			    	selected_year = d.year;
					d3.select(selected_year_id).text(selected_year);
					createDataOnMap(data);   	
				});	

	bar.append("rect")
      .attr("width", x.bandwidth())
      .attr("height", function(d) { return height - y(d.value); });

    bar.append("text")
    	.attr("transform",function(d){
    		var vert = - (height - y(d.value))*0.75; 
    		return "rotate(-90) translate("+vert+","+(x.bandwidth()/2 + 5)+")"
    	})
    	.text(function(d){ return d.value.toFixed(2)});

    bars.selectAll(".bar")
		.attr("transform",function(d){
			return "translate("+x(d.year)+","+y(d.value)+")";
		});

    bars.selectAll(".bar rect")
      	.attr("width", x.bandwidth())
      	.attr("height", function(d) { return height - y(d.value); }); 

    bar.selectAll(".bar text")
    	.attr("transform",function(d){
    		var vert = - (height - y(d.value))*0.75; 
    		return "rotate(-90) translate("+vert+","+(x.bandwidth()/2 + 5)+")"
    	})
    	.text(function(d){ return d.value.toFixed(2)});      	

    bars.exit().remove();  

}

// create mini bar chart 
function createSideGraph(data, chart_data){

	y_side.domain(chart_data.map(function(d){ return d.country; }).reverse());
	x_side.domain(d3.extent(chart_data, function(d) { return d.value; }));

	side_chart_svg.select("#no-data").remove();
	side_chart_svg.selectAll(".axis").remove()

	side_chart_svg.select("#no-data").remove();
	side_chart_svg.selectAll(".axis").remove()

	side_chart_svg.append("g")
	      .attr("class", "axis axis--x")
	      .attr("transform", "translate(0,0)")
	      .call(d3.axisTop(x_side).ticks(5));

	side_chart_svg.append("g")
	      .attr("class", "axis axis--y")
	      .attr("transform", "translate("+width_side+",0)")
	      .call(d3.axisRight(y_side).tickPadding(10))
	    .append("text")
	      .attr("transform", "rotate(-45)")
	      // .attr("y", 6)
	      .attr("dy", "0.71em")
	      .attr("text-anchor", "end")
	      .text("Frequency");

	var bars = side_chart_svg.selectAll(".bar")
	    .data(chart_data, function(d){ return d.value});

	var bar = bars.enter().append("g")
				.attr("class", "bar")
				.attr("transform",function(d){
					return "translate("+(x_side(d.value) || 0)+","+y_side(d.country)+")";
				})
		        .attr("title", function(d){
		      		return "Value: "+d.value;
		      	})
		      	.on('click', function(d){
			    	selected_country = d.country;
					d3.select(selected_country_id).text(selected_country);
					createGraph(data, {country:selected_country});	    	
			   	});		

	bar.append("rect")
      .attr("width", function(d) { 
      	return (width_side - x_side(d.value)) || 0; 
      })
      .attr("height", y_side.bandwidth());

    bar.append("text")
    	.attr("transform", function(d){
    		return "translate(-40,"+(y_side.bandwidth()/2)+")";
    	})
    	.text(function(d){ return d.value.toFixed(2)});

    bars.selectAll(".bar")
		.attr("transform",function(d){
			return "translate("+(x_side(d.value) || 0)+","+y_side(d.country)+")";
		});

    bars.selectAll(".bar rect")
    	.attr("width", function(d) { 
    		return (width_side - x_side(d.value)) || 0; 
    	})
      	.attr("height", y_side.bandwidth()); 

    bars.selectAll(".bar text")
    	.attr("transform", function(d){
    		return "translate(-40,"+(y_side.bandwidth()/2)+")";
    	})
    	.text(function(d){ return d.value.toFixed(2)});    

    bars.exit().remove();

}

function createMapLegend(){

	var svg = d3.select(map_legend_id)
				.append("svg")
				.attr("width","300px")
				.attr("height","40px");

	var xscale = d3.scaleBand()
				.domain(["0-1", "1-5", "5-10", "10-15", "15-20", "20-35", "35-100"])
				.rangeRound([0,280]);


	var xAxis = d3.axisBottom(x)
    			.scale(xscale)
				.tickSizeOuter(10);

	svg.selectAll("rect")
		.data(colors)
		.enter().append('rect')
		.attr("width","40px")
		.attr("height","40px")
		.attr("x", function(d,i){ return i*40; })
		.attr("y", "0px")
		.style("fill",function(d){ return d});

	svg.append("g")
	      .attr("class", "axis axis--x")
	      .call(xAxis);

	svg.append("text")
		.attr("x","90px")
		.attr("y","38px")
		.text("in Quadrillion Btu")

}

}());
