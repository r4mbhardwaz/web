import { swup } from "./_swup.js";

function init() {
    let impStr = window.location.pathname.substring(1).replaceAll("/", ".") + ".js";
    if (impStr == ".js") {
        impStr = "index.js";
    }
    import ("./pages/" + impStr);
}

init();
swup.on('contentReplaced', init);