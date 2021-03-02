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

document.querySelectorAll("label[data-fileinput]").forEach(_el => {
    const el = _el;
    let target = document.getElementById(el.getAttribute("for"));
    target.addEventListener("input", ev => {
        el.innerHTML = target.files.length > 0 ? `${target.files.length} file${target.files.length > 1 ? "s" : ""} selected` : `No files selected`;
    });
});

document.querySelectorAll(".box > .settings").forEach(_el => {
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