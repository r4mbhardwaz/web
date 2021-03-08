qry("[data-addslot]").click(ev => {
    const target = ev.currentTarget;
    const skillId = target.dataset.skillid;
    const slotId = target.dataset.addslot;
    const slotName = id("add-slot-name").get(0).value;
    if (slotName.trim() == "") {
        alert("You need to enter a name for the new slot!");
        return;
    }
    post(`/api/skill/${skillId}/slot/add`, { "slot-id": slotId, "slot-name": slotName }).then(JSON.parse).then(d => {
        if (d.success) {
            // TODO
        } else {
            throw new Error("Couldn't add slot to skill");
        }
    }).catch(er => {
        alert("Couldn't add slot to skill");
    });
});

qry("[data-deleteslot]").click(ev => {
    ev.stopPropagation();
    const target = ev.currentTarget;
    get(`/api/slot/${target.dataset.deleteslot}/delete`).then(JSON.parse).then(d => {
        if (d.success) {
            console.log(ev);
            target.parentElement.outerHTML = "";
        } else {
            alert("Failed to delete slot");
        }
    }).catch(er => {
        console.error(er);
        alert("Server side error, failed to delete slot");
    });
});

qry("[data-removeslot]").click(ev => {
    ev.stopPropagation();
    const target = ev.currentTarget;
    post(`/api/skill/${target.dataset.skillid}/slot/remove`, { "slot-id": target.dataset.removeslot }).then(JSON.parse).then(d => {
        target.remove();
    }).catch(er => {
        console.error(er);
        alert("Server side error, failed to remove slot");
    })
});

