// Define margins with extra top space for title and subtitle
const margin = { top: 60, right: 30, bottom: 170, left: 50 };

// Create the SVG with proportional scaling
const svg = d3.select("#container")
    .append("svg")
    .attr("preserveAspectRatio", "xMidYMid meet")
    .attr("viewBox", "0 -100 1000 500");

// Add a filter for the glowing effect
svg.append("defs")
    .append("filter")
    .attr("id", "glow")
    .attr("x", "-50%")
    .attr("y", "-50%")
    .attr("width", "200%")
    .attr("height", "200%")
    .append("feGaussianBlur")
    .attr("stdDeviation", 10)
    .attr("result", "coloredBlur");

// Add the glowing moon
svg.append("circle")
    .attr("cx", 960)
    .attr("cy", -30)
    .attr("r", 50)
    .attr("fill", "#fdfd96")
    .style("filter", "url(#glow)");

// Append Kanji
svg.append("text")
    .attr("x", 10)
    .attr("y", -65)
    .attr("text-anchor", "start")
    .attr("opacity", 0.8)
    .style("font-size", "16px")
    .style("font-family", "Montserrat, sans-serif") 
    .style("fill", "#ffffff")
    .text("京都");

// Append a title
svg.append("text")
    .attr("x", 10)
    .attr("y", -40)
    .attr("text-anchor", "start")
    .style("font-size", "18px")
    .style("font-family", "Montserrat, sans-serif") 
    .style("fill", "#ffffff")
    .text("KYOTO, JAPAN | Cherry Blossom Seasonality");

// Append a subtitle
svg.append("text")
    .attr("x", 10)
    .attr("y", -20)
    .attr("text-anchor", "start")
    .attr("opacity", 0.8)
    .style("font-size", "11px")
    .style("font-family", "Montserrat, sans-serif") 
    .style("fill", "#ffffff")
    .text("Cherry blossom trees in Kyoto, Japan are blossoming earlier in the season as global temperatures rise.");

// Append a group for the chart
const chart = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Tooltip reference
const tooltip = d3.select("#tooltip");

// Function to create sakura (cherry blossom)-shaped path
function sakuraPath(size) {
    const petals = 5;
    const radius = size * 0.2;
    const controlRadius = size * 0.4;
    let path = "M0,0 ";
    for (let i = 0; i < petals; i++) {
        const angle = (Math.PI * 2 * i) / petals;
        const nextAngle = (Math.PI * 2 * (i + 1)) / petals;
        const x1 = Math.cos(angle) * radius;
        const y1 = Math.sin(angle) * radius;
        const cx = Math.cos(angle + (nextAngle - angle) / 2) * controlRadius;
        const cy = Math.sin(angle + (nextAngle - angle) / 2) * controlRadius;
        const x2 = Math.cos(nextAngle) * radius;
        const y2 = Math.sin(nextAngle) * radius;
        path += `L${x1},${y1} Q${cx},${cy} ${x2},${y2} `;
    }
    path += "Z";
    return path;
}

// Function to calculate polynomial trendline
function calculateTrendline(data, degree) {
    const x = data.map(d => d.Year);
    const y = data.map(d => new Date(d.FullDate).getTime());

    const coefficients = regression.polynomial(
        x.map((xi, i) => [xi, y[i]]),
        { order: degree }
    ).equation;

    const trendline = x.map(xi => ({
        x: xi,
        y: coefficients.reduce((sum, coef, i) => sum + coef * Math.pow(xi, i), 0)
    }));

    return trendline;
}

// Draw the trendline
function drawTrendline(chart, trendline, xScale, yScale) {
    chart.append("path")
        .datum(trendline)
        .attr("fill", "none")
        .attr("stroke", "#ffd700") // Gold color for trendline
        .attr("stroke-width", 2)
        .attr("d", d3.line()
            .x(d => xScale(d.x))
            .y(d => yScale(d.y))
        );
}

// Draw Y-axis gridlines and custom ticks
function drawYAxis(yScale, chart, height, width) {
    const ticks = yScale.domain();
    const tickCount = 7;
    const spacedTicks = ticks.filter((_, i) => i % Math.ceil(ticks.length / tickCount) === 0);

    const yAxis = chart.append("g")
        .call(d3.axisLeft(yScale)
            .tickValues(spacedTicks)
            .tickFormat(d => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" }))
            .tickSize(0));

    yAxis.select(".domain").remove();
    yAxis.selectAll("text").style("fill", "#ffffff").attr("opacity", 0.8);

    chart.append("g")
        .selectAll("line")
        .data(spacedTicks)
        .enter()
        .append("line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", d => yScale(d))
        .attr("y2", d => yScale(d))
        .attr("stroke", "#ccc")
        .attr("stroke-width", 0.4)
        .attr("opacity", 0.4);
}

// Function to render the chart
function renderChart(data) {
    const width = 1000 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

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
        .attr("d", d => sakuraPath(20))
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

    const trendline = calculateTrendline(data, 2); // Polynomial trendline of degree 2
    drawTrendline(chart, trendline, xScale, yScale);
}

// Load data and render the chart
d3.csv("./cleaned_data_with_dates.csv").then(csvData => {
    const data = csvData.map(d => ({
        FullDate: d["Full Date"],
        Year: +d.Year,
        ...d
    }));

    renderChart(data);
});
