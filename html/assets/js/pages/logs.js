'use strict';


window.latestTimestamp = null;

const importances = {
    "I": `<span class="blue">Info</span>`,
    "W": `<span class="orange">Warning</span>`,
    "E": `<span class="red">Error</span>`,
    "S": `<span class="green">Success</span>`,
    "C": `<span class="red">Critical</span>`
}
const severity = {
    "S": 0,
    "I": 1,
    "W": 2,
    "E": 3,
    "C": 4
}


function getAllLogs() {
    return new Promise((res, rej) => {
        axios.get(`/api/logs/get?min=${currentFilter.timeframe}&sev=${currentFilter.severity}`)
        .then(x => x.data)
        .then(d => {
            if (d.success) {
                id("entries").text(`${d.length} Entries`);
                res({
                    logs: d.logs,
                    length: d.length
                });
            } else {
                throw new Error(d.error);
            }
        }).catch(er => {
            alert("Failed to retrieve logs!", er);
        });
    })
}

function displayLogs(data, max = 50) {
    let logs = data.logs;
    let length = data.length;
    
    let code = "";
    
    id("log-entries").get(0).innerHTML = "";

    for (let i = 0; i < (length > max ? max : length); i++) {
        let log = logs[i];
        let el = document.createElement("tr");

        let fileInfoRegex = /File "([A-Za-z0-9/.\-_]*)", line ([0-9]+), in ([A-Za-z0-9_]+)/g;
        let exceptionMessageRegex = /([A-Za-z0-9.]+)(: )([^\n]+)/g;
        let errorFiles = fileInfoRegex.exec(log["exception"])
        let exceptionMessage = exceptionMessageRegex.exec(log["exception"]);

        el.setAttribute("data-severity", severity[log["importance"]]);
        el.setAttribute("data-timestamp", log["timestamp"]);
        el.setAttribute("data-referrer", log["referrer"]);
        el.setAttribute("data-tag", log["tag"]);
        el.setAttribute("data-message", log["message"]);
        if ("exception" in log) {
            el.setAttribute("data-exception", log["exception"]
                                                .replace(fileInfoRegex, 'File "<span class="green bold">$1</span>", line <span class="blue bold">$2</span>, in <span class="orange bold">$3</span>')
                                                .replace(exceptionMessageRegex, '<span class="red bold">$1$2$3</span>'));
        }
        el.innerHTML += `<td>${new Date(log["timestamp"] * 1000).toLocaleString()}</td>`;
        el.innerHTML += `<td>${importances[log["importance"]]}</td>`;
        el.innerHTML += `<td>${log["referrer"]}</td>`;
        el.innerHTML += `<td>${log["tag"]}</td>`;
        el.innerHTML += `<td>${log["message"]}</td>`;
        el.innerHTML += `<td></td>`;
        el.innerHTML += `<td><button class="red hover-white v-center" onclick="deleteLogEntry(event, this, ${log["timestamp"]}, '${log["referrer"]}', '${log["tag"]}')"><i class="margin-right">delete</i> Delete</button></td>`;
        if (log["exception"]) {
            el.classList.add("clickable");
        }
        id("log-entries").get(0).appendChild(el);
    }

    applyExceptionInspectors();

    try {
        id("loading-data").get(0).remove();
    } catch (er) { /* The loading string is not displayed anymore */ }
}


let currentFilter = {
    severity: 2,      // warnings +
    timeframe: 1440,  // minutes = 24 hours
};

function filterLogs(filter=currentFilter) {
    let logEntries = qry("tbody > tr[data-timestamp]");
    let resultsLeft = logEntries.length;
    logEntries.classList.remove("hidden");
    logEntries.forEach(el => {
        let hide = false
        if ("severity" in filter   && parseInt(el.getAttribute("data-severity")) < filter["severity"])                               {  hide = true;  }
        if ("timeframe" in filter  && parseInt(el.getAttribute("data-timestamp")) < (Date.now() / 1000) - filter["timeframe"] * 60)  {  hide = true;  }
        
        if (hide) {
            el.classList.add("hidden");
            resultsLeft -= 1;
        }
    });

    if (resultsLeft == 0) {
        if (id("filter-no-results").length == 0) {
            qry("table tbody").get(0).innerHTML += `<tr><td id="filter-no-results" rowspan="7" class="center" style="padding-top: 35px !important">Filter returned no results!</td></tr>`;
        }
    } else {
        try {
            id("filter-no-results").get(0).parentElement.remove();
        } catch(err) {
            // there wasn't a query which did not return no results
        } finally {
            applyExceptionInspectors();
        }
    }
}

function updateSeverityLevel(el) {
    let value = el.value;
    for (let severityChar in severity) {
        if (Object.hasOwnProperty.call(severity, severityChar)) {
            let level = severity[severityChar];
            if (level == value) {
                let html = importances[severityChar];
                id(`filter-severity-level-html`).text(html);
                currentFilter["severity"] = level;
                filterLogs();
                return;
            }
        }
    }
}

function updateTimeFilter(el) {
    let value = el.value;
    let days = Math.floor(value / (60*24));
    if (days * 60 * 24 != value) {
        value -= days * 60 * 24;
    } else {
        days = 0;
    }
    let hours = Math.floor(value / 60);
    value -= hours * 60;
    let minutes = value;
    let txt = []
    if (days)    { txt.push(`${days} days`);       }
    if (hours)   { txt.push(`${hours} hours`);     }
    if (minutes) { txt.push(`${minutes} minutes`); }
    id("filter-timeframe-html").text("Last " + txt.join(", "));
    currentFilter["timeframe"] = parseInt(el.value);
    filterLogs();
}

function applyExceptionInspectors() {
    qry("tr[data-exception]").forEach(el => {
        const _el = el;
        _el.addEventListener("click", ev => {
            alert("Inspect traceback", `<div class="code size-14 pre-wrap">${_el.getAttribute("data-exception")}</div>`)
        });
    });
}

function deleteLogEntry(event, el, timestamp, referrer, tag) {
    event.stopPropagation();
    loading(el.childNodes[0]);

    axios.post(`/api/log/delete`, {
        timestamp: timestamp,
        referrer: referrer,
        tag: tag
    })
    .then(x => x.data)
    .then(d => {
        if (d.success) {
            el.parentElement.parentElement.remove();
        } else {
            throw new Error(d.error);
        }
    })
    .catch(er => {
        alert("Failed to delete log entry", er);
    })
    .finally(_ => {
        stopLoading(el.childNodes[0]);
    });
}


function retrieveNewLogs() {
    getAllLogs()
    .then(d => displayLogs(d, 100))
    .then(_ => {
        filterLogs();
    })
    .finally(_ => {
        setTimeout(retrieveNewLogs, 3000);
    });
}
retrieveNewLogs();




window.getAllLogs = getAllLogs;
window.displayLogs = displayLogs;
window.filterLogs = filterLogs;
window.updateSeverityLevel = updateSeverityLevel;
window.updateTimeFilter = updateTimeFilter;
window.deleteLogEntry = deleteLogEntry;
