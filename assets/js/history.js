document.querySelector("h1").addEventListener("click", e => { window.location.href="/history/" });


function get(url) {
	url = (url.includes("?") ? url + "&_no_cache=" + Date.now() : "?_no_cache=" + Date.now());
	console.log("[get]", url);
	return new Promise(function(accept, reject) {
		var xmlHttp = new XMLHttpRequest();
		xmlHttp.onreadystatechange = function() { 
			if (xmlHttp.readyState == 4) {
				if (xmlHttp.status == 200) {
					accept(xmlHttp.responseText)
				} else {
					reject();
				}
			}
		}
		xmlHttp.open("GET", url, true); 
		xmlHttp.send(null);
	});
}


const pxPadding = 20;
const pxMarginTop = 50;
if (window.location.pathname == "/history/") {
	function newBoxAnimation() {
			// insert animation:
			setTimeout(function() {
				const x = document.querySelectorAll("#updates > div");
				const newElement = x[x.length - 1];
				
				const newHeight = newElement.getBoundingClientRect().height * 2;	// *2 because css: scale(0.5);
		
				document.querySelectorAll("#updates > div:not(.hidden)").forEach(x => {
					const tf = x.style.transform;
					if (tf == "") {
						x.style.transform = `translateY(${newHeight + pxPadding}px)`;
					} else {
						let px = parseFloat(tf.split("(")[1].split("px")[0]);
						px += newHeight + pxPadding;
						x.style.transform = `translateY(${px}px)`;
					}
				});
		
				newElement.style.transform = `translateY(${pxMarginTop + newHeight}px)`;
				newElement.classList.remove("hidden");
		
				const tl = document.querySelector("#timeline");
				const th = tl.style.height;
				if (th == "") {
					tl.style.height = newHeight - 14 + "px";	// -14 (-7 * 2) because the line should be smaller than the boxes
				} else {
					tl.style.height = parseFloat(th.replace("px", "")) + newHeight + pxPadding + "px";
				}
			});	
	}
	function addUpdate(data) {
		if (data.id == "info") {
			addInfo(data.message);
			return;
		}
		if (data.id == "error") {
			addError(data.message);
			return;
		}
		document.querySelector("#updates")
			.innerHTML += `<div class="update hidden" onclick="window.location.href = '/history/show?id=${data.id}'">
				<div class="dot">flash_on</div>
	
				<div class="data">
					<div class="time" data-ts=${data.timestamp}>${ago(new Date(Date.now() - data.timestamp))}</div>
					<div class="action">${data.skill ? "" : ""} <!--i>trending_flat</i--> ${data.intent}</div>
					<div class="utterance">${data.utterance}</div>
				</div>
			</div>`;
		newBoxAnimation();
	}
	function addInfo(message) {
		document.querySelector("#updates")
			.innerHTML += `<div class="info hidden">
				<div class="dot" style="transform:rotate(180deg) translateX(-2px)">priority_high</div>
				
				<div class="data">
					<div class="time" data-ts=${Date.now()}>Right now</div>
					<div class="action">Info</div>
					<div class="utterance nobrackets">${message}</div>
				</div>
			</div>`;
		newBoxAnimation();
	}
	function addError(message) {
		document.querySelector("#updates")
			.innerHTML += `<div class="error hidden">
				<div class="dot">priority_high</div>
				
				<div class="data">
					<div class="time" data-ts=${Date.now()}>Right now</div>
					<div class="action">Error</div>
					<div class="utterance nobrackets">${message}</div>
				</div>
			</div>`;
		newBoxAnimation();
	}
	
	function ago(millis) {
		const seconds = millis / 1000;
		
		if (seconds < 10) {
			return "A few moments ago";
		} else if (seconds < 60) {
			return seconds.toFixed(0) + " seconds ago";
		} else if (seconds < 60 * 60) {
			return (seconds / 60).toFixed(0) + " minutes ago";
		} else if (seconds < 60 * 60 * 24) {
			return (seconds / (60 * 60)).toFixed(0) + " hours ago";
		} else {
			return (seconds / (60 * 60 * 24)).toFixed(0) + " days ago";
		}
	}
	
	function updateTimestamps() {
		document.querySelectorAll("#updates > div > .data > .time").forEach(x => {
			const ts = x.dataset.ts;
			x.innerHTML = ago(Date.now() - ts);
		});
	}
	setInterval(updateTimestamps, 300);
	
	
	get("/history/?getLatest&count=5").then(d => {
		d = JSON.parse(d)
		if (d.ok) {
			d.actions.forEach((el, i) => {
				setTimeout(_=>{ addUpdate(el) }, 300 * i);
			});
		} else {
			addError("Couldn't fetch Jarvis history!");
		}
	}).catch(_ => {
	
	});
}

if (window.location.pathname == "/history/show") {
	
}