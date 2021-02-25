function updatePSK() {
	launchInput((success, input) => {
		if (success) {
			localStorage["pre-shared-key"] = input;				
		} else {
			setTimeout(updatePSK, 1000);
		}
	}, "Enter pre-shared key", "Pre-shared key", "Cancel", "Ok", true);
}
function updateTKK(onSuccess=()=>{}) {
	launchInput((success, input) => {
		console.log(success, input);
		if (success) {
			localStorage["token-key"] = input;
			onSuccess(input);
		} else {
			setTimeout(updateTKK, 1000);
		}
	}, "Enter token-key", "Token-key", "Cancel", "Ok", true);
}
function generateToken(tkk) {
	launchSelection((success, permLevel) => {
		if (!success) { return; }
			post(`${window.location.protocol}//${window.location.host}:2021/generate-token`, {"token-key":tkk, "permission-level":permLevel}).then(d => {
				d = JSON.parse(d);
				if (d.success) {
					launchAlert(_=>{}, "Token", `Your token is ${d.token}.<br>This token is valid for 2 minutes. Enter it on your mobile app, desktop app or in your browser! <div id="qrcode"></div>`);
					setTimeout(function() {
						new QRCode(document.getElementById("qrcode"), {
							text: `http://jarvis.local:2021/jarvis-qr?host=${window.location.host}&psk=${localStorage["pre-shared-key"]}&token=${d.token}`,
							width: 128,
							height: 128,
							colorDark : "#000000",
							colorLight : "#ffffff",
							correctLevel : QRCode.CorrectLevel.H
						});
					})
				} else {
					launchAlert(_=>{
						updateTKK();
					}, "Token", "Couldn't generate token...");
				}
			}).catch(e => {
				console.error(e);
			});	
		}, "Permission", "Choose a permission type for your application:", [
			{"id": "4", "text": "Admin device (full access, use with care)"},
			{"id": "3", "text": "End device (most features, store data and call emergencies)"},
			{"id": "2", "text": "Scanner device (read-only device, fetch data and answers emergencies)"},
			{"id": "1", "text": "Dumb device (no features, register only)"}
		], "Cancel", "Submit");
}


if (typeof localStorage["pre-shared-key"] == "undefined") {
	updatePSK();
}


document.querySelector("#new-device").addEventListener("click", function() {
	if (typeof localStorage["token-key"] == "undefined") {
		updateTKK(generateToken);
	} else {
		generateToken(localStorage["token-key"]);
	}
});


function retrieveDeviceList() {
	if (typeof localStorage["token-key"] == "undefined") { updateTKK(retrieveDeviceList); return; }
	post(`/devices?getTable`, {"token-key":localStorage["token-key"]}).then(d => {
		if (d != "") {
			document.querySelector("#tbody").innerHTML = d;

			document.querySelectorAll(".delete-device").forEach(element => {
				element.addEventListener("click", function() {
					console.log("delete-device");
					post(`${window.location.protocol}//${window.location.host}:2021/unregister-device`, {"token-key": localStorage["token-key"], token: this.dataset.token}).then(d => {
						d = JSON.parse(d);	
						if (d.success) {
							launchAlert(_=>{}, "Unregister Device", `Successfully unregistered device!`);
						} else {
							launchAlert(_=>{}, "Unregister Device", `Failed to unregistered device!`);
						}
					}).catch(()=>{
						launchAlert(_=>{}, "Unregister Device", `Failed to contact Jarvis server!`);
					});
				})
			});			
		}
	});
}
retrieveDeviceList();
setInterval(retrieveDeviceList, 2000);
