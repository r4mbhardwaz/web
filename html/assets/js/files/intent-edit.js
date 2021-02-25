function deleteTrainingExample(el) {
	const _el = el;
	const index = el.parentElement.children[0].dataset.index;

	get(`/intent/edit?deleteTrainingExample&intent=${getParam("name")}&index=${index}`).then(d => {
		if (d == "ok") {
			setStatus("green", "Successfully deleted training example");
			_el.parentElement.outerHTML = "";
			reIndex();
		} else {
			setStatus("red", d.split("|")[1]);
		}
	})
}
function reIndex() {
	let elements = document.querySelectorAll(".training-examples > .training-example");

	for (let i = 0; i < elements.length; i++) {
		elements[i].children[0].dataset.index = i;
	}

	document.querySelector(".values > .slots-info h2").childNodes[0].data = elements.length + " Training Examples"
}

try {
	document.querySelector(".input-field > .input-new > input").addEventListener("keyup", e => {
		if (e.key === "Enter" || e.keyCode === 13) {
			addTrainingExample();
		}
	});
} catch (error) {
	console.error(error);
}
function addTrainingExample() {
	const example = document.querySelector(".input-field > .input-new > input").value;

	get(`/intent/edit?addTrainingExample&intent=${getParam("name")}&example=${example}`).then(d => {
		if (d == "ok") {
			setStatus("green", "Successfully added new training example!");
			document.querySelector(".input-field > .input-new > input").value = "";
			try { document.querySelector(".training-examples > p").outerHTML = ""; } catch (error) {}
			document.querySelector(".training-examples").innerHTML +=
				`<div class="training-example">
					<p class="highlightable"><span>${example}</span></p>
					<button class="iconbutton" onclick="deleteTrainingExample(this)"> <i>delete</i> Delete </button>
				</div>`;
			reIndex();
		} else {
			setStatus("red", d.split("|")[1]);
		}
	})
}
function deleteSlotFromIntent(el, _slot) {
	const element = el;
	const int = getParam("name");
	const slot = _slot;

	get(`/intent/edit?deleteSlotFromIntent&intent=${int}&slot=${slot}`).then(d => {
		if (d == "ok") {
			setStatus("green", "Successfully deleted slot '" + slot + "'");
			element.parentElement.outerHTML = "";
			document.querySelector(".slots-info > h2 > span").innerHTML = document.querySelectorAll(".slots-container > .slot").length + " Slots";
			window.location.reload();
		} else {
			setStatus("red", d.split("|")[1]);
		}
	})
}
