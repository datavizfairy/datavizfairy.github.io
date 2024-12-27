// Dimensions and margins
const margin = { top: 20, right: 20, bottom: 30, left: 80 };
const width = 800 - margin.left - margin.right;
const height = 450 - margin.top - margin.bottom;

// Create SVG in the container
const svg = d3.select("#container")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Load data from the CSV
d3.csv("./cleaned_data_with_dates.csv").then(data => {
    console.log("Loaded Data:", data);

    // Parse numeric fields and full date
    data.forEach(d => {
        d.Year = +d.Year; // Ensure Year is numeric
        d.DayOfMonth = +d.DayOfMonth; // Ensure DayOfMonth is numeric
        // Parse FullDate as Date object with fallback for invalid formats
        d.FullDate = new Date(d.FullDate);
        if (isNaN(d.FullDate)) {
            console.error(`Invalid FullDate format for entry: ${d.FullDate}, raw value: ${d.FullDate}`);
        }
    });

    // Sort unique dates for the Y-axis
    const sortedDates = [...new Set(data.map(d => d.FullDate))]
        .filter(date => !isNaN(date)) // Remove invalid dates
        .sort((a, b) => a - b); // Chronological order using Date objects

    // Scales
    const xScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.Year)) // Extent of years
        .range([0, width]);

    const yScale = d3.scalePoint()
        .domain(sortedDates.map(d => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))) // Format for display
        .range([height, 0])
        .padding(0.5);

    // Add axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));

    svg.append("g")
        .call(d3.axisLeft(yScale));

    // Tooltip reference
    const tooltip = d3.select("#tooltip");

    // Add scatterplot points
    svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.Year))
        .attr("cy", d => {
            const formattedDate = d.FullDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            return yScale(formattedDate);
        })
        .attr("r", 5)
        .attr("fill", "steelblue")
        .on("mouseover", (event, d) => {
            tooltip.style("opacity", 1)
                .html(`Year: ${d.Year}<br>Date: ${d.FullDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}<br>Reference: ${d.ReferenceName}`);
        })
        .on("mousemove", event => {
            tooltip.style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", () => {
            tooltip.style("opacity", 0);
        });
}).catch(error => {
    console.error("Error loading the data:", error);
});
