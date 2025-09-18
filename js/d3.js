var w = 550, h = 300, margin = {top: 30, right: 15, bottom: 40, left: 45};
    var width = w - margin.left - margin.right;
    var height = h - margin.top - margin.bottom;

    var dataset = [15, 16, 17, 19, 20, 18, 17, 19, 15, 16, 18, 17, 19, 20, 18, 16, 15, 17, 19, 20];
    var stationNames = dataset.map((d, i) => "S" + (i + 1));

    var xScale = d3.scale.ordinal()
        .domain(d3.range(dataset.length))
        .rangeRoundBands([0, width], 0.15);

    var yScale = d3.scale.linear()
        .domain([0, d3.max(dataset)])
        .range([height, 0]);

    var svg = d3.select("#tempChart")
        .append("svg")
        .attr("width", w)
        .attr("height", h)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(dataset.length);
    var yAxis = d3.svg.axis().scale(yScale).orient("left");

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 5)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Temp (°C)");

    var bars = svg.selectAll(".bar")
        .data(dataset)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", (d, i) => xScale(i))
        .attr("y", d => yScale(d))
        .attr("width", xScale.rangeBand())
        .attr("height", d => height - yScale(d))
        .attr("fill", "darkgray"); 

    svg.selectAll(".temp-label")
        .data(dataset)
        .enter()
        .append("text")
        .attr("class", "temp-label")
        .text(d => d)
        .attr("x", (d, i) => xScale(i) + xScale.rangeBand() / 2)
        .attr("y", d => yScale(d) + 15)
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .attr("font-size", "9px");

    svg.selectAll(".station-label")
        .data(dataset)
        .enter()
        .append("text")
        .attr("class", "station-label")
        .text((d, i) => stationNames[i])
        .attr("x", (d, i) => xScale(i) + xScale.rangeBand() / 2)
        .attr("y", d => yScale(d) + (height - yScale(d)) / 2)
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .attr("font-size", "8px")
        .attr("transform", (d, i) => {
            let x = xScale(i) + xScale.rangeBand() / 2;
            let y = yScale(d) + (height - yScale(d)) / 2;
            return `rotate(-90, ${x}, ${y})`;
        });

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll("text")
        .text((d, i) => i + 1)
        .style("text-anchor", "middle")
        .attr("font-size", "9px");

    svg.append("text")
        .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.bottom - 10) + ")")
        .style("text-anchor", "middle")
        .text("Station name");

    function updateChartWithWeather(lat, lon) {
        var apiKey = "65074012804cee478133b2d1ef3e721b";
        var url = `https://api.openweathermap.org/data/2.5/find?lat=${lat}&lon=${lon}&cnt=20&units=metric&appid=${apiKey}`;

        d3.json(url, function(error, data) {
            if (error) {
                console.error("Error fetching weather data:", error);
                return;
            }

            var newDataset = data.list.map(station => Math.round(station.main.temp));
            var newNames = data.list.map(station => station.name);

            xScale.domain(d3.range(newDataset.length));
            yScale.domain([0, d3.max(newDataset)]);

            svg.select(".y.axis").transition().duration(1000).call(yAxis);

            bars.data(newDataset)
                .transition()
                .duration(2000)
                .attr("x", (d, i) => xScale(i))
                .attr("y", d => yScale(d))
                .attr("width", xScale.rangeBand())
                .attr("height", d => height - yScale(d))
                .attr("fill", "rgb(52, 152, 219)"); 

            svg.selectAll(".temp-label")
                .data(newDataset)
                .transition()
                .duration(2000)
                .text(d => d)
                .attr("x", (d, i) => xScale(i) + xScale.rangeBand() / 2)
                .attr("y", d => yScale(d) + 15);

            svg.selectAll(".station-label")
                .data(newDataset)
                .transition()
                .duration(2000)
                .text((d, i) => newNames[i])
                .attr("x", (d, i) => xScale(i) + xScale.rangeBand() / 2)
                .attr("y", d => yScale(d) + (height - yScale(d)) / 2)
                .attr("transform", (d, i) => {
                    let x = xScale(i) + xScale.rangeBand() / 2;
                    let y = yScale(d) + (height - yScale(d)) / 2;
                    return `rotate(-90, ${x}, ${y})`;
                });

            svg.select(".x.axis")
                .transition()
                .duration(2000)
                .call(xAxis)
                .selectAll("text")
                .text((d, i) => i + 1);

            stationNames = newNames;
        });
    }

    function getLocationAndUpdateChart() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                updateChartWithWeather(position.coords.latitude, position.coords.longitude);
            }, function(error) {
                console.error("Error obtaining location:", error);
            });
        } else {
            console.error("Geolocation is not supported by this browser.");
        }
    }

    d3.select("#updateweather").on("click", getLocationAndUpdateChart);