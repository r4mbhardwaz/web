'use strict';


const FETCH_DEVICES_INTERVALL = 5; // seconds
const DEV_CONTAINER = id("devices-container").get(0);
const ADD_DEVICES = id("add-device").get(0);


ADD_DEVICES.addEventListener("click", ev => {
    if (window.location.hostname == "localhost" || window.location.hostname.startsWith("127.")) {
        alert("Localhost detected", "You cannot register a new device from a localhost address.<br>Please switch to a reachable address");
        return;
    }
    window.prompt("New Device", "Enter device name:", "Device name").then(name => {
        if (!name)
            return;
        post(`/api/device/new`, {
            name: name
        }).then(JSON.parse)
        .then(res => {
            if (!res.success) {
                alert("Failed!", `Could not add new device:<br>${res.error}`);
                return;
            }
            generateQrCode(res.result);
        });
    });
});


let oldData = null;
function fetchDevices() {
    get(`/api/devices`)
        .then(JSON.parse)
        .then(d => {
            if (!d.success) { throw new Error(d.error); }
            if (JSON.stringify(d) == oldData) { return; }
            oldData = JSON.stringify(d);

            qry(".device-entry").forEach(el => el.remove());
            let code = ``;
            d.devices.forEach(el => {
                const devIcons = {
                    computer  :  "computer",
                    jarvis    :  "smart_button",
                    phone     :  "smartphone",
                    mic       :  "mic"
                };
                const security = {
                    color: el.secure ? "green"             : "red",
                    title: el.secure ? "Encrypted Traffic" : "Unencrypted Traffic",
                    icon:  el.secure ? "lock"              : "lock_open",
                };
                const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }; //, hour: 'numeric', minute: 'numeric' };
                code += `<tr class="device-entry">`;
                code +=     `<td title="Device Type: ${capitalizeFirstLetter(el.device)}">  <i class="blue">${devIcons[el.device]}</i>  </td>`;
                code +=     `<td title="${security.title}">  <i class="${security.color}">${security.icon}</i>  </td>`;
                code +=     `<td title="${security.title}">${el.activated ?"": 
                                `<i title='You have not activated this device.\nClick to generate your QR code' 
                                    class='blue pointer' 
                                    onclick='window.generateQrCode(\"${el.id}\")'>qr_code</i>`}</td>`;
                code +=     `<td>
                                <div class="flex left">
                                    <span class="pointer relative" data-id='${el.id}' 
                                            style="width: 100%; box-sizing: content-box" 
                                            data-editable 
                                            data-editablecallback='changeDeviceName'>${el.name}</span>
                                </div>
                            </td>`;
                code +=     `<td>  ${new Date(el["created-at"] * 1000).toLocaleString(getLang(), options)} </td>`;
                code +=     `<td title="${dateDelta(el["last-seen"] * 1000)}">  ${dateDelta(el["last-seen"] * 1000, 1)}  </td>`;
                code +=     `<td class="padding-top-xs visible-on-hover hover-bg-light-grey hover-red border-radius v-center middle clickable dark-grey transition">
                                <i style="margin: 3px 10px 0 0">clear</i>
                                <span>Delete</span>
                            </td>`;
                // code +=     `<td style="width: 100%"></td>`;
                code += `</tr>`;
            });
            DEV_CONTAINER.innerHTML = code;
            updateDataEditable();
        })
        .catch(er => {
            alert("Failed to retrieve devices", er);
        })
        .finally(_ => {
            setTimeout(fetchDevices, FETCH_DEVICES_INTERVALL * 1000);
        });
}
fetchDevices();



window.generateQrCode = id => {
    const qrCanvas = document.createElement("canvas");
    qrCanvas.classList.add("margin-top-l");
    QrCreator.render({
        text: `jarvis://client?host=${window.location.hostname}&id=${id}`,
        radius: 0.5,      // 0.0 to 0.5
        ecLevel: 'L',     // L, M, Q, H
        fill: '#3f65ff',  // foreground color
        background: null, // color or null for transparent
        size: 200         // in pixels
    }, qrCanvas);
    alert("Register Device", "Scan this QR code on your device:", qrCanvas);
}

window.changeDeviceName = (newVal, el, oldVal) => {
    post(`/api/device/set`, { id: el.dataset.id, key: "name", value: newVal })
        .then(JSON.parse)
        .then(d => {
            if (!d.success)
                throw new Error(d.error);
        })
        .catch(er => {
            alert("Error", "Failed to change device name.<br><br>" + er);
        })
}


function capitalizeFirstLetter(string) {
    if (!string)
        return string
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function getLang() {
    if (navigator.languages != undefined)  {
        return navigator.languages[0]; 
    }
    return navigator.language;
}

function dateDelta(d, max=5) {
    var delta = Math.abs(Date.now() - d) / 1000;
    var days = Math.floor(delta / 86400);
    delta -= days * 86400;
    var hours = Math.floor(delta / 3600) % 24;
    delta -= hours * 3600;
    var minutes = Math.floor(delta / 60) % 60;
    delta -= minutes * 60;
    var seconds = delta % 60;  // in theory the modulus is not required
    var res = [];

    if (days > 0)    {  res.push(`${days} days`);        }
    if (hours > 0)   {  res.push(`${hours} hours`);      }
    if (minutes > 0) {  res.push(`${minutes} minutes`);  }

    if (res.length == 0)  {  return "Just now";  }

    return res.slice(0, max).join(", ") + " ago";
}