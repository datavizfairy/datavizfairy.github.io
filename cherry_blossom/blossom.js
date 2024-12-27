// Define initial margins
const margin = { top: 20, right: 20, bottom: 30, left: 80 };
let width, height;

// Create the SVG container with a viewBox for scaling
const svg = d3.select("#container")
    .append("svg")
    .attr("preserveAspectRatio", "xMidYMid meet")
    .attr("viewBox", "0 0 800 450") // Default viewBox size
    .append("g");

// Tooltip reference
const tooltip = d3.select("#tooltip");

// Function to render the chart
function renderChart(data) {
    // Update dynamic dimensions
    const containerWidth = document.getElementById("container").clientWidth;
    const containerHeight = document.getElementById("container").clientHeight;
    width = containerWidth - margin.left - margin.right;
    height = containerHeight - margin.top - margin.bottom;

    // Clear the SVG before re-rendering
    svg.selectAll("*").remove();

    // Update group position
    svg.attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.Year))
        .range([0, width]);

    const yScale = d3.scalePoint()
        .domain(data.map(d => d.FullDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })))
        .range([height, 0])
        .padding(0.5);

    // Draw axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));

    svg.append("g")
        .call(d3.axisLeft(yScale));

    // Draw scatterplot points
    svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.Year))
        .attr("cy", d => yScale(d.FullDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })))
        .attr("r", Math.max(3, width / 300)) // Dynamic circle size
        .attr("fill", "steelblue")
        .on("mouseover", (event, d) => {
            tooltip.style("opacity", 1)
                .html(`Year: ${d.Year}<br>Date: ${d.FullDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}<br>Reference: ${d["Reference Name"]}`);
        })
        .on("mousemove", event => {
            tooltip.style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", () => {
            tooltip.style("opacity", 0);
        });
}

// Load data and render the chart
d3.csv("./cleaned_data_with_dates.csv").then(csvData => {
    const data = csvData.map(d => {
        d.FullDate = new Date(d["Full Date"]);
        d.Year = +d.Year;
        return d;
    });

    renderChart(data); // Initial render

    // Redraw chart on window resize
    window.addEventListener("resize", () => renderChart(data));
});
