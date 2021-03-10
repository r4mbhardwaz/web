if (!document.querySelector("#no-break")) {
    const node = document.createElement("div");
    node.id = "no-break";
    document.body.appendChild(node);
}

window._get_wrapper = function() {
    document.body.classList.add("no-scroll");

    const alertWrapper = document.createElement("div");
    alertWrapper.id = "prompt";

    const alertBox = document.createElement("div");
    alertBox.id = "prompt-inner";
    
    const buttonsBox = document.createElement("div");
    const cancelButton = document.createElement("button");
    const okButton = document.createElement("button");
    cancelButton.innerHTML = "Cancel";
    okButton.innerHTML = "OK";
    cancelButton.classList.add("red");
    cancelButton.classList.add("margin-right-big");
    okButton.classList.add("green");
    buttonsBox.classList.add("buttons");
    
    const header = document.createElement("p");
    header.classList.add("header");

    const content = document.createElement("span");
    content.classList.add("content");

    const customBox = document.createElement("div");
    customBox.classList.add("custom");
    
    alertBox.appendChild(header);
    alertBox.appendChild(content);
    alertBox.appendChild(customBox);
    buttonsBox.appendChild(cancelButton);
    buttonsBox.appendChild(okButton);
    alertBox.appendChild(buttonsBox);
    alertWrapper.appendChild(alertBox);
    return [alertWrapper, alertBox, customBox, buttonsBox, okButton, cancelButton, header, content];
}

window._hide_wrapper = function(wrapperElement) {
    wrapperElement.classList.add("hidden");
    setTimeout(function() {
        wrapperElement.remove();
    }, 0.25 * 1000);
}

window.alert = function(headerText, descriptionText) {
    return new Promise(function(resolve, reject) {
        if (document.getElementById("prompt")) {
            reject(new Error("another alert is already shown"));
            return;
        }

        const [wrapper, box, customBox, buttonsBox, okButton, cancelButton, header, content] = _get_wrapper();
        document.getElementById("no-break").appendChild(wrapper);

        if (descriptionText) {
            header.innerHTML = headerText;
            content.innerHTML = descriptionText;
        } else {
            header.innerHTML = "Alert";
            content.innerHTML = headerText;
        }

        okButton.addEventListener("click", ev => {
            resolve(true);
            _hide_wrapper(wrapper);
        });
        cancelButton.addEventListener("click", ev => {
            resolve(false);
            _hide_wrapper(wrapper);
        });
        wrapper.addEventListener("click", ev => {
            if (ev.target == wrapper) {
                resolve(false);
                _hide_wrapper(wrapper);
            }
        });
    });
}

window.prompt = function(headerText, placeholder, descriptionText = "") {
    return new Promise(function(resolve, reject) {
        if (document.getElementById("prompt")) {
            reject(new Error("another alert is already shown"));
            return;
        }

        const [wrapper, box, customBox, buttonsBox, okButton, cancelButton, header, content] = _get_wrapper();
        customBox.classList.add("input");
        const input = document.createElement("input");
        input.placeholder = " ";
        const placeholderEl = document.createElement("span");
        placeholderEl.innerHTML = placeholder;

        customBox.appendChild(input);
        customBox.appendChild(placeholderEl);

        document.getElementById("no-break").appendChild(wrapper);

        header.innerHTML = headerText;
        content.innerHTML = descriptionText;

        okButton.addEventListener("click", ev => {
            resolve(true, input.value);
            _hide_wrapper(wrapper);
        });
        cancelButton.addEventListener("click", ev => {
            resolve(false, input.value);
            _hide_wrapper(wrapper);
        });
        wrapper.addEventListener("click", ev => {
            if (ev.target == wrapper) {
                resolve(false, input.value);
                _hide_wrapper(wrapper);
            }
        });
    });
}