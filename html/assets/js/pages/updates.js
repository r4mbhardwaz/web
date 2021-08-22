'use strict';

setInterval(() => {
    function updateDownloadOnlyHandler() {
        const icon = qry("#update-download-only i").get(0);
        loading(icon);
        axios.post(`/api/update/download`).then(x => x.data).then(d => {
            if (d.success) {
                qry("#update-options").classList.toggle("visible");
                qry("#update-options").classList.toggle("hidden");
                id("install-update-button").get(0).parentElement.classList.add("disabled");
            } else {
                throw new Error(d.error);
            }
        }).catch(er => {
            alert("Failed to download update!", er);
        }).finally(_ => {
            loadingStop(icon);
        });
    }
    id("update-download-only").click(updateDownloadOnlyHandler);
}, 500);

let updateObject = null;
let version = null;

function updateStatus(firstTime=false) {
    axios.get(`/api/version`)
    .then(x => x.data)
    .then(d => {
        if (version != null && version != d.remote) {
            // A NEW VERSION WHILE VISITING THE WEBSITE
            // already handled by checkForUpdate function
            // redirect(window.location.href);
        }
        if (firstTime) {
            insertUpdateOptions(d["available"]["download"], d["available"]["install"], d["schedule-install"]);
        }
        
        version = d.remote;
        updateObject = d;
        id("update-download-progress").get(0).style.width = Number.parseFloat(d.progress.download * 100).toFixed(1) + "%";
        id("update-download-progress-percent").text((d.progress.download * 100) + "%");
    })
    .finally(_ => {
        setTimeout(updateStatus, 500);
    });
}
updateStatus(true);

function checkForUpdate(el) {
    if (el) { loading(el.children[0]); }
    axios.post(`/api/update/poll`)
    .then(x => x.data)
    .then(d => {
        if (d.success) {
            redirect(window.location.href);
        } else {
            throw new Error(d.error);
        }
    })
    .catch(err => {
        alert("Could not check for updates", err);
    }).finally(_ => {
        if (el) { stopLoading(el.children[0]); }
    });
}

function insertUpdateOptions(downloadPending, installationPending, installationScheduled, progressWidth) {
    console.log("insertUpdateOptions", downloadPending, installationPending, installationScheduled, progressWidth);
    if (!progressWidth) {
        progressWidth = {
            download: "0%",
            install: "0%"
        }
    }
    let code = 
        `<div class="row margin-top-s">` +
            `<div class="col-3">` +
                `<span>Download</span>` +
            `</div>` +
            `<div class="col-8">` +
                `<div class="progress">` +
                    `<div id="update-download-progress" style="width: ${progressWidth.download || "0%"}"></div>` +
                ` </div>` +
            `</div>` +
            `<div class="col-1">` +
                `<span class="right" id="update-download-progress-percent">${progressWidth.download || "0%"}</span>` +
            `</div>` +
        `</div>` +
        `<div class="row">` +
            `<div class="col-3">` +
                `<span>Installation</span>` +
            `</div>` +
            `<div class="col-8">` +
                `<div class="progress">` +
                    `<div id="update-install-progress" style="width: ${progressWidth.install || "0%"}"></div>` +
                `</div>` +
            `</div>` +
                `<div class="col-1">` +
                    `<span class="right" id="update-install-progress-percent">${progressWidth.install || "0%"}</span>` +
            `</div>` +
        `</div>` +

        `<br>` +

        `<div class="row">` +
            `<div class="col-6 relative">` +
            (   downloadPending || installationPending ? 
                    `<button id="install-update-button" class="height-full v-center h-center hover-white ${downloadPending || installationPending ? "green" : "blue"}" ` +
                            `onclick="${downloadPending ? `downloadUpdate(this)` : `installUpdate(this)`}">` + 
                        `<i class="transition margin-right">${downloadPending ? "download" : "downloading"}</i>` +
                        `${downloadPending ? "Download Update" : (installationPending ? "Install Update" : "Check for updates")}` +
                    `</button>` +
                    ( installationPending ?
                    `<div class="settings button-options">` +
                        `<i>arrow_drop_down</i>` +
                        `<div class="options hidden" id="update-options">` +
                            // (   (downloadPending && false) ?
                            //     `<div class="v-center hover-bg-green hover-white" id="update-download-only">` +
                            //         `<i>download</i>` +
                            //         `<span>Download</span>` +
                            //     `</div>` 
                            //     : ``) +
                            (   installationPending ?
                                `<div class="v-center hover-bg-blue hover-white">` +
                                    `<i>downloading</i>` +
                                    `<span>Install now</span>` +
                                `</div>` +
                                `<div class="v-center hover-bg-blue hover-white" onclick="scheduleInstall()">` +
                                    `<i>update</i>` +
                                    `<span>Schedule Installation</span>` +
                                `</div>`
                                : ``) +
                        `</div>` +
                    `</div>` : "")
                    : ``) +
            `</div>` +
            (installationPending && installationScheduled ? 
                `<div class="col-5 v-center padding-left scheduled-installation-info">` +
                    `<span class="dark-grey size-14">Installation scheduled:<br>${new Date(installationScheduled * 1000).toLocaleString()}</span>` +
                `</div>` +
                `<div class="col-1 v-center h-center clickable red scheduled-installation-info" onclick="cancelScheduleInstall(this)">` +
                    `<i class="size-15">clear</i>` +
                `</div>` 
                : "") +
        `</div>`;

    id("installation-options").text(code);
}

function cancelScheduleInstall(el) {
    loading(el.childNodes[0]);
    axios.post(`/api/update/schedule/cancel`, {})
    .then(x => x.data)
    .then(d => {
        if (d.success) {
            qry(".scheduled-installation-info").forEach(element => {
                element.remove();
            });
        } else {
            throw new Error(d.error);
        }
    })
    .catch(er => {
        alert("Failed!", "Failed to cancel scheduled installation:<br><br>" + er.message);
    })
    .finally(_ => {
        loadingStop(el.childNodes[0]);
    });
}
function scheduleInstall() {
    const wr = rawWrapper("Pick installation date", "Pick a time where Jarvis should automatically update itself.<br>Make sure Jarvis is running at that time");

    var isFirefox = typeof InstallTrigger !== 'undefined';
 
    let minDate = new Date();
    minDate.setHours(minDate.getHours() + 1);  // +1 hour
    minDate = minDate.toISOString().split(":").slice(0, 2).join(":");
    let maxDate = new Date()
    maxDate.setDate(maxDate.getDate() + 30);  // +30 days
    maxDate = maxDate.toISOString().split(":").slice(0, 2).join(":");

    const code = 
        `<div class="margin-top">` +
            (isFirefox ? 
                `<input type="date" id="installation-date-picker" min="${minDate}" max="${maxDate}">` +
                `<input type="time" id="installation-time-picker" class="margin-left">`
                :
                `<input type="datetime-local" id="installation-date-picker" min="${minDate}" max="${maxDate}">`
                ) + 
        `</div>`;

    wr.content.innerHTML = code;
    
    wr.ok.addEventListener("click", ev => {
        let datePicked = new Date(id("installation-date-picker").get(0).value).getTime() / 1000;

        if (isNaN(datePicked)) {
            return;
        }

        axios.post(`/api/update/schedule`, {
            install: datePicked
        })
        .then(x => x.data)
        .then(d => {
            if (d.success) {
                let storedWith = id("update-download-progress").get(0).style.width;
                id("update-download-progress").get(0).style.transition = "none";
                insertUpdateOptions(updateObject["available"]["download"], updateObject["available"]["install"], datePicked, {"download": storedWith, "install": "0%"});
            } else {
                throw new Error(d.error);
            }
        })
        .catch(er => {
            alert("Failed to schedule installation!", er.message);
        })
    });
}
function downloadUpdate(el) {
    if (el.classList.contains("disabled")) {
        return;
    }
    el.classList.add("disabled");
    try {
        loading(el.childNodes[0]);
    } catch (err) {}
    axios.post(`/api/update/download`, {})
    .then(x => x.data)
    .then(d => {
        if (d.success) {
            insertUpdateOptions(false, true, updateObject["schedule-install"]);
        } else {
            throw new Error(d.error);
        }
    })
    .catch(er => {
        alert("Failed!", "Could not download update:<br><br>" + er.message);
    })
    .finally(_ => {
        el.classList.remove("disabled");
        try {
            loadingStop(el.childNodes[0]);
        } catch (err) {}
    });
}
function installUpdate() {

}

window.checkForUpdate = checkForUpdate;
window.scheduleInstall = scheduleInstall;
window.cancelScheduleInstall = cancelScheduleInstall;
window.downloadUpdate = downloadUpdate;
window.installUpdate = installUpdate;