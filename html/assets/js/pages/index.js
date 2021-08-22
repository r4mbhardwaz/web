import "../http.js";

function updateStatistics() {
    axios.get("/api/db-stats", {}).then(x => x.data).then(d => {
        let oldStats = {}
        let oldDate = undefined;

        for (let i = 0; i < d.length; i++) {
            const element = d[i];
            let changes = subtract(element, oldStats);

            function sameDay(d1, d2) {
                return d1.getFullYear() === d2.getFullYear() &&
                    d1.getMonth() === d2.getMonth() &&
                    d1.getDate() === d2.getDate();
            }

            if (typeof oldDate != "undefined" && !sameDay(new Date(element.timestamp * 1000), new Date(oldDate * 1000))) {
                // the dates are on two different days
                oldStats = element;
                changes = element;
            }

            oldStats = element;
            oldDate = element.timestamp;
            try {
                dbChart.chart.data.labels.push(new Date(element.timestamp * 1000));
                dbChart.chart.data.datasets[0].data.push(changes.stats.reads || 0);
                dbChart.chart.data.datasets[1].data.push(changes.stats.writes || 0);
                dbChart.chart.data.datasets[2].data.push(changes.stats.purges || 0);
                dbChart.chart.data.datasets[3].data.push(changes.stats.inserts || 0);
                dbChart.update();

            } catch (error) {
                console.error(error);
            }
        }

        const changes = subtract(d[d.length - 1], d[0]);
        for (const code in changes["stats"]["codes"]) {
            if (Object.hasOwnProperty.call(changes["stats"]["codes"], code)) {
                const amount = changes["stats"]["codes"][code];
                if (amount > 0) {
                    accessChart.chart.data.datasets[0].data.push(amount);
                    accessChart.chart.data.datasets[0].backgroundColor.push(getColorForHTTPCode(code));
                    accessChart.chart.data.labels.push(`${code}`); // - ${HTTP_CODES[code]}`)
                }
            }
        }
        accessChart.update();
    });
}

function getColorForHTTPCode(code) {
    return {
        200: "#1dc55890",
        201: "#1dc55890",
        202: "#1dc55890",
        204: "#ff9b3f90",
        206: "#ff9b3f90",
        301: "#ff9b3f90",
        302: "#ff9b3f90",
        304: "#ff9b3f90",
        400: "#ff9b3f90",
        401: "#ff3f3f90",
        403: "#ff3f3f90",
        404: "#ff9b3f90",
        405: "#ff3f3f90",
        406: "#ff3f3f90",
        409: "#ff9b3f90",
        412: "#ff3f3f90",
        413: "#ff3f3f90",
        414: "#ff3f3f90",
        415: "#ff3f3f90",
        416: "#ff3f3f90",
        417: "#ff3f3f90",
        500: "#ff3f3f90",
        501: "#ff3f3f90",
        503: "#ff3f3f90"
    }[code];
}


const HTTP_CODES = { 200: 'OK', 201: 'Created', 202: 'Accepted', 204: 'No Content', 206: 'Partial Content', 301: 'Moved Permanently', 302: 'Found', 304: 'Not Modified', 400: 'Bad Request', 401: 'Unauthorized', 403: 'Forbidden', 404: 'Not Found', 405: 'Method Not Allowed', 406: 'Not Acceptable', 409: 'Conflict', 412: 'Precondition Failed', 413: 'Payload Too Large', 414: 'URI Too Long', 415: 'Unsupported Media Type', 416: 'Range Not Satisfiable', 417: 'Expectation Failed', 500: 'Internal Server Error', 501: 'Not Implemented', 503: 'Service Unavailable' }

updateStatistics();


window.dbCtx = document.getElementById('db-stats').getContext('2d');
window.accessCtx = document.getElementById('access-stats').getContext('2d');
window.dbChart = new Chart(dbCtx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            data: [],
            fill: false,
            label: "read",
            borderColor: "#1dc55890",
            radius: 0,
            pointRadius: 2,
            pointHoverRadius: 2,
            pointBackgroundColor: "#1dc558"
        }, {
            data: [],
            fill: false,
            label: "write",
            borderColor: "#ff3f3f90",
            radius: 0,
            pointRadius: 2,
            pointHoverRadius: 2,
            pointBackgroundColor: "#ff3f3f"
        }, {
            data: [],
            fill: false,
            label: "purge",
            borderColor: "#3f65ff90",
            radius: 0,
            pointRadius: 2,
            pointHoverRadius: 2,
            pointBackgroundColor: "#3f65ff"
        }, {
            data: [],
            fill: false,
            label: "insert",
            borderColor: "#ff9b3f90",
            radius: 0,
            pointRadius: 2,
            pointHoverRadius: 2,
            pointBackgroundColor: "#ff9b3f"
        }]
    },
    options: {
        responsive: true,
        title: { display: false },
        scales: {
            xAxes: [{
                type: 'time',
                time: {
                    unit: 'day',
                    displayFormats: {
                        day: 'MMM D',
                    },
                    tooltipFormat: 'MMM D h:mm a',
                },
                display: true,
                ticks: {
                    autoSkip: true,
                    maxRotation: 0,
                    minRotation: 0
                }
            }],
            yAxes: [{
                type: 'logarithmic',
                display: true,
                ticks: {
                    autoSkip: false,
                    min: 0,
                    callback: function(value) {
                        return parseFloat(value)
                    },
                    userCallback: function(item, index) {
                        if (!(index % 5)) return item;
                    }
                }
            }]
        },
        tooltips: {
            backgroundColor: '#f1f1f1',
            titleFontSize: 14,
            titleFontColor: '#333333',
            bodyFontColor: '#333333',
            bodyFontSize: 13,
            displayColors: false
        },
        elements: {
            point: {
                radius: 0
            },
            line: {
                tension: 0.1
            }
        }
    }
});

window.accessChart = new Chart(accessCtx, {
    type: 'bar',
    data: {
        labels: [],
        datasets: [{
            data: [],
            fill: false,
            radius: 0,
            pointRadius: 2,
            pointHoverRadius: 2,
            data: [],
            backgroundColor: []
        }]
    },
    options: {
        responsive: true,
        title: { display: false },
        scales: {
            xAxes: [{

            }],
            yAxes: [{
                type: 'logarithmic',
                display: true,
                ticks: {
                    autoSkip: false,
                    min: 0,
                    callback: function(value) {
                        return parseFloat(value)
                    },
                    userCallback: function(item, index) {
                        if (!(index % 5)) return item;
                    }
                },
            }]
        },
        legend: {
            display: false
        },
        tooltips: {
            backgroundColor: '#f1f1f1',
            titleFontSize: 14,
            titleFontColor: '#333333',
            bodyFontColor: '#333333',
            bodyFontSize: 13,
            displayColors: false,
            callbacks: {
                title: function(tooltipItem, data) {
                    return tooltipItem[0].xLabel + " - " + HTTP_CODES[parseInt(tooltipItem[0].label)]
                }
            }
        },
        elements: {
            point: {
                radius: 0
            }
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

