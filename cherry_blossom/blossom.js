// Define margins with extra top space for title and subtitle
const margin = { top: 60, right: 30, bottom: 110, left: 50 };

// Create the SVG with proportional scaling
const svg = d3.select("#container")
    .append("svg")
    .attr("preserveAspectRatio", "xMidYMid meet")
    .attr("viewBox", "0 -85 1000 500"); // Add 50px padding above 

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
    .attr("cx", 950) // X position near the top-right (adjust as needed)
    .attr("cy", -30)  // Y position
    .attr("r", 50)   // Radius of the moon
    .attr("fill", "#fdfd96") // Soft yellow for the moon
    .style("filter", "url(#glow)"); // Apply the glow effect


// Append Kanji
svg.append("text")
    .attr("x", 15)
    .attr("y", -60) // Slightly below the title
    .attr("text-anchor", "start")
    .attr("opacity", 0.8)
    .style("font-size", "16px")
    .style("font-family", "Montserrat, sans-serif") 
    .style("fill", "#ffffff")
    .text("京都");


// Append a title
svg.append("text")
    .attr("x", 15) // Position relative to the left margin
    .attr("y", -40) // Position above the chart
    .attr("text-anchor", "start")
    .style("font-size", "18px")
    .style("font-family", "Montserrat, sans-serif") 
    .style("fill", "#ffffff")
    .text("KYOTO, JAPAN | Cherry Blossom Seasonality");

// Append a subtitle
svg.append("text")
    .attr("x", 15)
    .attr("y", -30) // Slightly below the title
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
    const petals = 5; // Number of petals
    const radius = size * 0.2;
    const controlRadius = size * 0.4; // Determines roundness of petals
    let path = "M0,0 "; // Start at the center
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
    path += "Z"; // Close the shape
    return path;
}


// Draw Y-axis gridlines and custom ticks
function drawYAxis(yScale, chart, height, width) {
    // Get all ticks and select approximately 5 evenly spaced ones
    const ticks = yScale.domain();
    const tickCount = 7; // Number of ticks to display
    const spacedTicks = ticks.filter((_, i) => i % Math.ceil(ticks.length / tickCount) === 0);



// Add Y-axis with custom ticks
const yAxis = chart.append("g")
    .call(d3.axisLeft(yScale)
        .tickValues(spacedTicks) // Show only selected ticks
        .tickFormat(d => {
            const date = new Date(d);
            return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        })
        .tickSize(0) // Remove tick marks
    );

// Remove the Y-axis line
yAxis.select(".domain").remove();

// Style the text (optional)
yAxis.selectAll("text")
    .style("fill", "#ffffff") // Change text colour
     .attr("opacity", 0.8);

    // Add horizontal gridlines for these ticks
    chart.append("g")
        .selectAll("line")
        .data(spacedTicks)
        .enter()
        .append("line")
        .attr("x1", 0) // Start at the left
        .attr("x2", width) // Extend to the right
        .attr("y1", d => yScale(d)) // Position based on tick value
        .attr("y2", d => yScale(d)) // Same position for the end
        .attr("stroke", "#ccc") // Light grey for gridlines
        .attr("stroke-width", 0.4) // Line thickness
        .attr("opacity", 0.4)
}





// Function to render the chart
function renderChart(data) {
    // Chart dimensions
    const width = 1000 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom; // Adjust height

    // Clear previous content
    chart.selectAll("*").remove();

    // Sort dates chronologically
    const sortedDates = [...new Set(data.map(d => d.FullDate))]
        .sort((a, b) => new Date(a) - new Date(b));

    // Scales
    const xScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.Year))
        .range([0, width]);

    const yScale = d3.scalePoint()
        .domain(sortedDates)
        .range([height, 0]) // Match new height
        .padding(0.5);

// Draw X-axis
    chart.append("g")
        .attr("transform", `translate(0,${height})`) // Position X-axis at the bottom
        .call(d3.axisBottom(xScale)
        .tickFormat(d3.format("d")) // Keep Year
        .tickSize(0)) // Remove tick mark
         .select(".domain") // Select the X-axis line
    .remove() // Remove the axis line
     .selectAll("text") // Select all text elements
        .style("fill", "#ffffff");
        

    // Draw Y-axis and gridlines with custom ticks
    drawYAxis(yScale, chart, height, width);
    

    // Data Points (Flowers)
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
        .on("mouseout", () => {
            tooltip.style("opacity", 0);
        });

    // Animation for Constant Rotation and Pulsating Size
    flowers.each(function (d, i) {
        const flower = d3.select(this);
        const rotationSpeed = Math.random() * 4000 + 50000; // Random speed (3-7 seconds)
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
                .attr("d", d => sakuraPath(Math.random() * 20 + 10)) // Random size between 15 and 30
                .on("end", pulse); // Loop pulsing
        }

        rotate(); // Start rotation
        pulse(); // Start pulsation
    });
}

// Load data and render the chart
d3.csv("./cleaned_data_with_dates.csv").then(csvData => {
    const data = csvData.map(d => ({
        FullDate: d["Full Date"],
        Year: +d.Year,
        ...d
    }));

    renderChart(data); // Initial render
});
