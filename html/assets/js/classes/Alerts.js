class Alert {
	constructor(callback, title, cancelText="Cancel", okText="Ok", elementId="append-your-dom-elements-here") {
		this.callback = callback;
		this.title = title;
		this.cancelText = cancelText;
		this.okText = okText;
		this.elementId = elementId;

		this.bgid = `background-box-${Date.now()}`;
		this.boxid = `input-box-${Date.now()}`;
		this.buttonid = `bottom-box-${Date.now()}`;

		this.code = `<div class='background-box' id='${this.bgid}'>
		<div class='input-box' id='${this.boxid}'>
			<p class='header'>${this.title}</p>

			{{ADDITIONAL_STUFF_HERE}}
			
			<div class='bottom-buttons' id='${this.buttonid}'>
				<button class='red cancel'>${this.cancelText}</button>
				<button class='green ok'>${this.okText}</button>
			</div>
		</div></div>`;

		this.datasource = null;
		this.isFileInput = false;
		this.inputid = null;
		this.isSelection = false;
	}
	
	addRawHTML(html) {
		this.code = this.code.replace("{{ADDITIONAL_STUFF_HERE}}", `${html} {{ADDITIONAL_STUFF_HERE}}`);
	}
	
	addDescription(description) {
		this.addRawHTML(`<p class="text">${description}</p>`);
	}

	addInput(placeholder, type, classes="", required=true) {
		this.inputid = "input-" + Date.now();
		this.datasource = "#" + this.inputid;
		this.addRawHTML(`<input type="${type}" class="${classes}" id="${this.inputid}" placeholder="${placeholder}" ${required ? "required" : ""}>`);
	}

	addFileInput(placeholder, formAction, classes="") {
		this.inputid = "input-" + Date.now();
		this.isFileInput = true;
		this.datasource = "#" + this.inputid;
		this.addRawHTML(`
		<form ${formAction !== undefined ? " method='post' action='" + formAction + "' enctype='multipart/form-data'" : ""}>
		<input type='file' name='upload[]' class='${classes}' id='${this.inputid}' style='position:fixed;left:-999px;top:-999px;width:0.1px;visibility:hidden;' multiple>
		<label for='${this.inputid}' class='file-input iconbutton'>
			<i> note_add </i>
			<span>${placeholder}</span>
		</label>
		</form>`);
	}

	addSelection(placeholder, options) {
		this.isSelection = true;

		let selectionCode = "";
		for (let i = 0; i < options.length; i++){
			let opt_id = options[i]["id"];
			let opt_txt = options[i]["text"];
			selectionCode += `<div><input type="radio" name="selection-box" id="option-${opt_id}" value="${opt_id}" required><label for="option-${opt_id}">${opt_txt}</label></div>`;
		}

		this.datasource = 'input[name="selection-box"]:checked';

		this.addRawHTML(`<span class='description'>${placeholder}</span>
		<br><br>
		<div>${selectionCode}</div>`);
	}

	show() {
		document.querySelector("#" + this.elementId).innerHTML = this.code.replace("{{ADDITIONAL_STUFF_HERE}}", "");
		setTimeout(() => {
			if (this.inputid && !this.isFileInput) {
				setTimeout(() => {
					console.log("document.querySelector('#" + this.inputid + "').focus()");
					document.querySelector("#" + this.inputid).focus();
				}, 250);	
			}

			document.querySelector("#" + this.bgid).classList.add("visible");
			document.querySelector("#" + this.boxid).classList.add("visible");

			// FILE INPUT EVENTS
			if (this.isFileInput) {
				document.querySelector("#" + this.inputid).addEventListener("change", e => {
					const numFiles = document.getElementById(this.inputid).files.length;
					document.querySelector("label[for=" + this.inputid + "] > span").innerHTML = numFiles > 0 ? numFiles + " files selected" : "Click to select files";
				});
			}

			// ON BACKGROUND/CLOSE CLICK
			document.querySelector("#" + this.bgid).addEventListener("click", e => {
				if (e.target != document.querySelector("#" + this.bgid)) {
					return;
				}
				if (this.inputid) {
					if (this.isFileInput) {
						this.callback(false, document.querySelector(this.datasource).files);
					} else {
						this.callback(false, document.querySelector(this.datasource).value);
					}
				} else if (this.isSelection) {
					this.callback(false, document.querySelector(this.datasource).value);
				} else {
					this.callback(false);
				}
				document.querySelector("#" + this.boxid).classList.remove("visible");
				document.querySelector("#" + this.bgid).classList.remove("visible");
				setTimeout(() => {
					document.querySelector("#" + this.bgid).outerHTML = "";
				}, 250);
			});

			// CANCEL BUTTON CLICK
			document.querySelector("#" + this.buttonid + " .cancel").addEventListener("click", e => {
				if (this.inputid) {
					if (this.isFileInput) {
						this.callback(false, document.querySelector(this.datasource).files);
					} else {
						this.callback(false, document.querySelector(this.datasource).value);
					}
				} else if (this.isSelection) {
					this.callback(false, document.querySelector(this.datasource).value);
				} else {
					this.callback(false);
				}
				document.querySelector("#" + this.boxid).classList.remove("visible");
				document.querySelector("#" + this.bgid).classList.remove("visible");
				setTimeout(() => {
					document.querySelector("#" + this.bgid).outerHTML = "";
				}, 250);
			});

			// OKAY BUTTON CLICK
			document.querySelector("#" + this.buttonid + " .ok").addEventListener("click", e => {
				if (this.inputid) {
					if (this.isFileInput) {
						this.callback(true, document.querySelector(this.datasource).files);
					} else {
						this.callback(true, document.querySelector(this.datasource).value);
					}
				} else if (this.isSelection) {
					this.callback(false, document.querySelector(this.datasource).value);
				} else {
					this.callback(true);
				}
				document.querySelector("#" + this.boxid).classList.remove("visible");
				document.querySelector("#" + this.bgid).classList.remove("visible");
				setTimeout(() => {
					document.querySelector("#" + this.bgid).outerHTML = "";
				}, 250);
			});

			// ATTACH INPUT LISTENER
			if (this.inputid) {
				document.querySelector("#" + this.inputid).addEventListener("keyup", e => {
					if (e.key === "Enter" || e.keyCode === 13) {
						this.callback(true, document.querySelector("#" + this.inputid).value);
						document.querySelector("#" + this.boxid).classList.remove("visible");
						document.querySelector("#" + this.bgid).classList.remove("visible");
					}
				});
			}
		}, 0);	
	}
}





function launchAlert(callback, title, text, cancelText="Cancel", okText="Ok") {
	const alert = new Alert(callback, title, cancelText, okText);
	alert.addDescription(text);
	alert.show();
}
function launchInput(callback, title, placeholder, cancelText="Cancel", okText="Ok", passwd=false) {
	const alert = new Alert(callback, title, cancelText, okText);
	alert.addInput(placeholder, passwd ? "password" : "text", "blue");
	alert.show();
}
function launchFileInput(callback, title, placeholder, formAction=undefined, cancelText="Cancel", okText="Ok") {
	const alert = new Alert(callback, title, cancelText, okText);
	alert.addFileInput(placeholder, formAction, "blue");
	alert.show();
}
function launchSelection(callback, title, placeholder, options, cancelText="Cancel", okText="Ok") {
	const alert = new Alert(callback, title, cancelText, okText);
	alert.addSelection(placeholder, options);
	alert.show();
}
