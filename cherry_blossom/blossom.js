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

    // Parse Full Date manually and extract Year, Month, and Day
    data.forEach(d => {
        const [year, month, day] = d["Full Date"].split("-").map(Number);
        d.Year = year; // Use the Year directly
        d.Month = month; // Month as a number (1-12)
        d.Day = day; // Day of the month
    });

    // Create a custom chronological sorting function
    const sortedDates = [...new Set(data.map(d => `${d.Month}-${d.Day}`))]
        .sort((a, b) => {
            const [monthA, dayA] = a.split("-").map(Number);
            const [monthB, dayB] = b.split("-").map(Number);
            return monthA === monthB ? dayA - dayB : monthA - monthB;
        });

    // Scales
    const xScale = d3.scaleLinear()
        .domain(d3.extent(data, d => d.Year))
        .range([0, width]);

    const yScale = d3.scalePoint()
        .domain(sortedDates.map(date => {
            const [month, day] = date.split("-");
            return `${new Date(2023, month - 1, day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
        }))
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
            const formattedDate = `${d.Month}-${d.Day}`;
            const displayDate = `${new Date(2023, d.Month - 1, d.Day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
            return yScale(displayDate);
        })
        .attr("r", 5)
        .attr("fill", "steelblue")
        .on("mouseover", (event, d) => {
            tooltip.style("opacity", 1)
                .html(`Year: ${d.Year}<br>Date: ${d["Date"]}<br>Reference: ${d["Reference Name"]}`);
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
