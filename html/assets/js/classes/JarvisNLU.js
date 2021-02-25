// for all relevant pages
document.querySelector("#sidebar").addEventListener("keyup", e => {
	if (e.key === "Enter" || e.keyCode === 13) {
		testAgainstJarvis(document.querySelector("#commander").value);
	}
})
function testAgainstJarvis(input) {
	document.querySelector("#resulter").innerHTML = "<div class='loader'></div>";
	get(`${window.location.protocol}//${window.location.host}:1884/execute?command=${input}`).then(d => {
		d = JSON.parse(d);
		if (d.success) {
			document.querySelector("#resulter").innerHTML = JSON.stringify(d.message, null, 4);
		} else {
			document.querySelector("#resulter").innerHTML = `An unknown error occured!\n${d.message}`;
		}
	}).catch(_ => {
		document.querySelector("#resulter").innerHTML = `No Jarvis instance running on host!`;
	});
}
