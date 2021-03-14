qry("[data-addslot]").click(ev => {
    const target = ev.currentTarget;

    const skillId = qry("[data-skillid]").get(0).dataset.skillid;
    const intentId = qry("[data-intentid]").get(0).dataset.intentid;

    const box = rawWrapper("Add New Slot", "Enter a descriptive slot name and pick a slot type:");
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
            "visible-on-hover transition clickable hover-bg-grey size-16 absolute top-small right-small".split(" ").forEach(e => edit.classList.add(e));
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
    }).catch(er => {
        console.error(er);
    });
});