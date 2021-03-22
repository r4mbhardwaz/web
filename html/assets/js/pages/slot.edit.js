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
            const noData = document.getElementById("no-data-yet");
            if (noData) {
                noData.remove();
            }
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
};

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
                const slotDataContainer = target.parentElement.parentElement;
                target.parentElement.outerHTML = "";
                if (slotDataContainer.childElementCount == 0) {
                    slotDataContainer.innerHTML = 
                    `<div style="margin-bottom: 10px" class="center" id="no-data-yet">
                        No values yet. Start by entering a value and synonyms
                    </div>`;
                }
            } else {
                alert("Failed to delete data!", "An unknown error occured and the data couldn't be deleted.<br><br>Please try again later");
            }
        });
};

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
};

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
};

window.updateSlotDeleteHandler = function() {
    qry(".slot-value-delete").click(slotValueDelete);
};


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

qry("[data-importdata]").click(ev => {
    const box = window.rawWrapper("Import Data", "Enter a URL or import from a local CSV file:");
    /**
     * .content
     * .ok
     * .cancel
     * .header
     * .text
     * ._wrapper
     * ._innerWrapper
     * .hide()
     */
    box.ok.innerHTML = "Import Data";

    box.content.innerHTML =
    `<div class="input file">
        <input type="file" id="import-data-file">
        <label for="import-data-file" class="v-padding h-padding-l border border-blue border-radius transition bg-blue hover-bg-lighter-grey white hover-blue" data-fileinput>
            Import from local CSV file
        </label>
    </div>
    <div class="padding-top-m">
        <span class="dark-grey">or</span>
    </div>
    <div class="input">
        <input type="text" id="import-data-url" placeholder=" ">
        <span>Enter URL to CSV file</span>
    </div>
    `;

    window.updateLabelFileConnector();

    box.ok.addEventListener("click", ev => {
        const fileInput = document.getElementById("import-data-file");
        const urlInput = document.getElementById("import-data-url");

        const previewAmount = 100;

        if (urlInput.value.trim() != "") {
            Papa.parse(urlInput.value.trim(), {
                header: true,
                preview: previewAmount,
                worker: true,
                complete: function(result, file) {
                    window.showCSVColumnSelector(result.data, result.meta.fields, result);
                },
                error: function() {
                    setTimeout(() => {
                        alert("Couldn't read URL!", "An unknown error occured while downloading the URL and parsing the values.<br><br>Please check the URL is valid and contains CSV data");
                    }, 250);
                },
                download: true
            });
            return;
        } 
        if (fileInput.files.length > 0) {
            Papa.parse(fileInput.files[0], {
                header: true,
                preview: previewAmount,
                worker: true,
                complete: function(result, file) {
                    window.showCSVColumnSelector(result.data, result.meta.fields, result);
                },
                error: function() {
                    setTimeout(() => {
                        alert("Couldn't read file!", "An unknown error occured while reading the file and parsing the values.<br><br>Please check the file is valid and contains CSV data");
                    }, 250);
                }
            });
        }
    });
});

window._selectedColumn = -1;
window.showCSVColumnSelector = function(data, headers, _meta) {
    console.log(_meta);
    let code = `<table id="csv-picker" class="column-highlight"><thead><tr>`;
    headers.forEach(key => {
        code += `<th>${key}</th>`;
    });
    code += `</tr></thead><tbody>`;
    data.forEach(element => {
        code += `<tr>`
        for (const header in element) {
            if (Object.hasOwnProperty.call(element, header)) {
                const value = element[header];
                code += `<td>${value}</td>`;
            }
        }
        code += `</tr>`
    });
    code += `</tbody></table>`;

    const box = window.rawWrapper("Choose column to import", "Pick a 'value' column and a 'synonyms' column:");

    box.content.classList.add("margin-top-l");
    box.content.classList.add("height-500");
    box.content.innerHTML = code;
    box._innerWrapper.classList.add("width-1000");

    box.ok.innerHTML = "Import CSV Data";

    qry("#csv-picker th").forEach(el => {
        el.classList.add("border-radius-top");
    });

    const allCells = qry("#csv-picker td, #csv-picker th");

    allCells.forEach(el => {
        el.classList.add("transition");
        el.classList.add("clickable");
    });

    allCells.hover(ev => {
        const target = ev.currentTarget;
        let child = target;

        var i = 1;
        while( (child = child.previousSibling) != null ) {
            i++;
        }

        qry(`#csv-picker tr > th:nth-child(${i}), #csv-picker tr > td:nth-child(${i})`).forEach(el => {
            el.classList.add("bg-blue");
            el.classList.add("white");
        });
    });

    allCells.blur(ev => {
        qry(`#csv-picker tr > th:not(:nth-child(${window._selectedColumn})), #csv-picker tr > td:not(:nth-child(${window._selectedColumn}))`).forEach(el => {
            el.classList.remove("bg-blue");
            el.classList.remove("white");
        });
    });

    allCells.click(ev => {
        const target = ev.currentTarget;
        let child = target;

        var i = 1;
        while( (child = child.previousSibling) != null ) {
            i++;
        }

        window._selectedColumn = i;
    });
};

qry("#new-slot-value, #new-slot-synonyms").enter(submitNewData);
id("new-slot-value-button").click(submitNewData);

window.updateSlotDeleteHandler();