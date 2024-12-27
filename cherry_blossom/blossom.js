// Define margins
const margin = { top: 20, right: 20, bottom: 40, left: 80 };

// Select the container and create the SVG
const svg = d3.select("#container")
    .append("svg")
    .attr("preserveAspectRatio", "xMidYMid meet") // Ensures proportional scaling
    .attr("viewBox", "0 0 800 450"); // Base aspect ratio for the visualisation

// Append a group element with margins
const chart = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Tooltip reference
const tooltip = d3.select("#tooltip");

// Function to render the chart
function renderChart(data) {
    // Calculate dynamic dimensions
    const width = 800 - margin.left - margin.right; // Matches viewBox width
    const height = 450 - margin.top - margin.bottom; // Matches viewBox height

    // Clear any previous content
    chart.selectAll("*").remove();

    // Scales
    const xScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.Year))
        .range([0, width]);

    const yScale = d3.scalePoint()
        .domain(data.map(d => d.FullDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })))
        .range([height, 0])
        .padding(0.5);

    // Draw axes
    chart.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));

    chart.append("g")
        .call(d3.axisLeft(yScale));

    // Draw points
    chart.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.Year))
        .attr("cy", d => yScale(d.FullDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })))
        .attr("r", 5)
        .attr("fill", "steelblue")
        .on("mouseover", (event, d) => {
            tooltip.style("opacity", 1)
                .html(`Year: ${d.Year}<br>Date: ${d.FullDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}<br>Reference: ${d["Reference Name"]}`);
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
    const data = csvData.map(d => {
        d.FullDate = new Date(d["Full Date"]); // Parse Full Date
        d.Year = +d.Year; // Ensure Year is numeric
        return d;
    });

    renderChart(data); // Initial render
});
