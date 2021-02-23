function addSlotToIntent(intent, slot) {
	window.location.href = `/intent/edit?name=${intent}&addSlot=${slot}`;
}

Array.from(document.querySelectorAll(".slots.skills > .slot")).forEach(x => {
	x.addEventListener("click", e => {
		if (e.target.tagName == "I" && e.target.classList.contains("invisible")) {
			window.location.href = "/slot/delete?slot=" + x.dataset.slot + "&intent=" + getParam("intent");
		} else {
			addSlotToIntent(getParam("intent"), x.dataset.slot);
		}
	});
});
