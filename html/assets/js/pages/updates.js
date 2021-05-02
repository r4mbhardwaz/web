'use strict';

id("update-download-only").click(_ => {
    const icon = qry("#update-download-only i").get(0);
    loading(icon);
    post(`/api/update/download`).then(JSON.parse).then(d => {
        if (d.success) {
            qry("#update-options").classList.toggle("visible");
            qry("#update-options").classList.toggle("hidden");
            id("install-update-button").get(0).disabled = true;
        } else {
            throw new Error(d.error);
        }
    }).catch(er => {
        alert("Failed to download update!", er);
    }).finally(_ => {
        loadingStop(icon);
    });
});

let version = null;

function updateStatus() {
    get(`/api/version`)
    .then(JSON.parse)
    .then(d => {
        if (version != null && version != d.remote) {
            // A NEW VERSION WHILE VISITING THE WEBSITE
            redirect(window.location.href);
        }
        version = d.remote;
        id("update-download-progress").get(0).style.width = Number.parseFloat(d.progress * 100).toFixed(1) + "%";
        id("update-download-progress-percent").text((d.progress * 100) + "%");
    })
    .finally(_ => {
        setTimeout(updateStatus, 500);
    });
}
updateStatus();