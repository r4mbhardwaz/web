let allSelected = false;
let stopPropagation = undefined;
let skillExportEventListenersSet = false;
const allSkills = document.querySelectorAll(".skill.clickable");
for (let i = 0; i < allSkills.length; i++) {
	const skill = allSkills[i];
	const id = skill.dataset.id;

	skill.addEventListener("click", e => {
		if (e.target.tagName == "I" && e.target.classList.contains("invisible")) {
			window.location.href = "/skill/delete?id=" + id;
			return;
		}
		if (!stopPropagation) {
			window.location.href = "/skill/edit?id=" + id;
		}
	});
}

document.querySelector("#import-skills-button").addEventListener("click", function() {
	launchFileInput(console.info, 'Import Skills from file', 'Upload a file', '/import');
});

function startSelectionForExportSkill() {
	if (stopPropagation) {	// if Export is clicked twice
		cancelSkillExport();
		return;
	}
	let skills = document.querySelectorAll("div.skill.clickable");
	stopPropagation = true;
	for (let i = 0; i < skills.length; i++) {
		const skill = skills[i];
		skill.classList.add("select");
		if (!skillExportEventListenersSet) {
			skill.addEventListener("click", e => {
				skill.classList.toggle("selected");
			});
		}
	}
	skillExportEventListenersSet = true;
	document.getElementById("export-skills-buttons").classList.add("visible");
}
function selectAllSkillExport() {
	if (allSelected) {
		deleteSelectionSkillExport();
		document.querySelector("#export-skills-buttons > button > span").innerHTML = "Select all";
		return;
	}
	document.querySelector("#export-skills-buttons > button > span").innerHTML = "Unselect all";
	allSelected = true;
	const x = document.querySelectorAll("div.skill.clickable");
	for (let i = 0; i < x.length; i++) {
		x[i].classList.add("selected");
	}
}
function deleteSelectionSkillExport() {
	allSelected = false;
	const x = document.querySelectorAll("div.skill.clickable");
	for (let i = 0; i < x.length; i++) {
		x[i].classList.remove("selected");
	}
}
function confirmSkillExport() {
	const selectedSkills = document.querySelectorAll("div.skill.clickable");
	const skillIds = [];
	for (let i = 0; i < selectedSkills.length; i++) {
		if (selectedSkills[i].classList.contains("selected")) {
			skillIds.push(selectedSkills[i].dataset.id);
		}
	}
	if (skillIds.length == 0) { return; }
	deleteSelectionSkillExport();
	cancelSkillExport();
	postToUrl("export", {
		skills: skillIds
	});
}
function cancelSkillExport() {	// finished
	document.getElementById("export-skills-buttons").classList.remove("visible");
	let skills = document.querySelectorAll("div.skill.clickable");
	for (let i = 0; i < skills.length; i++) {
		const skill = skills[i];
		skill.classList.remove("select");
	}
	stopPropagation = undefined;
}
