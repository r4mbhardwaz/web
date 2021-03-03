id("slot-synonyms").change(ev => {
    get(`/api/slot/${ev.currentTarget.dataset.id}/use-synonyms?value=${ev.currentTarget.checked}`);
});

id("slot-name").change(ev => {
    get(`/api/slot/${ev.currentTarget.dataset.id}/name?value=${ev.currentTarget.value}`);
});

id("slot-extensible").change(ev => {
    get(`/api/slot/${ev.currentTarget.dataset.id}/extensible?value=${ev.currentTarget.checked}`)
});

id("slot-strictness").change(ev => {
    get(`/api/slot/${ev.currentTarget.dataset.id}/strictness?value=${ev.currentTarget.value}`)
});

function submitNewData(ev) {
    post(`/api/slot/${ev.currentTarget.dataset.id}/add-data`, {
        value: id("new-slot-value").value[0],
        synonyms: id("new-slot-synonyms").value[0]
    }).then(JSON.parse).then(d => {
        if (d.success) {

        } else {
            alert("Failed to submit new data!");
        }
    });
}

qry("new-slot-value, #new-slot-synonyms").enter(submitNewData);
id("new-slot-value-button").click(submitNewData);

qry(".slot-value-delete").click(ev => {
    const target = ev.currentTarget;
    const oldInnerHTML = target.children[0].innerHTML;
    target.classList.add("orange");
    target.children[0].innerHTML = "cached";
    target.children[0].classList.add("rotating");
    get(`/api/slot/${target.dataset.slotid}/delete/${target.dataset.slotdataid}`).then(JSON.parse).then(d => {
        target.classList.remove("orange");
        target.children[0].innerHTML = oldInnerHTML;
        target.children[0].classList.remove("rotating");
        if (d.success) {
            target.parentElement.outerHTML = "";
        } else {
            alert("Failed to delete data!");
        }
    });
})