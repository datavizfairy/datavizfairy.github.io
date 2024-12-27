// Define margins with extra top space for title and subtitle
const margin = { top: 60, right: 40, bottom: 20, left: 80 };

// Create the SVG with proportional scaling
const svg = d3.select("#container")
    .append("svg")
    .attr("preserveAspectRatio", "xMidYMid meet")
    .attr("viewBox", "0 0 900 500"); // Increased height

// Append a title
svg.append("text")
    .attr("x", margin.left + 10) // Position relative to the left margin
    .attr("y", margin.top / 2) // Position above the chart
    .attr("text-anchor", "start")
    .style("font-size", "18px")
    .style("font-weight", "bold")
    .style("font-family", "Trebuchet MS")
    .text("KYOTO, JAPAN: Cherry Blossom Dates");

// Append a subtitle
svg.append("text")
    .attr("x", margin.left + 10)
    .attr("y", margin.top) // Slightly below the title
    .attr("text-anchor", "start")
    .style("font-size", "14px")
    .style("font-family", "Trebuchet MS")
    .style("fill", "#555")
    .text("Historical data of cherry blossom bloom dates");

// Append a group for the chart
const chart = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Tooltip reference
const tooltip = d3.select("#tooltip");

// Function to render the chart
function renderChart(data) {
    // Chart dimensions
    const width = 900 - margin.left - margin.right;
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

    // Draw axes
    chart.append("g")
        .attr("transform", `translate(0,${height})`) // Position X-axis at the bottom
        .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));

    chart.append("g")
        .call(d3.axisLeft(yScale).tickFormat(d => {
            const date = new Date(d);
            return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        }));

    // Draw sakura-shaped data points and animations...
}
