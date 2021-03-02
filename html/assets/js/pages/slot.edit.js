id("slot-synonyms").change(ev => {
    get(`/api/slot/${ev.target.dataset.id}/use-synonyms?value=${ev.target.checked}`);
});

id("slot-name").change(ev => {
    get(`/api/slot/${ev.target.dataset.id}/name?value=${ev.taget.value}`);
});

id("slot-extensible").change(ev => {
    get(`/api/slot/${ev.target.dataset.id}/extensible?value=${ev.target.checked}`)
});

id("slot-strictness").change(ev => {
    get(`/api/slot/${ev.target.dataset.id}/strictness?value=${ev.target.value}`)
});

id("new-slot-value").enter(ev => {
    post(`/api/slot/${ev.target.dataset.id}/add-data`, {
        value: id("new-slot-value").value[0],
        synonyms: id("new-slot-synonyms").value[0]
    }).then(JSON.parse).then(d => {
        if (d.success) {
            
        } else {

        }
    });
})