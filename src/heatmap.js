export function createScatter(data, containerId) {
    // Group data by "Tactic" (Soft, Hard, Smart)
    const groupedData = d3.group(data, d => d.Tactic);

    // Set dimensions for scatter plots
    const width = 400, height = 300;
    const margin = { top: 10, right: 20, bottom: 25, left: 25 };

    // Define fixed strike zone boundaries
    const strikeZone = { x1: 0.3, y1: 0, x2: 0.7, y2: 0.7 };

    // Define clustering parameters for each tactic
    const tacticCenters = {
        Smart: { x: 0.5, y: 0.6, stdDev: 0.05 }, // Cluster high in the strike zone
        Soft: { x: 0.5, y: 0.1, stdDev: 0.06 }, // Cluster low in the strike zone
        Hard: { x: 0.7, y: 0.2, stdDev: 0.08 }  // Cluster down and away (bottom-right)
    };

    const tacticCounts ={
        Smart: 4,
        Soft: 6,
        Hard: 2
    };

    // Iterate over each tactic group and create a scatter plot
    groupedData.forEach((tacticData, tacticName) => {
        // Get clustering parameters for the current tactic
        const center = tacticCenters[tacticName] || { x: 0.5, y: 0.5, stdDev: 0.1 };

        const totalUsage = tacticData.reduce((sum, d) => sum + (d.SELF_SCORE || 0), 0);
        const percentage = ((totalUsage / data.reduce((sum, d) => sum + (d.SELF_SCORE || 0), 0)) * 100).toFixed(1);
        const nameCount = tacticCounts[tacticName];

        // Create a container for each tactic
        const container = d3.select(containerId)
            .append("div")
            .style("margin", "15px")
            .style("display", "inline-block");

        // Add a title for the tactic
        container.append("h2")
            .text(tacticName + ' Power')
            .style("text-align", "center");

        container.append("p")
            .text(`Usage: ${percentage}%; Frequency: ${totalUsage}; Types: ${nameCount}`)
            .style("text-align", "center")
            .style("font-size", "14px")
            .style("color", "gray");

        // Create an SVG for the scatter plot
        const svg = container
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Create scales
        const xScale = d3.scaleLinear().domain([0, 1]).range([0, width]);
        const yScale = d3.scaleLinear().domain([0, 1]).range([height, 0]);

        // Draw the fixed strike zone with custom styling
        svg.append("line") // Left vertical solid line
            .attr("x1", xScale(strikeZone.x1))
            .attr("y1", yScale(strikeZone.y2))
            .attr("x2", xScale(strikeZone.x1))
            .attr("y2", yScale(strikeZone.y1))
            .attr("stroke", "black")
            .attr("stroke-width", 4);

        svg.append("line") // Right vertical solid line
            .attr("x1", xScale(strikeZone.x2))
            .attr("y1", yScale(strikeZone.y2))
            .attr("x2", xScale(strikeZone.x2))
            .attr("y2", yScale(strikeZone.y1))
            .attr("stroke", "black")
            .attr("stroke-width", 4);

        svg.append("line") // Top dashed horizontal line
            .attr("x1", xScale(strikeZone.x1))
            .attr("y1", yScale(strikeZone.y2))
            .attr("x2", xScale(strikeZone.x2))
            .attr("y2", yScale(strikeZone.y2))
            .attr("stroke", "black")
            .attr("stroke-width", 4)
            .attr("stroke-dasharray", "6,3");

        svg.append("line") // Bottom dashed horizontal line
            .attr("x1", xScale(strikeZone.x1))
            .attr("y1", yScale(strikeZone.y1))
            .attr("x2", xScale(strikeZone.x2))
            .attr("y2", yScale(strikeZone.y1))
            .attr("stroke", "black")
            .attr("stroke-width", 4)
            .attr("stroke-dasharray", "6,3");

        // Generate points based on SELF_SCORE
        const points = tacticData.flatMap(d => {
            const numPoints = Math.round(d.SELF_SCORE || 0); // Number of points based on usage
            return Array.from({ length: numPoints }, () => ({
                x: randomNormal(center.x, center.stdDev), // Adjust x-center and spread
                y: randomNormal(center.y, center.stdDev)  // Adjust y-center and spread
            }));
        });

        // Plot scatter points

        const tacticColors = {
            Smart: '#2ca02c',
            Soft: '#1f77b4',
            Hard: '#d62728'
        };


        svg.selectAll(".scatter-point")
            .data(points)
            .enter()
            .append("circle")
            .attr('class', 'scatter-point')
            .attr("cx", d => xScale(d.x))
            .attr("cy", d => yScale(d.y))
            .attr("r", 4) // Slightly larger points for better visibility
            .attr("fill", tacticColors[tacticName]) // Red color for contrast
            .attr("opacity", 0.8) // Semi-transparent for layering
            .on("mouseover", function (event, d) {
                
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr('opacity', 0.8)
                    .attr("r", 6);
                
                svg.selectAll(".scatter-point")
                    .filter(function () {
                        return this !== event.target;
                    })
                    .transition()
                    .duration(200)
                    .attr("opacity", 0.3);
            })
            .on("mouseout", function() {

                svg.selectAll(".scatter-point")
                    .transition()
                    .duration(200)
                    .attr("opacity", 0.8)
                    .attr("r", 4);
            });
    });
}

// Helper function for normal distribution
function randomNormal(mean, stdDev) {
    let u = 0, v = 0;
    while (u === 0) u = Math.random(); // Avoid log(0)
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) * stdDev + mean;
}
