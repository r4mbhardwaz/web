const button = document.querySelector("h2 > button");
const buttonText = document.querySelector("h2 > button > span");
button.addEventListener("click", e => {
	if (allSelected) {
		Array.from(document.querySelectorAll(".skill.select")).forEach(x => {
			x.classList.remove("selected");
			removeSkillFromSelection(x.dataset.id);
		});
		buttonText.innerHTML = "Select all";
	} else {
		Array.from(document.querySelectorAll(".skill.select")).forEach(x => {
			x.classList.add("selected");
			addSkillToSelection(x.dataset.id);
		});
		buttonText.innerHTML = "Unselect all";
	}
	allSelected = !allSelected;
});

const selectedSkills = document.querySelector("input[name=selected-skills]");
Array.from(document.querySelectorAll(".skill.select")).forEach(x => {
	x.addEventListener("click", e => {
		x.classList.toggle("selected");
		if (x.classList.contains("selected")) {	// add to selection
			addSkillToSelection(x.dataset.id);
		} else {
			removeSkillFromSelection(x.dataset.id);
		}
	});
});

function addSkillToSelection(skillId) {
	let allSkills = selectedSkills.value.split(",");
	let index = allSkills.indexOf(skillId);
	if (index === -1) {
		allSkills.push(skillId);
	}

	if (allSkills[0] == "") {
		allSkills = allSkills.slice(1);
	}

	selectedSkills.value = allSkills.join(",");
}
function removeSkillFromSelection(skillId) {
	let allSkills = selectedSkills.value.split(",");
	let index = allSkills.indexOf(skillId);
	if (index > -1) {
		allSkills.splice(index, 1);
	}
	selectedSkills.value = allSkills.join(",");
}
