// Define margins
const margin = { top: 20, right: 20, bottom: 40, left: 100 };

// Create SVG
const svg = d3.select("#container")
    .append("svg")
    .attr("preserveAspectRatio", "xMidYMid meet")
    .attr("viewBox", "0 0 800 450");

// Append a group with margins
const chart = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Tooltip setup
const tooltip = d3.select("#tooltip");

// Function to render the chart
function renderChart(data) {
    // Chart dimensions
    const width = 800 - margin.left - margin.right;
    const height = 450 - margin.top - margin.bottom;

    // Clear previous elements
    chart.selectAll("*").remove();

    // Ensure dates are sorted chronologically
    const sortedDates = [...new Set(data.map(d => d.FullDate))]
        .sort((a, b) => new Date(a) - new Date(b)); // Sort using Date objects

    // Scales
    const xScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.Year)) // Year range
        .range([0, width]);

    const yScale = d3.scalePoint()
        .domain(sortedDates) // Use sorted dates as the domain
        .range([height, 0])
        .padding(0.5);

    // Draw axes
    chart.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));

    chart.append("g")
        .call(d3.axisLeft(yScale).tickFormat(d => {
            // Format Date objects for display
            const date = new Date(d);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }));

    // Draw scatterplot points
    chart.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.Year))
        .attr("cy", d => yScale(d.FullDate)) // Match Y position with sorted domain
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
        FullDate: d["Full Date"], // Keep as string for sorting
        Year: +d.Year, // Ensure Year is numeric
        ...d
    }));

    renderChart(data); // Initial render
});
