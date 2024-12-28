// Define margins with extra top space for title and subtitle
const margin = { top: 60, right: 30, bottom: 170, left: 50 };

// Create the SVG with proportional scaling
const svg = d3.select("#container")
    .append("svg")
    .attr("preserveAspectRatio", "xMidYMid meet")
    .attr("viewBox", "0 -100 1000 500"); // Add 50px padding above 

// Add a filter for the glowing effect
svg.append("defs")
    .append("filter")
    .attr("id", "glow")
    .attr("x", "-50%") // Extend filter region to prevent cutoff
    .attr("y", "-50%") // Extend filter region
    .attr("width", "200%") // Double the width of the filter region
    .attr("height", "200%") // Double the height of the filter region
    .append("feGaussianBlur")
    .attr("stdDeviation", 10) // Controls the blur intensity
    .attr("result", "coloredBlur");

// Add the glowing moon
svg.append("circle")
    .attr("cx", 960) // X position near the top-right
    .attr("cy", -30)  // Y position
    .attr("r", 50)   // Radius of the moon
    .attr("fill", "#fdfd96") // Soft yellow for the moon
    .style("filter", "url(#glow)"); // Apply the glow effect

// Append Kanji
svg.append("text")
    .attr("x", 10)
    .attr("y", -65) // Position for the Kanji
    .attr("text-anchor", "start")
    .attr("opacity", 0.8)
    .style("font-size", "16px")
    .style("font-family", "Montserrat, sans-serif") 
    .style("fill", "#ffffff")
    .text("京都");

// Append a title
svg.append("text")
    .attr("x", 10) // Position relative to the left margin
    .attr("y", -40) // Position above the chart
    .attr("text-anchor", "start")
    .style("font-size", "18px")
    .style("font-family", "Montserrat, sans-serif") 
    .style("fill", "#ffffff")
    .text("KYOTO, JAPAN | Cherry Blossom Seasonality");

// Append a subtitle
svg.append("text")
    .attr("x", 10)
    .attr("y", -20) // Position for the subtitle
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
        .call(d3.axisBottom(xScale).tickFormat(d3.format("d")).tickSize(0))
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

    flowers.each(function(d, i) {
        const flower = d3.select(this);
        const rotationSpeed = Math.random() * 4000 + 50000;
        const pulseSpeed = Math.random() * 2000 + 1000;

        function rotate() {
            flower.transition("rotate")
                .duration(rotationSpeed)
                .ease(d3.easeLinear)
                .attrTween("transform", function() {
                    const centerX = xScale(d.Year);
                    const centerY = yScale(d.FullDate);
                    return function(t) {
                        const angle = 360 * t;
                        return `translate(${centerX},${centerY}) rotate(${angle})`;
                    };
                })
                .on("end", rotate);
        }

        function pulse() {
            flower.transition("pulse")
                .duration(pulseSpeed)
                .ease(d3.easeSinInOut)
                .attr("d", d => sakuraPath(Math.random() * 20 + 10))
                .on("end", pulse);
        }

        rotate();
        pulse();
    });
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
