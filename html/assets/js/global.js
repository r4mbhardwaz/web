import { swup } from "./lib/_swup.js";
import "./http.js";

async function init() {
    let pagename = window.location.pathname.substring(1).replaceAll("/", ".").replace(/[a-f0-9.]{6,}/, "");
    let impStr = pagename + ".js";
    if (impStr == ".js") {
        impStr = "index.js";
    }
    console.log("[module] trying to load", impStr);

    await import ("./inputs.js?_no_cache=" + Date.now()).catch(console.error);
    await import ("./shorthand.js?_no_cache=" + Date.now()).catch(console.error);
    await import ("./microactions.js?_no_cache=" + Date.now()).catch(console.error);

    await import ("./nlu.js?_no_cache=" + Date.now()).catch(console.error);

    try {
        import ("./pages/" + impStr + "?_no_cache=" + Date.now());
    } catch (error) {}
}

let infoBoxVisible = false;

window.showInfoBox = function(element, htmlText) {
    if (infoBoxVisible) { return false; }
    infoBoxVisible = true;
    const rect = element.getBoundingClientRect();

    const containerId = "info-box-container-" + Date.now();
    const contentId = "info-box-content-" + Date.now();

    const htmlCode =
        `<div id="${containerId}" class="info-box-container" style="top:${rect.top}px;left:${rect.left}px">
		<p class="info-box-content" id="${contentId}">${htmlText}</p>
	</div>`;

    document.querySelector("div#no-break").innerHTML += htmlCode;

    setTimeout(function() {
        document.querySelector("#" + containerId).classList.add("visible");
    }, 0);

    // console.log(rect.top, rect.right, rect.bottom, rect.left);
};

window.removeInfoBox = function(all = true) {
    const allBoxes = document.querySelectorAll(".info-box-container");
    for (let i = 0; i < allBoxes.length; i++) {
        const box = allBoxes[i];
        box.classList.remove("visible");
        setTimeout(function() {
            infoBoxVisible = false;
            box.outerHTML = "";
        }, 250);
    }
};

window.swup = swup

init();
swup.on('contentReplaced', init);
