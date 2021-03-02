function qry(q) {
    return document.querySelectorAll(q);
}

function setSkillImage(p) {
    qry("input[name=image]")[0].value = p;
    qry(".skill-image img")[0].src = "/assets/img/icons/" + p;
    qry(".image-container")[0].classList.remove("visible")
}


function addIntent(ok, txt) {
    if (!ok) { return; }

    if (document.querySelector("#no-intents")) {
        document.querySelector("#no-intents").outerHTML = "";
    }

    allIntents.push(txt);

    document.querySelector(".intents-box").innerHTML +=
        `<div class="intent skill" onclick="window.location.href='/intent/edit?name=${txt}'">
			<span class="description">${txt}</span>
			<span class="tests">0 utterances</span>
		<div>`;

    saveWork();
}

let infoBoxVisible = false

function showInfoBox(element, htmlText) {
    if (infoBoxVisible) { return false; }
    infoBoxVisible = true;
    const rect = element.getBoundingClientRect();

    const containerId = "info-box-container-" + Date.now();
    const contentId = "info-box-content-" + Date.now();

    const htmlCode =
        `<div id="${containerId}" class="info-box-container" style="top:${rect.top}px;left:${rect.left}px">
		<p class="info-box-content" id="${contentId}">${htmlText}</p>
	</div>`;

    document.querySelector("div#no-break").innerHTML += htmlCode;

    setTimeout(function() {
        document.querySelector("#" + containerId).classList.add("visible");
    }, 0);

    // console.log(rect.top, rect.right, rect.bottom, rect.left);
}

function removeInfoBox(all = true) {
    infoBoxVisible = false;
    const allBoxes = document.querySelectorAll(".info-box-container");
    for (let i = 0; i < allBoxes.length; i++) {
        const box = allBoxes[i];
        box.classList.remove("visible");
        setTimeout(function() {
            box.outerHTML = "";
        }, 250);
    }
}

function saveWork() {
    setStatus("blue", "Saving new intent...");
    get(`/skill/edit?id=${getParam("id")}&intents=${allIntents.join(",")}`).then(d => {
        console.log(d);
        d = JSON.parse(d);
        if (d.intentAlreadyExists) {
            setStatus("orange", "One or more intents already exist: " + d.existingIntents.split(",").join(", "))
        } else {
            setStatus("green", "Everything up-to-date");
        }
    }).catch(_ => {
        setStatus("red", "Couldn't save work");
    });
}

function setStatus(color, description) {
    document.querySelector("#status-description").innerHTML = description;
    document.querySelector("#status-dot").classList.remove("red");
    document.querySelector("#status-dot").classList.remove("blue");
    document.querySelector("#status-dot").classList.remove("green");
    document.querySelector("#status-dot").classList.remove("orange");
    document.querySelector("#status-dot").classList.add(color);
}



// for /slot/add and /slot/edit
let slotApiOption = "new-slot";
let previousSlotName = null;
if (window.location.pathname == "/slot/add" || window.location.pathname == "/slot/edit") {
    document.querySelector(".basic-settings input").addEventListener("focus", e => {
        console.log("[dbg] focus caught. var slotEdit set to " + slotEdit);
        const slotName = document.querySelector(".basic-settings input").value;
        if (slotName.trim() != "" && previousSlotName != null) {
            slotApiOption = "edit-slot";
        }
        if (slotEdit) {
            slotApiOption = "edit-slot";
            previousSlotName = slotName;
            slotEdit = false;
        }
    });
    document.querySelector(".basic-settings input").addEventListener("keyup", e => {
        if (e.key === "Enter" || e.keyCode === 13) {
            // publishSlot();
            document.querySelector(".basic-settings input").blur();
            document.querySelector("#input-new-value").focus();
        }
    });
    document.querySelector(".basic-settings input").addEventListener("blur", publishSlot);


    document.querySelector("#use-synonyms").addEventListener("input", e => {
        get(`/slot/add?slot=${document.querySelector(".basic-settings input").value}&setSynonyms=${document.querySelector("#use-synonyms").checked ? 1 : 0}`).then(d => {
            if (d == "ok") {
                if (document.querySelector("#use-synonyms").checked) {
                    setStatus("green", "Successfully enabled synonyms");
                } else {
                    setStatus("green", "Successfully disabled synonyms");
                }
            } else {
                if (document.querySelector("#use-synonyms").checked) {
                    setStatus("red", "Failed to enabled synonyms");
                } else {
                    setStatus("red", "Failed to disabled synonyms");
                }
            }
        })
    });
    document.querySelector("#automatically-extensible").addEventListener("input", e => {
        get(`/slot/add?slot=${document.querySelector(".basic-settings input").value}&setExtensible=${document.querySelector("#automatically-extensible").checked ? 1 : 0}`).then(d => {
            if (d == "ok") {
                if (document.querySelector("#automatically-extensible").checked) {
                    setStatus("green", "Successfully enabled extensible");
                } else {
                    setStatus("green", "Successfully disabled extensible");
                }
            } else {
                if (document.querySelector("#automatically-extensible").checked) {
                    setStatus("red", "Failed to enabled extensible");
                } else {
                    setStatus("red", "Failed to disabled extensible");
                }
            }
        })
    });
    document.querySelector("#matching-strictness").addEventListener("change", e => {
        get(`/slot/add?slot=${document.querySelector(".basic-settings input").value}&setStrictness=${document.querySelector("#matching-strictness").value}`).then(d => {
            if (d == "ok") {
                setStatus("green", "Successfully set matching strictness to " + document.querySelector("#matching-strictness").value);
            } else {
                setStatus("red", "Failed to set matching strictness to " + document.querySelector("#matching-strictness").value);
            }
        })
    });


    const slotAddInputs = document.querySelectorAll(".input-area-new input");
    for (let i = 0; i < slotAddInputs.length; i++) {
        slotAddInputs[i].addEventListener("keydown", e => {
            if (e.key === "Enter" || e.keyCode === 13) {
                if (document.querySelector('#input-new-value').value.trim() != "") {
                    addValueToSlot();
                } else {
                    setLimitedTimeBorderClass('#input-new-value', "red");
                }
            }
        });
    }

    function publishSlot() {
        const slotName = document.querySelector(".basic-settings input").value;
        if (slotName.trim() == "") {
            console.log(`[dbg] publishSlot() - returning because slotName (${slotName}) .trim() == ""`);
            return;
        }
        if (previousSlotName === slotName) {
            console.log(`[dbg] publishSlot() - returning because previousSlotName (${previousSlotName}) === slotName (${slotName})`);
            return;
        }

        const ext = document.querySelector("#automatically-extensible").checked ? 1 : 0;
        const strictness = document.querySelector("#matching-strictness").value;
        const syn = document.querySelector("#use-synonyms").checked ? 1 : 0;

        get(`/slot/add?${slotApiOption}&automatically_extensible=${ext}&matching_strictness=${strictness}&use_synonyms=${syn}&name=${slotName}${(previousSlotName === null ? "" : "&prev_name=" + previousSlotName)}`).then(d => {
            if (d != "ok") {
                if (d.split("|")[0] == "SLOT_ALREADY_EXISTS") {
                    setStatus("orange", d.split("|")[1]);
                    previousSlotName = null;
                    slotApiOption = "new-slot";
                    setLimitedTimeBorderClass(".basic-settings input", "orange");
                }
                if (d.split("|")[0] == "NO_SLOT_NAME") {
                    setStatus("red", d.split("|")[1]);
                    setLimitedTimeBorderClass(".basic-settings input", "red");
                    previousSlotName = slotName;
                }
                if (d.split("|")[0] == "NO_PREV_NAME") {
                    setStatus("red", d.split("|")[1]);
                    setLimitedTimeBorderClass(".basic-settings input", "red");
                    previousSlotName = slotName;
                }
                if (d.split("|")[0] == "SLOT_DOES_NOT_EXIST") {
                    setStatus("red", d.split("|")[1]);
                    setLimitedTimeBorderClass(".basic-settings input", "red");
                    previousSlotName = slotName;
                }
                if (d.split("|")[0] == "FIELDS_MISSING") {
                    setStatus("red", d.split("|")[1]);
                    previousSlotName = slotName;
                }
                if (d.split("|")[0] == "NEW_SLOT_ALREADY_EXISTS") {
                    setStatus("orange", d.split("|")[1]);
                    setLimitedTimeBorderClass(".basic-settings input", "orange");
                    // previousSlotName = slotName;
                }
            } else {
                if (slotApiOption == "new-slot") {
                    setStatus("green", "Successfully added new slot");
                    setLimitedTimeBorderClass(".basic-settings input", "green");
                    previousSlotName = slotName;
                } else {
                    setStatus("green", "Successfully renamed slot");
                    setLimitedTimeBorderClass(".basic-settings input", "green");
                    window.location.href = "/slot/edit?name=" + slotName;
                }
            }
        });
    }

    function addValueToSlot() {
        const value = document.querySelector("#input-new-value").value;
        const synonyms = document.querySelector("#input-new-synonyms").value;
        const slot = document.querySelector(".basic-settings input").value;

        console.log(value, synonyms, slot);

        get("/slot/add?slot=" + slot + "&value=" + value + "&synonyms=" + synonyms).then(d => {
            if (d == "ok") {
                setStatus("green", "Successfully added value " + value);
                try { document.querySelector(".input-area-existing > p").outerHTML = ""; } catch (error) {}

                document.querySelector(".input-area-existing").innerHTML +=
                    `<div class="slot-value">
					<span class="value">${value}</span>
					<span class="synonyms">${synonyms.split(",").map(x => x.trim()).join(", ")}</span>
					<button class="iconbutton" onclick="deleteValueFromSlot(this)"> <i>delete</i> Delete </button>
				</div>`;

                const inputs = document.querySelectorAll(".input-area-new input");
                for (let i = 0; i < inputs.length; i++) {
                    inputs[i].value = "";
                }
            } else {
                setStatus("red", "Unable to add value" + value);
            }
        }).catch(_ => {
            setStatus("red", "Something failed...");
        })
    }

    function deleteValueFromSlot(el) {
        const element = el.parentElement;
        const value = element.children[0].innerHTML;
        const synonyms = element.children[1].innerHTML;
        const slotName = document.querySelector(".basic-settings input").value;

        console.log(value, synonyms, slotName);

        get(`/slot/add?deleteValueFromSlot&name=${slotName}&value=${value}&synonyms=${synonyms}`).then(d => {
            if (d == "ok") {
                setStatus("green", "Successfully deleted value '" + value + "'");
                element.outerHTML = "";
            } else {
                setStatus("red", d.split("|")[1]);
            }
        })
    }

    function setLimitedTimeBorderClass(element, className, seconds = 2) {
        if (typeof element == "string") {
            document.querySelector(element).classList.add(className);
            setTimeout(function() {
                document.querySelector(element).classList.remove(className);
            }, 1000 * seconds);
        } else {
            element.classList.add(className)
            setTimeout(function() {
                element.classList.remove(className);
            }, 1000 * seconds);
        }
    }
}