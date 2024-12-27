// Define margins with sufficient bottom space
const margin = { top: 20, right: 40, bottom: 20, left: 80 };

// Create the SVG with proportional scaling
const svg = d3.select("#container")
    .append("svg")
    .attr("preserveAspectRatio", "xMidYMid meet") // Ensures proportional scaling
    .attr("viewBox", "0 0 800 400"); // Increased height for more room

// Append a group with margins
const chart = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Append a title
svg.append("text")
    .attr("x", margin.left - 40) // Align to the left
    .attr("y", 0) // Slightly above the chart
    .attr("text-anchor", "start")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .style("fill", "black")
    .attr("font-family", "Trebuchet MS")
    .text("KYOTO, JAPAN");

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

// Function to render the chart
function renderChart(data) {
    // Chart dimensions
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

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
        .range([height, 0])
        .padding(0.5);

    // Draw axes
    chart.append("g")
        .attr("transform", `translate(0,${height})`) // Position X-axis at the bottom
        .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));

    chart.append("g")
        .call(d3.axisLeft(yScale).tickFormat(d => {
            const date = new Date(d);
            return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        }));

    // Data Points (Flowers)
    const shadesOfPink = ["#FFC0CB", "#FFB6C1", "#FF69B4", "#FF1493", "#ffffff"];

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
                .attr("d", d => sakuraPath(Math.random() * 15 + 15)) // Random size between 15 and 30
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
