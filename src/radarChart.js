export function createRadarChart(containerId, jsonData) {
    if (typeof Chart === "undefined") {
        throw new Error("Chart.js is required to render the radar chart. Please include it in your HTML.");
    }

    const container = document.getElementById(containerId);
    if (!container) {
        throw new Error(`No container found with ID: ${containerId}`);
    }

    const tacticKeys = Object.keys(jsonData.TACTIC);
    const tacticValues = tacticKeys.map((key) => jsonData.TACTIC[key]);
    const uniqueTactics = [...new Set(tacticValues)];

    const avgValues = uniqueTactics.map((tactic) => {
        const filteredValues = tacticKeys
            .filter((key) => jsonData.TACTIC[key] === tactic)
            .map((key) => parseFloat(jsonData.Value[key]));
        const avg = filteredValues.reduce((sum, val) => sum + val, 0) / filteredValues.length;
        return avg.toFixed(2);
    });

    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 800;
    container.appendChild(canvas);

    const data = {
        labels: uniqueTactics,
        datasets: [
            {
                label: "Average Tactic Value",
                data: avgValues,
                backgroundColor: "rgba(34, 202, 236, 0.2)",
                borderColor: "rgba(34, 202, 236, 1)",
                borderWidth: 2,
            },
        ],
    };

    const config = {
        type: "radar",
        data: data,
        options: {
            plugins: {
                title: {
                    display: true,
                    text: "Absolute Score",
                    font: {
                        size: 20,
                    },
                    padding: {
                        top: 10,
                        bottom: 10,
                    },
                },
            },
            elements: {
                line: {
                    tension: 0.3,
                },
            },
            scales: {
                r: {
                    angleLines: { display: true },
                    suggestedMin: 0,
                    suggestedMax: 4,
                    ticks: { stepSize: 1 },
                },
            },
        },
    };

    new Chart(canvas, config);
}
