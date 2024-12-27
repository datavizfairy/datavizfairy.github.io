// Define margins with sufficient bottom space
const margin = { top: 40, right: 40, bottom: 20, left: 100 }; // Increased bottom margin

// Create the SVG with proportional scaling
const svg = d3.select("#container")
    .append("svg")
    .attr("preserveAspectRatio", "xMidYMid meet") // Ensures proportional scaling
    .attr("viewBox", "0 0 900 400"); // Increased height for more room (400 instead of 300)

// Append a group with margins
const chart = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Append a title
svg.append("text")
    .attr("x", margin.left-40) // Align to the left
    .attr("y", margin.top/2) // Slightly above the chart
    .attr("text-anchor", "start")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .style("fill", "black")
    .attr("font-family", "Trebuchet MS")
    .text("Kyoto Cherry Blossom Data");

// Tooltip reference
const tooltip = d3.select("#tooltip");

// Function to render the chart
function renderChart(data) {
    // Chart dimensions
    const width = 900 - margin.left - margin.right;
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
        .call(d3.axisBottom(xScale).tickFormat(d3.format("d")))
        .selectAll("text")
        .style("text-anchor", "middle"); // Center-align text

    chart.append("g")
        .call(d3.axisLeft(yScale).tickFormat(d => {
            const date = new Date(d);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }));

    // Draw scatterplot points
    chart.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.Year))
        .attr("cy", d => yScale(d.FullDate))
        .attr("r", 5)
        .attr("fill", "steelblue")
        .on("mouseover", (event, d) => {
            tooltip.style("opacity", 1)
                .html(`Year: ${d.Year}<br>Date: ${new Date(d.FullDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}<br>Reference: ${d["Reference Name"]}`);
        })
        .on("mousemove", event => {
            tooltip.style("left", `${event.pageX + 10}px`)
                .style("top", `${event.pageY - 20}px`);
        })
        .on("mouseout", () => {
            tooltip.style("opacity", 0);
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
