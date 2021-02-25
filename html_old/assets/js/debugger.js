function askForToken() {
	if (!localStorage["token"]) {
		launchInput((success, text) => {
			if (!success) {
				askForToken();
			}
	
			localStorage["token"] = text;
			
			if (!localStorage["pre-shared-key"]) {
				askForPSK();
			}
		}, "Enter application token", "Application token");
	}
}
function askForPSK() {
	if (!localStorage["pre-shared-key"]) {
		launchInput((success, text) => {
			if (!success) {
				askForPSK();
			}
	
			localStorage["pre-shared-key"] = text;
			
			if (!localStorage["token"]) {
				askForToken;
			} else {
				checkStorage();
			}

		}, "Enter pre-shared key", "Pre-shared key");
	}
}


function checkStorage() {
	if (localStorage["token"] && localStorage["pre-shared-key"]) {
		connectToBackend();
	}

	if (!localStorage["token"]) {
		askForToken();
	}
	if (!localStorage["psk"]) {
		askForPSK();
	}
}
checkStorage();


let logging = false
function connectToBackend() {
	const TOKEN = localStorage["token"]
	const PSK = localStorage["pre-shared-key"]

	Jarvis.connect(window.location.host, PSK, TOKEN, "Debugger").then(d => {
		setInterval(()=>{
			Jarvis.hello();
		}, 5000);
	}).catch(e => {
		launchAlert(()=>{}, "Error", "Couldn't connect to Jarvis backend <br> " + e);
	});
}
function startDebugging() {
	if (!Jarvis.CONNECTED) {
		launchAlert(()=>{}, "Error", "Jarvis is not connected");
		return;
	}
	
	document.querySelector("#start-debug").classList.add("hidden");
	document.querySelector("#stop-debug").classList.remove("hidden");

	document.querySelectorAll("#buttons .filter").forEach(x => {
		x.classList.add("hidden");
	});

	document.querySelector("#contents").innerHTML = "";


	Jarvis.startDebug().then(d => {
		logging = true;
	}).catch(e => {
		launchAlert(()=>{}, "Error", "Failed to start debug session. <br> " + e);
	});
}
function stopDebugging() {
	if (!Jarvis.CONNECTED) {
		launchAlert(()=>{}, "Error", "Jarvis is not connected");
		return;
	}

	document.querySelector("#start-debug").classList.remove("hidden");
	document.querySelector("#stop-debug").classList.add("hidden");

	document.querySelectorAll("#buttons .filter").forEach(x => {
		x.classList.remove("hidden");
	});

	Jarvis.stopDebug().then(d => {
		logging = false;
	}).catch(e => {
		launchAlert(()=>{}, "Error", "Failed to start debug session. <br> " + e);
	});
}


function retrieveLogData() {
	if (!logging) {
		return;
	}
	Jarvis.scanDebug().then(d => {
		console.log(d);

		d.forEach(x => {
			addContent(x);
		});
	}).catch(e => {
		console.error("retrieveLogData - " + e);
	});
}
setInterval(retrieveLogData, 500);



let devices = null;
function addContent(loggingGroup) {
	/*
		loggingGroup {
			meta: {
				timestamp: 123,
				ip: "192.168.0.1",
				token: "abcdef"
			},
			data: [
				{
					severity: "I",
					message: "somestr",
					tag: "Body" | "Path" | "Response"
				}
			]
		}
	*/


	if (devices == null) {
		Jarvis.getDevices().then(d => {
			devices = d;
			addContent(loggingGroup)
		}).catch(e => {
			console.error(e);
		});
		return;
	}

	let getIconForType = c => {
		return {
			"W": "warning",
			"I": "info",
			"S": "check_circle",
			"E": "error"
		}[c];
	}
	let getColorForType = c => {
		return {
			"W": "orange",
			"I": "blue",
			"S": "green",
			"E": "red"
		}[c];
	}


	let code = "";
	
	let device = devices[loggingGroup.meta.token];
	let connection, status, type, ip, last_active, name;

	if (device) {
		connection = device["connection"];		// "app", "web"
		status = device["status"];				// red, orange, green
		type = device["type"];					// mobile, desktop, ...
		ip = device["ip"];
		last_active = device["last-active"];
		name = device["name"];
	}

	if (name == "Debugger") { return; }

	let requestPath = null;

	loggingGroup.data.reverse().forEach(d => {
		if (d.tag == "Path") {
			requestPath = d.message;
		}
		code += `<div>
			<i class="${getColorForType(d.severity)}">${getIconForType(d.severity)}</i>
			<p>${d.tag == "Path" ? name + " requested " + d.message : (d.tag == "Body" ? "Request body:" : "Received response:")}</p>
			<span>${d.tag != "Path" ? JSON.stringify(d.message, null, 4) : ""}</span>
		</div>`;
	});

	document.querySelector("#contents").innerHTML = `<div class="group" data-devname="${name}" data-devip="${ip}" data-devstatus="${status}"  data-filterable="${requestPath}|${ip}|${name}|${connection}|${type}">
	<section class="intro" onclick="this.parentNode.classList.toggle('opened')">
		<span class="${getColorForType(loggingGroup.data[0].severity)}">${requestPath == null ? "From " + (ip || loggingGroup.meta.ip) + " (" + name + ")" : (ip || loggingGroup.meta.ip) + " (" + name + ")" + " -> " + requestPath}</span>
	</section>${code}</div>${document.querySelector("#contents").innerHTML}`;
}


let filters = [];
function applyFilter(filter, element) {
	if (element) {
		element.classList.toggle("blue");
	}
	
	if (filters.indexOf(filter) > -1) {
		filters.splice(filters.indexOf(filter), 1);
	} else {
		filters.push(filter);
	}

	document.querySelectorAll("#contents > div").forEach(el => {
		el.classList.remove("hidden");
		const filterable = el.dataset.filterable;

		for (i in filters) {
			if (filterable.indexOf(filters[i]) > -1) {
				el.classList.add("hidden");
				return;
			}
		}
	});
}



function openConsole() {
	const bgid = "background-box-" + Date.now();
	const boxid = "input-box-" + Date.now();
	document.querySelector("#append-your-dom-elements-here").innerHTML += 
		`<div class='background-box' id='${bgid}'>
		<div class="input-box console" id='${boxid}'>
			<i id="console-close">close</i>
			<p class='header'>Console</p>
			<input placeholder="API endpoint (id/scan, ...)" id="console-url">
			<textarea placeholder="POST body (you can leave out the psk field, we'll do that automatically)" id="console-body"></textarea>
			<button id="console-send" class="iconbutton green"><i>send</i>Execute</button>
			<code id="console-result"></code>
			<code id="console-devices"></code>
		</div></div>`;
	setTimeout(function() {
		document.querySelector("#" + bgid).classList.add("visible");
		document.querySelector("#" + boxid).classList.add("visible");
		document.querySelector("#" + bgid).addEventListener("click", e => {
			if (e.target != document.querySelector("#" + bgid)) {
				return;
			}
			document.querySelector("#" + boxid).classList.remove("visible");
			document.querySelector("#" + bgid).classList.remove("visible");
			setTimeout(function() {
				document.querySelector("#" + boxid).parentElement.outerHTML = "";
			}, 250);
		});
		document.querySelector("#console-close").addEventListener("click", function() {
			document.querySelector("#" + boxid).classList.remove("visible");
			document.querySelector("#" + bgid).classList.remove("visible");
			setTimeout(function() {
				document.querySelector("#" + boxid).parentElement.outerHTML = "";
			}, 250);
		});

		Jarvis.getDevices().then(d => {
			document.querySelector("#console-devices").innerHTML = JSON.stringify(d, null, 4);
		});

		/* API EXECUTION */
		document.querySelector("#console-send").addEventListener("click", function() {
			let endpoint = document.querySelector("#console-url").value;
			let postbody = document.querySelector("#console-body").value;
			
			if (endpoint.startsWith("/")) {
				endpoint = endpoint.substring(1);
			}
			if (endpoint.indexOf("?") == -1) {
				endpoint += "?token=" + Jarvis.TOKEN;
			}

			document.querySelector("#console-url").value = endpoint;

			if (postbody.trim() == "") {
				postbody = "{}";
			}
			try {
				let newpostbody = JSON.parse(postbody)
				newpostbody.psk = Jarvis.PSK;
				postbody = JSON.stringify(newpostbody, null, 4);
			} catch(e) {
				console.error(e);
			}

			document.querySelector("#console-body").value = postbody;

			try {
				Jarvis._post(`${Jarvis._getUrl()}/${endpoint}`, JSON.parse(postbody)).then(d => {
					try {
						document.querySelector("#console-result").innerHTML = JSON.stringify(JSON.parse(d), null, 4);
					} catch(e) {
						console.error(e);
						document.querySelector("#console-result").innerHTML = d;
					}
				}).catch(e => {
					document.querySelector("#console-result").innerHTML = "HTTP Error: <br>" + e;
				});
			} catch (e) {
				document.querySelector("#console-result").innerHTML = e;
			}
		});
	}, 0);
}