qry("[data-addslot]").click(ev => {
    const target = ev.currentTarget;

    const box = rawWrapper("Choose a slot", "Pick one of the existing slots or create a new one:");
    /**
     * .content
     * .ok
     * .cancel
     * .header
     * .text
     */

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
        
        box.content.removeChild(loadingBox);
        
        const chooser = document.createElement("div");

        const addElement = document.createElement("div");
        addElement.classList.add("border-dashed");
        addElement.classList.add("box");
        addElement.classList.add("clickable");
        addElement.classList.add("centered");
        addElement.classList.add("bg-light-grey");
        addElement.addEventListener("click", _ => {
            swup.loadPage({
                url: '/skill/new'
            });
        });
        addElement.innerHTML = `<div class="icon bg-blue"><i>add</i></div><span>Create New Slot</span>`;

        const nameInputBox = document.createElement("div");
        nameInputBox.classList.add("input");
    
        const nameInput = document.createElement("input");
        nameInput.placeholder = " ";
    
        const namePlaceholder = document.createElement("span");
        namePlaceholder.innerHTML = "Enter a name for this slot";
    
        nameInputBox.appendChild(nameInput);
        nameInputBox.appendChild(namePlaceholder);
        
        const slotSelectBox = document.createElement("div");
        
        slotSelectBox.appendChild(addElement);

        chooser.appendChild(nameInputBox);
        chooser.appendChild(slotSelectBox);
        box.content.appendChild(chooser);

        nameInput.focus();
    }).catch(er => {
        console.error(er);
    });
});