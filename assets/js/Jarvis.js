class Jarvis {
	static PORT = 2021;
	static HOST = "";
	static PSK = "";
	static TOKEN = "";
	static CONNECTED = false;

	static connect(host, psk, token, name="Jarvis Desktop") {
		Jarvis.HOST = host;
		Jarvis.PSK = psk;
		Jarvis.TOKEN = token;

		return new Promise(function(resolve, reject) {
			Jarvis._post(`${Jarvis._getUrl()}/register-device?name=${name}&token=${Jarvis.TOKEN}&type=desktop&native=false`, {psk:Jarvis.PSK}).then(d => {
				d = JSON.parse(d);
				
				if (d.success) {
					Jarvis.CONNECTED = true;
					resolve();
				} else {
					Jarvis._post(`${Jarvis._getUrl()}/am-i-registered?token=${Jarvis.TOKEN}`, {psk:Jarvis.PSK}).then(d => {
						d = JSON.parse(d);	
						if (d.success) {
							Jarvis.CONNECTED = true;
							resolve();
						} else {
							Jarvis.CONNECTED = false;
							reject();
						}
					})
				}
			}).catch(()=>{
				Jarvis.CONNECTED = false;
				reject()
			});;
		});
	}
	
	static reconnect(host, psk, token) {
		Jarvis.HOST = host;
		Jarvis.PSK = psk;
		Jarvis.TOKEN = token;
		
		return new Promise(function(resolve, reject) {
			Jarvis._post(`${Jarvis._getUrl()}/am-i-registered?token=${Jarvis.TOKEN}`, {psk:Jarvis.PSK}).then(d => {
				d = JSON.parse(d);
				
				if (d.success) {
					Jarvis.CONNECTED = true;
					resolve();
				} else {
					Jarvis.CONNECTED = false;
					reject();
				}
			}).catch(()=>{
				Jarvis.CONNECTED = false;
				reject()
			});
		})
	}

	static getProperty(token, prop) {
		return new Promise(function(resolve, reject) {
			if (!Jarvis.CONNECTED) { reject(); return; }
			Jarvis._post(`${Jarvis._getUrl()}/get-property${typeof prop == "undefined" ? "" : "?token="+token}`, {psk:Jarvis.PSK, property:(typeof prop == "undefined" ? token : prop)}).then(d => {
				d = JSON.parse(d);
				if (d.success) {
					resolve(d.result);
				} else {
					reject();
				}
			}).catch(()=>{reject()})
		});
	}

	static hello() {
		return new Promise(function(resolve, reject) {
			if (!Jarvis.CONNECTED) { reject(); return; }
			Jarvis._post(`${Jarvis._getUrl()}/hello?token=${Jarvis.TOKEN}`, {psk:Jarvis.PSK}).then(d => {resolve()}).catch(()=>{reject()});
		})
	}

	static instantDecisionScan(target_token, type) {
		return new Promise(function(resolve, reject) {
			if (!Jarvis.CONNECTED) { reject("not connected"); return; }

			let obj = {	psk:Jarvis.PSK	};
			if (typeof type != "undefined") {				obj.type = type;					}
			if (typeof target_token != "undefined") {		obj.target_token = target_token;	}

			Jarvis._post(`${Jarvis._getUrl()}/id/scan?token=${Jarvis.TOKEN}`, obj).then(d => {
				d = JSON.parse(d);
				if (d.success) {
					resolve(d.scan);
				} else {
					reject(d.error || "unknown error");
				}
			}).catch(e => {
				reject(e);
			});
		})
	}

	static startDebug() {
		return new Promise(function(resolve, reject) {
			if (!Jarvis.CONNECTED) { reject("not connected"); return; }

			Jarvis._post(`${Jarvis._getUrl()}/start-debug?token=${Jarvis.TOKEN}`, {psk:Jarvis.PSK}).then(d => {
				d = JSON.parse(d);
				if (d.success) {
					resolve();
				} else {
					reject(d.error || "unknown error");
				}
			}).catch(e => {
				reject(e);
			});
		});
	}

	static scanDebug() {
		return new Promise(function(resolve, reject) {
			if (!Jarvis.CONNECTED) { reject("not connected"); return; }

			Jarvis._post(`${Jarvis._getUrl()}/scan-debug?token=${Jarvis.TOKEN}`, {psk:Jarvis.PSK}).then(d => {
				d = JSON.parse(d);
				if (d.success) {
					resolve(d.data);
				} else {
					reject(d.error || "unknown error");
				}
			}).catch(e => {
				reject(e);
			});
		});
	}
	
	static stopDebug() {
		return new Promise(function(resolve, reject) {
			if (!Jarvis.CONNECTED) { reject("not connected"); return; }

			Jarvis._post(`${Jarvis._getUrl()}/stop-debug?token=${Jarvis.TOKEN}`, {psk:Jarvis.PSK}).then(d => {
				d = JSON.parse(d);
				if (d.success) {
					resolve();
				} else {
					reject(d.error || "unknown error");
				}
			}).catch(e => {
				reject(e);
			});
		});
	}

	static getDevices() {
		return new Promise(function(resolve, reject) {
			if (!Jarvis.CONNECTED) { reject("not connected"); return; }

			Jarvis._post(`${Jarvis._getUrl()}/get-devices?token=${Jarvis.TOKEN}`, {psk:Jarvis.PSK}).then(d => {
				d = JSON.parse(d);
				if (d.success) {
					resolve(d.devices);
				} else {
					reject(d.error || "unknown error");
				}
			}).catch(e => {
				reject(e);
			});
		});
	}
	
	static _getUrl() {
		return `http://${Jarvis.HOST}:${Jarvis.PORT}`;
	}

	static _post(url, jsonData) {
		return new Promise(function(resolve, reject) {
			var xhr = new XMLHttpRequest();
			xhr.open("POST", url, true);
			xhr.setRequestHeader("Content-Type", "application/json");
			xhr.onreadystatechange = function () {
				if (xhr.readyState === 4) {
					if (xhr.status === 200) {
						resolve(xhr.responseText);
					} else {
						reject(xhr.status);
					}
				}
			};
			xhr.onerror = function () {
				reject("host or port unreachable");
			};
			var data = JSON.stringify(jsonData);
			xhr.send(data);
		});
	}
}