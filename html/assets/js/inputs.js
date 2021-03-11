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
    cancelButton.classList.add("margin-right-m");
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

window.prompt = function(headerText, descriptionText, placeholder, matcherFunction = undefined) {
    if (!placeholder) {
        placeholder = descriptionText;
        descriptionText = undefined;
    }
    if (!matcherFunction) {
        matcherFunction = () => {};
    }

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

        input.focus();
        input.addEventListener("keyup", ev => {
            if (ev.key == "Enter" || ev.keyCode == 13) {
                if (input.value.trim() == "" || !matcherFunction(input.value.trim())) {
                    input.classList.add("transition");
                    input.classList.add("error");
                    setTimeout(function() {
                        input.classList.remove("error");
                    }, 2000);
                } else {
                    resolve(input.value.trim());
                    _hide_wrapper(wrapper);
                }
            } else {
                if (input.value != "" && !matcherFunction(input.value.trim())) {
                    input.classList.add("border-red");
                } else {
                    input.classList.remove("border-red");
                }
            }
        });
        okButton.addEventListener("click", ev => {
            if (input.value.trim() == "" || !matcherFunction(input.value.trim())) {
                input.classList.add("transition");
                input.classList.add("error");
                setTimeout(function() {
                    input.classList.remove("error");
                }, 2000);
            } else {
                resolve(input.value.trim());
                _hide_wrapper(wrapper);
            }
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

window.longPrompt = function(headerText, descriptionText, inputPlaceholder, textAreaPlaceholder, inputMatcherFunction = undefined, textAreaMatcherFunction = undefined) {
    if (!inputMatcherFunction) {
        inputMatcherFunction = () => {};
    }
    if (!textAreaMatcherFunction) {
        textAreaMatcherFunction = () => {};
    }

    return new Promise(function(resolve, reject) {
        if (document.getElementById("prompt")) {
            reject(new Error("another alert is already shown"));
            return;
        }

        const [wrapper, box, customBox, buttonsBox, okButton, cancelButton, header, content] = _get_wrapper();
        
        const inputBox = document.createElement("div");
        inputBox.classList.add("input");
        const input = document.createElement("input");
        input.placeholder = " ";
        const placeholderEl = document.createElement("span");
        placeholderEl.innerHTML = inputPlaceholder;

        const textAreaBox = document.createElement("div");
        textAreaBox.classList.add("input");
        const textArea = document.createElement("textarea");
        textArea.placeholder = " ";
        textArea.classList.add("v-resize");
        const textAreaPlaceholderEl = document.createElement("span");
        textAreaPlaceholderEl.innerHTML = textAreaPlaceholder;

        inputBox.appendChild(input);
        inputBox.appendChild(placeholderEl);
        textAreaBox.appendChild(textArea);
        textAreaBox.appendChild(textAreaPlaceholderEl);

        customBox.appendChild(inputBox);
        customBox.appendChild(textAreaBox);

        document.getElementById("no-break").appendChild(wrapper);

        header.innerHTML = headerText;
        content.innerHTML = descriptionText;

        let tryToSubmit = function() {
            if (inputMatcherFunction(input.value.trim()) && textAreaMatcherFunction(textArea.value.trim())) {
                resolve({input: input.value.trim(), text: textArea.value.trim()});
                _hide_wrapper(wrapper);
            }
        }

        input.focus();
        input.addEventListener("keyup", ev => {
            if (ev.key == "Enter" || ev.keyCode == 13) {
                if (input.value.trim() == "" || !inputMatcherFunction(input.value.trim())) {
                    input.classList.add("transition");
                    input.classList.add("error");
                    setTimeout(function() {
                        input.classList.remove("error");
                    }, 2000);
                } else {
                    textArea.focus();
                }
            } else {
                if (input.value != "" && !inputMatcherFunction(input.value.trim())) {
                    input.classList.add("border-red");
                } else {
                    input.classList.remove("border-red");
                }
            }
        });
        okButton.addEventListener("click", ev => {
            if (input.value.trim() == "" || !inputMatcherFunction(input.value.trim())) {
                input.classList.add("transition");
                input.classList.add("error");
                setTimeout(function() {
                    input.classList.remove("error");
                }, 2000);
            } else {
                tryToSubmit();
            }
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


window.dispatchEvent(new Event("alertOverride"));