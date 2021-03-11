window.submitNewData = function(ev) {
    const valueElement      = id("new-slot-value").get(0);
    const value             = valueElement.value;
    const synonymsElement   = id("new-slot-synonyms").get(0);
    const synonyms          = synonymsElement.value;
    const target            = ev.currentTarget;
    post(`/api/slot/${target.dataset.id}/add-data`, {
        value: value,
        synonyms: synonyms
    }).then(JSON.parse).then(d => {
        if (d.success) {
            id("slot-data-values").get(0).innerHTML += `<div class="grid gap-l">
                <div class="box space row-s-1 row-e-1 col-s-1 col-e-5">
                    ${value}
                    <div class="seperator"></div>
                </div>
                <div class="box space row-s-1 row-e-1 col-s-5 col-e-11">
                    ${synonyms.split(",").map(x => x.trim()).join(", ")}
                </div>
                <div class="v-center middle red clickable row-s-1 row-e-1 col-s-11 col-e-13 slot-value-delete" onclick="slotValueDelete(event)" data-slotid="${target.dataset.id}" data-slotdataid="${d.id}">
                    <i style="margin: 0 10px 2px 0">clear</i>
                    <span>Delete</span>
                </div>        
            </div>`;
            valueElement.value = "";
            synonymsElement.value = "";
            valueElement.focus();
        } else {
            alert("Failed to submit new data!");
        }
    });
}

window.slotValueDelete = function(ev) {
    const target = ev.currentTarget;
    const oldInnerHTML = target.children[0].innerHTML;
    target.classList.add("orange");
    loading(target.children[0])
    get(`/api/slot/${target.dataset.slotid}/delete/${target.dataset.slotdataid}`).then(JSON.parse).then(d => {
        target.classList.remove("orange");
        loadingStop(target.children[0])
        if (d.success) {
            target.parentElement.outerHTML = "";
        } else {
            alert("Failed to delete data!");
        }
    });
}

window.updateSlotValue = function(newValue, element, oldValue="") {
    const slotid = element.dataset.slotid;
    const itemid = element.dataset.itemid;
    post(`/api/slot/${slotid}/${itemid}/change`, { value: newValue }).then(JSON.parse).then(d => {
        if (!d.success) {
            throw new Error("Failed to update slot value");
        }
    }).catch(er => {
        element.childNodes[0].nodeValue = oldValue;
        alert("Failed to update slot value!");
    });
}

window.updateSlotSynonyms = function(newValue, element, oldValue="") {
    const slotid = element.dataset.slotid;
    const itemid = element.dataset.itemid;
    post(`/api/slot/${slotid}/${itemid}/change`, { synonyms: newValue }).then(JSON.parse).then(d => {
        if (!d.success) {
            throw new Error("Failed to update slot synonyms");
        }
    }).catch(er => {
        element.childNodes[0].nodeValue = oldValue;
        alert("Failed to update slot synonyms!");
    });
}



id("slot-synonyms").change(ev => {
    get(`/api/slot/${ev.currentTarget.dataset.id}/use-synonyms?value=${ev.currentTarget.checked}`);
});

id("slot-name").change(ev => {
    if (ev.currentTarget.value.trim() != "") {
        get(`/api/slot/${ev.currentTarget.dataset.id}/name?value=${ev.currentTarget.value}`);
    }
});

id("slot-extensible").change(ev => {
    get(`/api/slot/${ev.currentTarget.dataset.id}/extensible?value=${ev.currentTarget.checked}`)
});

id("slot-strictness").change(ev => {
    get(`/api/slot/${ev.currentTarget.dataset.id}/strictness?value=${ev.currentTarget.value}`)
});

qry("#new-slot-value, #new-slot-synonyms").enter(submitNewData);
id("new-slot-value-button").click(submitNewData);

qry(".slot-value-delete").click(slotValueDelete);

