window.SLOT_ERRORS = {
    "ERR_SLOT_VALUE_EMPTY": "Please enter a slot value!<br>Only the synonyms field is optional!",
    "ERR_SLOT_NOT_FOUND": "The given slot couldn't be found.<br><br>Refresh this page, the slot might have been deleted.",
    "ERR_SLOT_ARGS_MISSING": "Please make sure you provide the 'value' and 'synonyms' JSON POST body."
}

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
            id("slot-data-values").get(0).innerHTML += `
            <div class="row transition border-radius hover-transition hover-bg-light-grey v-padding-s">
            <div class="col-4 space margin-bottom-0" data-itemid="${d.id}" data-editable data-editablecallback="updateSlotValue">
                ${value}
                    <div class="seperator"></div>
                </div>
                <div class="col-7 space margin-bottom-0" data-itemid="${d.id}" data-editable data-editable-allow-empty="true" data-editablecallback="updateSlotSynonyms">
                    ${synonyms.split(",").map(x => x.trim()).join(", ")}
                </div>
                <div class="col-1 margin-bottom-0 visible-on-hover v-center middle red clickable slot-value-delete" data-slotdataid="${d.id}">
                    <i style="margin: 0 10px 2px 0">clear</i>
                    <span>Delete</span>
                </div>
            </div>`;
            valueElement.value = "";
            synonymsElement.value = "";
            valueElement.focus();
            updateDataEditable();
            updateSlotDeleteHandler();
        } else {
            alert("Failed to submit new data!", window.SLOT_ERRORS[d.code]).then(console.info);
        }
    });
}

window.slotValueDelete = function(ev) {
    const target = ev.currentTarget;
    const slotId = qry("[data-slotid]").get(0).dataset.slotid;
    target.classList.add("orange");
    loading(target.children[0])
    get(`/api/slot/${slotId}/delete/${target.dataset.slotdataid}`)
        .then(JSON.parse)
        .then(d => {
            target.classList.remove("orange");
            loadingStop(target.children[0])
            if (d.success) {
                target.parentElement.outerHTML = "";
            } else {
                alert("Failed to delete data!", "An unknown error occured and the data couldn't be deleted.<br><br>Please try again later");
            }
        });
}

window.updateSlotValue = function(newValue, element, oldValue="") {
    const slotId = qry("[data-slotid]").get(0).dataset.slotid;
    const itemId = element.dataset.itemid;
    post(`/api/slot/${slotId}/${itemId}/change`, { value: newValue }).then(JSON.parse).then(d => {
        if (!d.success) {
            throw new Error("Failed to update slot value");
        }
    }).catch(er => {
        element.childNodes[0].nodeValue = oldValue;
        alert("Failed to update slot value!", "An unknown error occured and the new data couldn't be saved.<br><br>Please try again later");
    });
}

window.updateSlotSynonyms = function(newValue, element, oldValue="") {
    const slotId = qry("[data-slotid]").get(0).dataset.slotid;
    const itemId = element.dataset.itemid;
    post(`/api/slot/${slotId}/${itemId}/change`, { synonyms: newValue }).then(JSON.parse).then(d => {
        if (!d.success) {
            throw new Error("Failed to update slot synonyms");
        }
    }).catch(er => {
        element.childNodes[0].nodeValue = oldValue;
        alert("Failed to update slot synonyms!", "An unknown error occured and the new data couldn't be saved.<br><br>Please try again later");
    });
}

window.updateSlotDeleteHandler = function() {
    qry(".slot-value-delete").click(slotValueDelete);
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

window.updateSlotDeleteHandler();