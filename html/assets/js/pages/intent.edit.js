window.INTENT_ERRORS = {
    "ERR_INTENT_INVALID_ARGS": "You need to provide a name and slot-id!<br><br>Please consider opening an issue here: <a target='_blank' href='https://github.com/open-jarvis/web/issues'>GitHub</a>",
    "ERR_INTENT_SKILL_NOT_FOUND": "The skill could not be found.<br><br>Most likely the skill got deleted and you'll need to create a new one",
    "ERR_INTENT_NOT_FOUND": "The intent could not be found.<br><br>Most likely the intent got deleted and you'll need to create a new one",
    "ERR_INTENT_SLOT_NOT_FOUND": "The slot could not be found.<br><br>Most likely the slot got deleted and you'll need to create a new one",
    "ERR_INTENT_SLOT_EXISTS": "A slot with this name already exists.<br><br>Try again with a different name"
}

window.updateIntentSlotName = function(newValue, element, oldValue) {
    const skillId = qry("[data-skillid]").get(0).dataset.skillid;
    const intentId = qry("[data-intentid]").get(0).dataset.intentid;
    const slotName = oldValue;

    post(`/api/intent/${skillId}/${intentId}/${slotName}/rename`, {
        "new-name": newValue
    })
    .then(JSON.parse)
    .then(d => {
        if (d.success) {
            document.querySelectorAll("[data-removeslot]").forEach(el => {
                if (el.dataset.removeslot == oldValue) {
                    el.dataset.removeslot = newValue;
                }
            });
        } else {
            element.childNodes[0].textContent = oldValue;
            throw new Error(window.INTENT_ERRORS[d.code]);
        }
    })
    .catch(er => {
        alert("Failed to rename slot!", er);
    });
};

window.intentAddSlot = function(slotId, element) {
    /**
     * this function adds a new slot or updates
     * the slot type of an existing slot
     */
    return new Promise((rs, rj) => {
        const input = id("slot-add-name").get(0);
        element.classList.add("transition");
        const name = input.value;
        const endPoint = input.dataset.update ? "change-slot" : "add-slot";

        const skillId = qry("[data-skillid]").get(0).dataset.skillid;
        const intentId = qry("[data-intentid]").get(0).dataset.intentid;

        if (name.trim() == "") {
            input.classList.add("transition");
            input.classList.add("error");
            setTimeout(function() {
                input.classList.remove("error");
            }, 700);
            rj();
            return;
        }

        post(`/api/intent/${skillId}/${intentId}/${endPoint}`, {
            name: name,
            "slot-id": slotId
        })
        .then(JSON.parse)
        .then(d => {
            if (d.success) {
                element.classList.add("border-green");
                swup.loadPage({url: window.location.pathname});
            } else {
                throw new Error(window.INTENT_ERRORS[d.code]);
            }
            rs();
        }).catch(er => {
            alert("Couldn't add slot", er);
            rj();
        });
    });
}

qry("[data-removeslot]").click(ev => {
    const target = ev.currentTarget;

    const skillId = qry("[data-skillid]").get(0).dataset.skillid;
    const intentId = qry("[data-intentid]").get(0).dataset.intentid;
    const slotName = target.dataset.removeslot;

    loading(target);
    target.classList.remove("hover-bg-red");
    target.classList.add("hover-bg-orange");
    
    post(`/api/intent/${skillId}/${intentId}/${slotName}/remove`)
    .then(JSON.parse)
    .then(d => {
        if (d.success) {
            target.parentNode.remove();
            const countElement = document.querySelector("#intent-slot-count");
            const oldSlotCount = parseInt(countElement.innerHTML.trim());
            countElement.innerHTML = "" + (oldSlotCount - 1);
        } else {
            throw new Error(window.INTENT_ERRORS[d.code])
        }
    }).catch(er => {
        alert("Failed to remove Slot!", er);
    }).finally(_ => {
        loadingStop(target);
        target.classList.remove("hover-bg-orange");
        target.classList.add("hover-bg-red");
    });
});

qry("[data-redirectslot]").click(ev => {
    const skillId = qry("[data-skillid]").get(0).dataset.skillid;
    const intentId = qry("[data-intentid]").get(0).dataset.intentid;
    const slotId = ev.currentTarget.dataset.redirectslot;

    swup.loadPage({
        url: `/slot/edit/${skillId}/${intentId}/${slotId}`
    });
});

qry("[data-changeslottype]").click(ev => {
    ev.stopPropagation();
    const slotName = ev.currentTarget.dataset.changeslottype;
    window.addSlot(new Event("hi")).then(box => {
        box.header.innerHTML = "Change Slot Type";
        box.text.innerHTML = `Pick a new Slot Type for <span class="blue">${slotName}</span>:<br><br>`;
        box.content.children[0].children[0].remove();

        const input = document.createElement("input");
        input.type = "hidden";
        input.id = "slot-add-name";
        input.value = slotName
        input.setAttribute("data-update", true);
        box.content.children[0].appendChild(input);             
        // add this element because we need to access it in window.intentAddSlot
    });
});

qry("[data-addslot]").click(ev => { window.addSlot(ev) });

window.addSlot = ev => {
    const target = ev.currentTarget;

    const skillId = qry("[data-skillid]").get(0).dataset.skillid;
    const intentId = qry("[data-intentid]").get(0).dataset.intentid;

    const box = rawWrapper("Create New Slot", "Enter a descriptive slot name and pick a slot type:");
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

    box._innerWrapper.classList.add("width-900");
    box._innerWrapper.style.maxWidth = "85vw";

    const loadingBox = document.createElement("div");
    loadingBox.classList.add("v-center");
    loadingBox.classList.add("h-center");

    const i = document.createElement("i");
    i.innerHTML = "loop";
    i.classList.add("rotating");

    const span = document.createElement("span");
    span.innerHTML = "Loading slots";

    loadingBox.appendChild(i);
    loadingBox.appendChild(span);

    box.content.appendChild(loadingBox);

    box.ok.addEventListener("click", ev => {
        ev.stopImmediatePropagation();
    });

    return new Promise((finalResolve, finalReject) => {
        get(`/api/slot/all`).then(JSON.parse).then(d => {
            if (!d.success) {
                throw new Error("server side error");
            }
    
            const chooser = document.createElement("div");
    
            const addElement = document.createElement("div");
            addElement.classList.add("border-dashed");
            addElement.classList.add("box");
            addElement.classList.add("clickable");
            addElement.classList.add("centered");
            addElement.classList.add("bg-light-grey");
            addElement.classList.add("col-3");
            addElement.addEventListener("click", _ => {
                box.hide();
                setTimeout(function() {
                    longPrompt("Create New Slot Type",
                               "Choose a descriptive name for the new slot type.<br><br>Good names are eg. city, time, color, etc...",
                               "Enter Slot Type Name",
                               "Enter Slot Type Description",i => {
                        return /^[A-Za-z]{1}[A-Za-z0-9]{1,}$/.test(i)
                    }, () => true).then(r => {
                        if (r) {
                            post(`/api/slot/create`, { name: r.input, description: r.text })
                                .then(JSON.parse)
                                .then(d => {
                                    if (d.success) {
                                        swup.loadPage({
                                            url: `/slot/edit/${skillId}/${intentId}/${d.id}`
                                        });
                                    } else {
                                        throw new Error("server side error");
                                    }
                                }).catch(er => {
                                    console.error(er);
                                    alert("Failed to create slot", "An unknown error occured and we couldn't create the slot<br><br>Please try again later");
                                });
                        } else {
                            alert("Failed to create slot", "Please enter valid information");
                        }
                    });
                }, 300);
            });
            addElement.innerHTML = `<div class="icon bg-blue"><i>add</i></div><span>Create New Slot Type</span>`;
    
            const nameInputBox = document.createElement("div");
            nameInputBox.classList.add("input");
        
            const nameInput = document.createElement("input");
            nameInput.id = "slot-add-name";
            nameInput.placeholder = " ";
        
            const namePlaceholder = document.createElement("span");
            namePlaceholder.innerHTML = "Enter Slot Name";
        
            nameInputBox.appendChild(nameInput);
            nameInputBox.appendChild(namePlaceholder);
    
            const slotSelectBox = document.createElement("div");
            slotSelectBox.classList.add("container");
            slotSelectBox.classList.add("margin-0");
            slotSelectBox.classList.add("width-full");
            const firstRow = document.createElement("div");
            firstRow.classList.add("row");
            firstRow.append(addElement);
    
            slotSelectBox.appendChild(firstRow);
            chooser.appendChild(nameInputBox);
            chooser.appendChild(slotSelectBox);
            
            const longerElements = [];
            for (let i = 0; i < d.slots.length; i++) {
                const slot = d.slots[i];
                const slotElement = document.createElement("div");
                slotElement.addEventListener("click", () => {
                    if (document.getElementById("slot-add-name").value.trim() == "") {
                        document.getElementById("slot-add-name").classList.add("error");
                        setTimeout(function() {
                            document.getElementById("slot-add-name").classList.remove("error");
                        }, 700);
                        return;
                    }
                    window.intentAddSlot(slot.id, slotElement)
                    .then(_=>{})
                    .catch(_=>{})
                    .finally(_=>{
                        box.hide();
                    });
                });
                slotElement.classList.add("box");
                slotElement.classList.add("clickable");
                slotElement.classList.add("transition");
                slotElement.classList.add("centered");
                slotElement.classList.add("col-3");
                slotElement.setAttribute("title", slot.description);
                let color = slot.quality < 0.25 ? "red" : slot.quality > 0.5 ? "green" : "orange";
                let colorStr = slot.quality < 0.25 ? "Poor Quality" : slot.quality > 0.5 ? "Excellent Quality" : "Medium Quality";
                const edit = document.createElement("i");
                edit.setAttribute("data-slotid", slot.id);
                edit.innerHTML = "edit";
                "visible-on-hover transition clickable hover-bg-blue hover-white size-16 absolute top-xs right-xs".split(" ").forEach(e => edit.classList.add(e));
                edit.addEventListener("click", ev => {
                    box.hide();
                    ev.stopPropagation();
                    swup.loadPage({
                        url: `/slot/edit/${skillId}/${intentId}/${ev.currentTarget.dataset.slotid}`
                    });
                });
    
                const slotName = document.createElement("p");
                slotName.innerHTML = slot.name
    
                const slotQuality = document.createElement("span");
                slotQuality.classList.add(color);
                slotQuality.innerHTML = colorStr;
    
                slotElement.appendChild(edit);
                slotElement.appendChild(slotName);
                slotElement.appendChild(slotQuality);
                                        
                if (i < 3) {
                    firstRow.appendChild(slotElement);
                } else {
                    longerElements.push(slotElement);
                }
            }

            while (longerElements.length) {
                const fourElements = longerElements.splice(0,4);
                const elementToAppend = document.createElement("div");
                elementToAppend.classList.add("row");
                for (let i = 0; i < fourElements.length; i++) {
                    const element = fourElements[i];
                    elementToAppend.appendChild(element);
                }
                slotSelectBox.appendChild(elementToAppend);
            }
    
            box.content.removeChild(loadingBox);
            box.content.appendChild(chooser);
    
            nameInput.focus();

            finalResolve(box);
        }).catch(er => {
            console.error(er);
        });    
    });
}

