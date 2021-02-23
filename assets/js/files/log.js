const LOG_FILTER = {
	http: true,
	voa: true
}
let oldLog = null;
let logFilter = function(timestamp, type, text) {
	const httpMatch = /http .+/.test(text) && LOG_FILTER.http
	const voaMatch = /voice_activity.+/.test(text) && LOG_FILTER.voa;

	if (httpMatch || voaMatch) {
		return false;
	}
	return true;
};
if (window.location.pathname == "/log") {
	function toggleFilter(type, obj) {
		obj.classList.toggle("active");
		LOG_FILTER[type] = !LOG_FILTER[type];
		insertData(oldLog);
	}
	function fetchLog() {
		get("/log?fetch").then(d => {
			oldLog = d;
			insertData(d);
		});
	}
	function insertData(d) {
		d = JSON.parse(d);
		d = d.filter(i => { return logFilter(i[0], i[1], i[2]) });

		let code = "";

		d.forEach(i => {
			code += `<tr><td>${i[0]}</td><td>${i[1]}</td><td>${i[2]}</td></tr>`;
		});

		document.querySelector("tbody").innerHTML = code;
		document.querySelector("#statistics").innerHTML = d.length + " entries";

		makeSortable();
	}
	setTimeout(fetchLog, 2000);
}
