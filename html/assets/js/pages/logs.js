'use strict';


function getAllLogs() {
    return new Promise((res, rej) => {
        get(`/api/logs/all`)
        .then(JSON.parse)
        .then(d => {
            if (d.success) {
                console.log(d.length, "entries");
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
    const logs = data.logs;
    const length = data.length;
    
    let importances = {
        "I": `<span class="blue">Info</span>`,
        "W": `<span class="orange">Warning</span>`,
        "E": `<span class="red">Error</span>`,
        "S": `<span class="green">Success</span>`,
        "C": `<span class="red">Critical</span>`
    }
    let code = "";
    
    for (let i = 0; i < (length > max ? max : length); i++) {
        const log = logs[i];
        code +=    `<tr>
                        <td class="col-3">${new Date(log["timestamp"] * 1000).toLocaleString()} </td>
                        <td class="col-2">${importances[log["importance"]]}                     </td>
                        <td class="col-1">${log["referrer"]}                                    </td>
                        <td class="col-1">${log["tag"]}                                         </td>
                        <td class="col-5">${log["message"]}                                     </td>
                    </tr>`.replaceAll("\n", "").replaceAll("\t", "").replaceAll("    ", "");
        console.log(code);
    }

    id("log-entries").text(code);
}


getAllLogs().then(d => displayLogs(d, 10));


window.getAllLogs = getAllLogs;
window.displayLogs = displayLogs;