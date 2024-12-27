// Define margins and initial dimensions
const margin = { top: 20, right: 20, bottom: 40, left: 100 };
let width, height;

// Append an SVG to the container with a responsive viewBox
const svg = d3.select("#container")
    .append("svg")
    .attr("preserveAspectRatio", "xMidYMid meet")
    .attr("viewBox", "0 0 800 450") // Default viewBox size, scales automatically
    .classed("svg-content-responsive", true)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Tooltip reference
const tooltip = d3.select("#tooltip");

// Function to render the chart
function renderChart(data) {
    // Get container dimensions dynamically
    const containerWidth = document.getElementById("container").clientWidth;
    const containerHeight = document.getElementById("container").clientHeight;

    width = containerWidth - margin.left - margin.right;
    height = containerHeight - margin.top - margin.bottom;

    // Clear previous elements before redrawing
    svg.selectAll("*").remove();

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
        .attr("r", Math.max(3, width / 200)) // Adjust radius dynamically
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

// Load data and render chart
d3.csv("./cleaned_data_with_dates.csv").then(csvData => {
    const data = csvData.map(d => {
        d.FullDate = new Date(d["Full Date"]); // Parse Full Date
        d.Year = +d.Year; // Ensure Year is numeric
        return d;
    });

    renderChart(data); // Initial render

    // Redraw on window resize
    window.addEventListener("resize", () => renderChart(data));
});
