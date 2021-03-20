// 
// Connects an intent selection with the given slot
// 

let mouseX = null;
let mouseY = null;
let selection = null;
let wrappedNodes = [];

document.querySelector("body").addEventListener("mousemove", e => {
	mouseX = e.clientX;
	mouseY = e.clientY;
});

document.addEventListener('selectionchange', () => {
    selection = window.getSelection();
    
	if (selection == "") {
        window.hideSlotToolTip();
	} else {
        if (
            (selection.baseNode.parentNode.parentNode.tagName == "P"
            &&
            selection.baseNode.parentNode.parentNode.classList.contains("highlightable")
			)
			||
			(
                selection.baseNode.parentNode.parentNode.parentNode.tagName == "P"
                &&
				selection.baseNode.parentNode.parentNode.parentNode.classList.contains("highlightable")
                )) {
			} else {
				console.log("[dbg] returning out of selection because parent is not paragraph");
				return;
			}
	
            window.showAddSlotTooltip();
	}
});

window.setSelectionSlot = function(slotName, color, id) {
	const range = selection.getRangeAt(0);

	let returning = false;
	wrappedNodes.forEach(n => {
		if (selection.containsNode(n)) {
			console.log("[dbg] returning because selection.containsNode(n)", selection, n);
			returning = true;
		}
	});
	if (returning) { return; }

	if (window.getSelection().baseNode.parentNode.tagName === 'SPAN'
		&& window.getSelection().baseNode.parentNode.classList.contains("highlighter")) { // check if fully wrapped, unwrap
		console.log("[dbg] node in SPAN, unwrapping");
		window.getSelection().baseNode.parentNode.outerHTML = window.getSelection().baseNode.parentNode.innerHTML;
		window.sendNewSelection(window.getSelection().baseNode.parentNode);
        return;
	}

	const newNode = document.createElement("span");
    newNode.classList.add(`highlighter`);
    newNode.classList.add(`bg-${color}`);
    newNode.classList.add("white");
    newNode.classList.add("v-padding-s");
    newNode.classList.add("h-padding");
    newNode.classList.add("border-radius");
	newNode.setAttribute("data-slot", id);
	range.surroundContents(newNode);

	wrappedNodes.push(newNode);

    window.hideSlotToolTip();
	window.sendNewSelection(window.getSelection().baseNode.parentNode);
    
    window.getSelection().removeAllRanges();
}

window.sendNewSelection = function(node) {
	const values = node.children[0].childNodes;
	
	const data = [];

	for (let i = 0; i < values.length; i++) {
		const v = values[i];
		if (v.nodeName == "#text") {
			if (v.data.trim() != "") {
				data.push({text: v.data.replace(/\t/g, "").replace(/\n/g, "")});
			}
		} else {
			data.push({text: v.innerText.replace(/\t/g, "").replace(/\n/g, ""), slot: v.dataset.slot});
		}
	}

    window.submitNewIntentSlotData(node.dataset.trainingexampleid, data);
}

window.hideSlotToolTip = function() {
	try { 
		document.querySelector(".slot-tooltip").outerHTML = ""
	} catch (error) {}
}
window.showAddSlotTooltip = function() {
	const colorsAndNames = [];
	const els = document.querySelectorAll(".custom-intent-slot-list > div");
	
	for (let i = 0; i < els.length; i++) {
		colorsAndNames.push({
			color: els[i].dataset.slotcolor,
			name: els[i].dataset.slotname,
            id: els[i].dataset.slotid
		});
	}

	window.hideSlotToolTip();

	let htmlCode = `<div class="slot-tooltip visible" style="left:${mouseX}px;top:${mouseY+15}px">`;
	colorsAndNames.forEach(e => {
		htmlCode += `<div onmousedown="setSelectionSlot('${e.name}', '${e.color}', '${e.id}')" class="bg-${e.color}">${e.name}</div>`;
	});
	htmlCode += "</div>";
	
	document.getElementById("no-break").innerHTML += htmlCode;
}
