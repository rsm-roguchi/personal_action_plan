// chart.js

export function createChart(containerId, jsonData) {
    // Helper function to group data by Tactic and calculate average percentiles
    function groupByTactic(data, tacticKey, percentileKey) {
        const rawData = Object.keys(data.ITEM).map(index => ({
            tactic: data[tacticKey][index],
            percentile: data[percentileKey][index]
        }));

        return Array.from(
            d3.group(
                rawData.filter(d => d.tactic), // Filter out null tactics
                d => d.tactic // Group by tactic
            ),
            ([tactic, values]) => ({
                tactic,
                avgPercentile: d3.mean(values, d => d.percentile)
            })
        );
    }

    // Group data for "Tactic" and "itemLevel" sections
    const tacticData = groupByTactic(jsonData, "Tactic", "PERCENTILE");
    const itemLevelData = groupByTactic(jsonData, "TACTIC", "PERCENTILE");

    // Shared chart dimensions
    const width = 800;
    const height = 400;
    const margin = { top: 30, right: 20, bottom: 40, left: 150 };

    // Render a chart section
    function renderSection(data, sectionTitle, offsetY) {
        const chartHeight = height - margin.top - margin.bottom;

        // Create SVG container
        const svg = d3.select(containerId)
            .append("svg")
            .attr("width", width)
            .attr("height", height + offsetY);

        // Create scales
        const xScale = d3.scaleLinear()
            .domain([0, 100]) // Percentile range
            .range([0, width - margin.left - margin.right]);

        const yScale = d3.scaleBand()
            .domain(data.map(d => d.tactic))
            .range([0, chartHeight])
            .padding(0.1);

        const colorScale = d3.scaleLinear()
            .domain([0, 50, 100])
            .range(['#0000FF', '#D3D3D3', '#FF0000']);

        // Add section title
        svg.append("text")
            .attr("x", margin.left)
            .attr("y", margin.top / 2)
            .attr("text-anchor", "start")
            .style("font-size", "16px")
            .style("font-weight", "bold")
            .text(sectionTitle);

        // Create a group for the chart
        const chart = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top + offsetY})`);


        // Add bars
        chart.selectAll(".bar")
            .data(data)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", 0)
            .attr("y", d => yScale(d.tactic))
            .attr("width", d => xScale(d.avgPercentile))
            .attr("height", yScale.bandwidth())
            .style("fill", d => colorScale(d.avgPercentile))
            .on('mouseover', function (event, d) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .style('fill', bar => colorScale(bar.avgPercentile))
                    .style("opacity", 1);
                
                chart.selectAll(".label")
                    .transition()
                    .duration(200)
                    .style("opacity", 1);

                chart.selectAll(".tick text")
                    .transition()
                    .duration(200)
                    .style("opacity", 1);
                
                chart.selectAll(".bar")
                    .filter(bar => bar !== d)
                    .transition()
                    .duration(200)
                    .style("fill", bar => colorScale(bar.avgPercentile))
                    .style("opacity", 0.2);
                
                chart.selectAll(".label")
                    .filter(label => label !== d)
                    .transition()
                    .duration(200)
                    .style("opacity", 0.2);
                
                chart.selectAll(".tick text")
                    .filter(function (text) {
                        return d3.select(this).text() !== d.tactic;
                    })
                    .transition()
                    .duration(200)
                    .style("opacity", 0.2);
            })
            .on("mouseout", function (event, d) {

                chart.selectAll(".bar")
                    .transition()
                    .duration(200)
                    .style("fill", bar => colorScale(bar.avgPercentile))
                    .style("opacity", 1);
                
                chart.selectAll(".label")
                    .transition()
                    .duration(200)
                    .style("opacity", 1);

                chart.selectAll(".tick text")
                    .transition()
                    .duration(200)
                    .style("opacity", 1);
            });

        // Add labels
        chart.selectAll(".label")
            .data(data)
            .enter()
            .append("text")
            .attr("class", "label")
            .attr("x", d => xScale(d.avgPercentile) + 5)
            .attr("y", d => yScale(d.tactic) + yScale.bandwidth() / 2)
            .attr("dy", "0.35em")
            .style("font-size", "12px")
            .style("opacity", 1)
            .text(d => d.avgPercentile.toFixed(1));

        // Add axes
        const xAxis = d3.axisBottom(xScale).ticks(10);
        const yAxis = d3.axisLeft(yScale);

        chart.append("g")
            .attr("transform", `translate(0,${chartHeight})`)
            .call(xAxis);

        chart.append("g").call(yAxis)
            .style("opacity", 1);
    }

    // Render "Value" section
    renderSection(tacticData, "Tactic Section", 0);

    // Render "Pitching" section (offset Y to avoid overlap)
    renderSection(itemLevelData, "Item Level Section", 0);
}
