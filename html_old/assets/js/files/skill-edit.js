let allIntentDivs = document.querySelectorAll(".intents-box > .intent.skill");
for (let i = 0; i < allIntentDivs.length; i++) {
	const intentDiv = allIntentDivs[i];
	intentDiv.addEventListener("click", e => {
		if (e.target.tagName == "I" && e.target.classList.contains("invisible")) {
			window.location.href = '/intent/delete?name=' + intentDiv.dataset.name;
		} else {
			window.location.href = '/intent/edit?name=' + intentDiv.dataset.name;
		}
	});
}
