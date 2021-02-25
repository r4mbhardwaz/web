class JarvisStatus {
	get NOT_AVAILABLE() {
		document.querySelector("#service-start").classList.add("hidden");
		document.querySelector("#service-stop").classList.add("hidden");
		document.querySelector("#service-restart").classList.add("hidden");
	}
	get NOT_RUNNING() {
		document.querySelector("#service-start").classList.remove("hidden");
		document.querySelector("#service-stop").classList.add("hidden");
		document.querySelector("#service-restart").classList.add("hidden");
	}
	get RUNNING() {
		document.querySelector("#service-start").classList.add("hidden");
		document.querySelector("#service-stop").classList.remove("hidden");
		// document.querySelector("#service-restart").classList.remove("hidden");
	}
}
function retrieveJarvisStatus() {
	get(`${window.location.protocol}//${window.location.host}:1884/status`, 
		{
			timeout: 4000,
			ontimeout: function() {
				document.querySelector("#service-status .sub:nth-child(2)").innerHTML = "<div><span>Jarvis:</span><div class='dot red'></div></div>";
				jarvisStatus.NOT_AVAILABLE;
			},
			onerror: function() {
				document.querySelector("#service-status .sub:nth-child(2)").innerHTML = "<div><span>Jarvis:</span><div class='dot red'></div></div>";
				jarvisStatus.NOT_AVAILABLE;		
			}
		}).then(d => {
			d = JSON.parse(d);
			
		let nameDisplays = {
			"hotword": "Hotword",
			"stt": "Speech-To-Text",
			"nlu": "NLU",
			"lights": "Lights"
		}
	
		if (d.success) {
			let code = "";
			
			let running = true;

			for (service in d.message) {
				const color = d.message[service] == "Running" ? "green" : "red";

				if (d.message[service] == "Not Running") {
					running = false;
				}

				code += `<div>
					<span>${nameDisplays[service] || service}:</span>
					<div class="dot ${color}"></div>
				</div>`;
			}
	
			document.querySelector("#service-status .sub:nth-child(2)").innerHTML = code;

			if (running) {
				jarvisStatus.RUNNING;
			} else {
				jarvisStatus.NOT_RUNNING;
			}
		}
	}).catch(e => {
		if (typeof e != "undefined") {
			console.log(e);
		}
	});
}

const jarvisStatus = new JarvisStatus();

retrieveJarvisStatus();
setInterval(retrieveJarvisStatus, 2000);

document.querySelector("#service-restart").addEventListener("click", function() {
	get(`${window.location.protocol}//${window.location.host}:1884/restart`).then(d => console.log(d))
});
document.querySelector("#service-stop").addEventListener("click", function() {
	get(`${window.location.protocol}//${window.location.host}:1884/stop-all`).then(d => console.log(d))
});
document.querySelector("#service-start").addEventListener("click", function() {
	get(`${window.location.protocol}//${window.location.host}:1884/start-all`).then(d => console.log(d))
});


