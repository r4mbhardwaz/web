document.querySelectorAll("i[data-visibilityfor]").forEach(_el => {
    const el = _el;
    el.addEventListener("click", ev => {
        if (el.innerHTML == el.dataset.on) {
            document.getElementById(el.dataset.visibilityfor).type = "text";
            el.innerHTML = el.dataset.off;
        } else {
            document.getElementById(el.dataset.visibilityfor).type = "password";
            el.innerHTML = el.dataset.on;
        }
    });
});

document.querySelectorAll("[data-visiblewhen]").forEach(_el => {
    const el = _el;
    const event = el.dataset.visiblewhen.split(":")[0];
    const target = el.dataset.visiblewhen.split(":")[1];
    el.classList.add("hidden");

    document.querySelectorAll(target).forEach(_el2 => {
        const el2 = _el2;
        el2.addEventListener("input", ev => {
            switch (event) {
                case "checked":
                    el.classList.remove(el2.checked ? "hidden" : "visible");
                    el.classList.add(el2.checked ? "visible" : "hidden");
                    break;
                default:
                    break;
            }
        })
    });
});

window._updateLabelFileConnectorHandler = _el => {
    const el = _el;
    let target = document.getElementById(el.getAttribute("for"));
    target.addEventListener("input", ev => {
        el.innerHTML = target.files.length > 0 ? `${target.files.length} file${target.files.length > 1 ? "s" : ""} selected` : `No files selected`;
    });
};

window.updateLabelFileConnector = function() {
    document.querySelectorAll("label[data-fileinput]").forEach(window._updateLabelFileConnectorHandler);
};

document.querySelectorAll(".settings").forEach(_el => {
    const el = _el;
    el.children[1].classList.add("hidden");

    el.addEventListener("click", _ev => {
        document.querySelectorAll(".box > .settings").forEach(_el => {
            _el.children[1].classList.remove("visible");
            _el.children[1].classList.add("hidden");
        });

        _ev.stopPropagation();
        el.children[1].classList.remove("hidden");
        el.children[1].classList.add("visible");
    });

    window.addEventListener("click", ev => {
        if (!el.contains(ev.target)) {
            el.children[1].classList.remove("visible");
            el.children[1].classList.add("hidden");
        }
    });
});

function onInputFinish(newValue, target, newElement, callback, oldValue = "") {
    if (target.contains(newElement)) {
        try {
            target.removeChild(newElement);
            if (newValue.trim() != "" || target.dataset.editableAllowEmpty) {
                target.childNodes[0].nodeValue = newValue;
                try {
                    if (oldValue != newValue) {
                        callback(newValue, target, oldValue);
                    }
                } catch(er) {
                    console.error("no or invalid callback defined", er, callback);
                }
            }
        } catch (er) { console.error("harmless exception", er) }
    }
};

window.dataEditable = function(ev) {
    try {
        const target = ev.currentTarget;
        
        const currentText = target.innerText;

        const el = document.getElementById("current-data-editable");
        if (el) {
            onInputFinish(el.value, el.parentNode, el, el.value);
            el.remove();
        }

        const callback = window[target.dataset.editablecallback];

        const newElement = document.createElement("input");
        newElement.classList.add("absolute");
        newElement.classList.add("left-0");
        newElement.classList.add("top-0");
        newElement.classList.add("bg-white");
        newElement.classList.add("width-full");
        newElement.style.padding = "5px 18px";
        newElement.id = "current-data-editable";

        newElement.placeholder = currentText;
        newElement.value = currentText;

        target.appendChild(newElement);
        newElement.focus();

        newElement.addEventListener("blur", ev => {
            ev.stopImmediatePropagation();
            onInputFinish(newElement.value, target, newElement, callback, currentText);
        });
        
        newElement.addEventListener("keydown", ev => {
            ev.stopImmediatePropagation();
            if (ev.key == "Enter" || ev.keyCode == 13) {
                onInputFinish(newElement.value, target, newElement, currentText);
            }
        });
    } catch (er) {
        console.error("microactions:data-editable", er);
    }
};

window.updateDataEditable = function() {
    qry("[data-editable]").click(dataEditable);
};

updateDataEditable();

window.loading = function(el) {
    const oldInnerHTML = el.innerHTML;
    el.setAttribute("data-loading-oldinnerhtml", oldInnerHTML);
    el.innerHTML = "loop";
    el.classList.add("rotating");
};

window.loadingStop = function(el) {
    const oldInnerHTML = el.getAttribute("data-loading-oldinnerhtml");
    el.innerHTML = oldInnerHTML;
    el.classList.remove("rotating");
};

window.infiniteScroll = function (onEndPromise, elementToAppend, wrapper = window, reverse = false, pixelDifference = 300) {
    console.log("infiniteScroll initialized");
    function scroller(ev) {
        try {
            if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - pixelDifference) {
                onEndPromise().then(d => {
                    if (reverse) {
                        elementToAppend.innerHTML = d + elementToAppend.innerHTML;
                    } else {
                        elementToAppend.innerHTML += d;
                    }
                }).catch(er => {
                    console.error("infiniteScroll:onEndPromise", er);
                });
            }
        } catch (er) {
            console.error("infiniteScroll scroller", er);
        }
    }
    wrapper.addEventListener("scroll", scroller);
};

window.bottomNews = function(message, color="green", timeout=1000) {
    if (document.getElementById("bottom-news")) { return; }
    const news = document.createElement("div");
    news.id = "bottom-news";
    news.classList.value = `fixed bottom-l left-0 right-0 clickable bg-white v-padding h-padding-l border border-radius border-${color} box-shadow-1 slide-into-view`;
    news.style.margin = "auto";
    news.style.width = "fit-content";

    const msg = document.createElement("span");
    msg.innerHTML = message;

    news.appendChild(msg);
    document.getElementById("no-break").appendChild(news);  
    news.addEventListener("click", window.hideBottomNews);

    if (timeout > 0) {
        setInterval(function() {
            hideBottomNews();
        }, timeout);
    }
};

window.hideBottomNews = function() {
    document.getElementById("bottom-news").classList.remove("slide-into-view");
    document.getElementById("bottom-news").classList.add("slide-out-of-view");
    setTimeout(function() {
        document.getElementById("bottom-news").remove();
    }, 300);
};

window.redirect = function(url) {
    // window.location.href = url;
    swup.loadPage({url: url});
};