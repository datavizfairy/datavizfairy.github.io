// Define dimensions and margins dynamically
const margin = { top: 20, right: 20, bottom: 30, left: 30 };
let width = window.innerWidth - margin.left - margin.right; // Dynamic width
let height = window.innerHeight - margin.top - margin.bottom; // Dynamic height

// Create SVG with a responsive viewBox
const svg = d3.select("#container")
    .append("svg")
    .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Function to render the chart
function renderChart() {
    // Update dynamic dimensions
    width = window.innerWidth - margin.left - margin.right;
    height = window.innerHeight - margin.top - margin.bottom;

    // Update scales dynamically
    const xScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.Year))
        .range([0, width]);

    const yScale = d3.scalePoint()
        .domain(formattedDates)
        .range([height, 0])
        .padding(0.5);

    // Clear previous chart content
    svg.selectAll("*").remove();

    // Redraw axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));

    svg.append("g")
        .call(d3.axisLeft(yScale));

    // Redraw points
    svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.Year))
        .attr("cy", d => yScale(d.FullDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })))
        .attr("r", Math.max(3, width / 300)) // Dynamically adjust circle size
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

// Load data and call renderChart
let data, formattedDates;
d3.csv("./cleaned_data_with_dates.csv").then(csvData => {
    data = csvData.map(d => {
        d.FullDate = new Date(d["Full Date"]);
        d.Year = +d.Year;
        return d;
    });

    formattedDates = [...new Set(data.map(d => d.FullDate))]
        .sort((a, b) => a - b)
        .map(d => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

    renderChart();
});

// Handle window resize
window.addEventListener("resize", renderChart);
