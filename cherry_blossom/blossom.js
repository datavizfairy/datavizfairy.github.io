// Animation for Constant Rotation and Pulsating Size
function animateFlowers(flowers, xScale, yScale) {
    flowers.each(function (d) {
        const flower = d3.select(this);
        const rotationSpeed = Math.random() * 4000 + 3000; // Random speed (3-7 seconds)
        const pulseSpeed = Math.random() * 2000 + 1000; // Random pulse speed (1-3 seconds)

        // Rotate function
        function rotate() {
            flower.transition("rotate")
                .duration(rotationSpeed)
                .ease(d3.easeLinear)
                .attrTween("transform", function () {
                    const centerX = xScale(d.Year);
                    const centerY = yScale(d.FullDate);
                    return function (t) {
                        const angle = 360 * t; // Full rotation
                        return `translate(${centerX},${centerY}) rotate(${angle})`;
                    };
                })
                .on("end", rotate); // Loop rotation
        }

        // Pulse function
        function pulse() {
            flower.transition("pulse")
                .duration(pulseSpeed)
                .ease(d3.easeSinInOut)
                .attr("d", d => sakuraPath(Math.random() * 20 + 10)) // Random size between 10 and 30
                .on("end", pulse); // Loop pulsing
        }

        rotate(); // Start rotation
        pulse(); // Start pulsation
    });
}

// Function to render the chart
function renderChart(data) {
    const width = 1000 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // Clear previous content
    chart.selectAll("*").remove();

    const sortedDates = [...new Set(data.map(d => d.FullDate))].sort((a, b) => new Date(a) - new Date(b));

    const xScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.Year))
        .range([0, width]);

    const yScale = d3.scalePoint()
        .domain(sortedDates)
        .range([height, 0])
        .padding(0.5);

    chart.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(
            d3.axisBottom(xScale)
                .tickFormat(d3.format("d"))
                .tickSize(0)
        )
        .selectAll("text")
        .style("fill", "#ffffff");

    chart.select(".domain").remove();

    drawYAxis(yScale, chart, height, width);

    const shadesOfPink = ["#FFFFFF", "#EDC9EF", "#E068B3", "#DECFE9", "#F4A6DE"];

    const flowers = chart.selectAll(".flower")
        .data(data)
        .enter()
        .append("path")
        .attr("class", "flower")
        .attr("d", d => sakuraPath(20)) // Initial size
        .attr("fill", () => shadesOfPink[Math.floor(Math.random() * shadesOfPink.length)])
        .attr("opacity", 0.8)
        .attr("transform", d => `translate(${xScale(d.Year)},${yScale(d.FullDate)})`)
        .on("mouseover", (event, d) => {
            tooltip.style("opacity", 1)
                .html(`Year: ${d.Year}<br>Date: ${new Date(d.FullDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}<br>Reference: ${d["Reference Name"]}`);
        })
        .on("mousemove", event => {
            tooltip.style("left", `${event.pageX + 10}px`).style("top", `${event.pageY - 10}px`);
        })
        .on("mouseout", () => tooltip.style("opacity", 0));

    // Apply animations to flowers
    animateFlowers(flowers, xScale, yScale);

    // Trendline calculation and rendering (if applicable)
    const trendline = calculateTrendline(data, 2); // Polynomial trendline of degree 2
    drawTrendline(chart, trendline, xScale, yScale);
}
