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
		hideSlotToolTip();
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
	
		showAddSlotTooltip();
	}
});

function setSelectionSlot(slotName, color) {
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

		sendNewSelection(window.getSelection().baseNode.parentNode);

		return;
	}

	const newNode = document.createElement("span");
	newNode.setAttribute("style", "background-color: " + color + ";color:#fff;");
	newNode.setAttribute("class", "highlighter");
	newNode.setAttribute("data-slot", slotName);
	range.surroundContents(newNode);

	wrappedNodes.push(newNode);

	sendNewSelection(window.getSelection().baseNode.parentNode);
}

function sendNewSelection(node) {
	const values = node.children[0].childNodes;
	
	const data = [];

	for (let i = 0; i < values.length; i++) {
		const v = values[i];
		if (v.nodeName == "#text") {
			if (v.data.trim() != "") {
				data.push({text: v.data.replace(/\t/g, "").replace(/\n/g, "")});
			}
		} else {
			data.push({text: v.innerText.replace(/\t/g, "").replace(/\n/g, ""), entity: v.dataset.slot, slot_name: v.dataset.slot});
		}
	}

	let sentenceIndex = node.dataset.index;

	console.log(data, sentenceIndex, node.children);

	get(`/intent/edit?changeSelection&intent=${getParam("name")}&index=${sentenceIndex}&data=${JSON.stringify(data)}`).then(d => {
		if (d == "ok") {
			setStatus("green", "Successfully modified slots");
		} else {
			setStatus("red", d.split("|")[1]);
		}
	});
}

function hideSlotToolTip() {
	try { 
		document.querySelector(".slot-tooltip").outerHTML = ""
	} catch (error) {}
}
function showAddSlotTooltip() {
	const colorsAndNames = [];
	const els = document.querySelectorAll(".slots-container .slot");
	
	for (let i = 0; i < els.length; i++) {
		colorsAndNames.push({
			color: els[i].children[0].dataset.color,
			name: els[i].children[1].innerText.trim(),
		});
	}
	
	hideSlotToolTip();

	let htmlCode = `<div class="slot-tooltip visible" style="left:${mouseX}px;top:${mouseY+15}px">`;
	colorsAndNames.forEach(e => {
		htmlCode += `<div onmousedown="setSelectionSlot('${e.name}', '${e.color}')" style="background-color:${e.color}">${e.name}</div>`;
	});
	htmlCode += "</div>";
	
	document.getElementById("no-break").innerHTML += htmlCode;
}
