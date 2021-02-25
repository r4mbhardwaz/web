import {get } from "../http.js";

let oldStats = {}

function updateStatistics() {
    get("/api/db-stats", {}).then(JSON.parse).then(d => {
        const changes = subtract(d, oldStats);
        oldStats = d;

        try {
            chart.chart.data.labels.push(Date.now())
            chart.chart.data.datasets[0].data.push(changes.reads || 0);
            chart.chart.data.datasets[1].data.push(changes.writes || 0);
            chart.chart.data.datasets[2].data.push(changes.purges || 0);
            chart.chart.data.datasets[3].data.push(changes.inserts || 0);
            chart.update();
        } catch (error) {
            console.error(error);
        }
        console.log(chart);
    });
}

setInterval(updateStatistics, 5000);

const ctx = document.getElementById('db-stats').getContext('2d');
const chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            data: [],
            fill: false,
            label: "read operations"
        }, {
            data: [],
            fill: false,
            label: "write operations"
        }, {
            data: [],
            fill: false,
            label: "purge operations"
        }, {
            data: [],
            fill: false,
            label: "insert operations"
        }]
    },
    options: {
        responsive: true,
        title: { display: false },
        scales: {
            xAxes: [{
                display: true
            }],
            yAxes: [{
                display: true
            }]
        }
    }
});



// helper functions
function subtract(r1, r2) {
    return Object.keys(r1).reduce((a, k) => {
        if (typeof r1[k] == "object" && typeof r2[k] == "object") {
            a[k] = subtract(r1[k], r2[k]);
        } else {
            a[k] = r1[k] - r2[k];
        }
        return a;
    }, {});
}