'use strict';


const FETCH_DEVICES_INTERVALL = 5; // seconds
const DEV_CONTAINER = id("devices-container").get(0);
const ADD_DEVICES = id("add-device").get(0);

if (ADD_DEVICES) // basically check if the user is on the /devices page (this script is also used on the /device/abcdef page)
ADD_DEVICES.addEventListener("click", ev => {
    if (window.location.hostname == "localhost" || window.location.hostname.startsWith("127.")) {
        alert("Localhost detected", "You cannot register a new device from a localhost address.<br>Please switch to a reachable address");
        return;
    }
    axios.post(`/api/device/new`, {
        name: "My new device"
    })
    .then(x => x.data)
    .then(res => {
        if (!res.success)
            throw new Error(res.error);
        fetchDevices(true);
        generateQrCode(res.result);
    })
    .catch(er => {
        alert("Could not add new device", er);
    });
    // window.prompt("New Device", "Enter device name:", "Device name").then(name => {
    //     if (!name)
    //         return;
    //     // INSERT CODE HERE
    // });
});


let oldData = null;
function fetchDevices(oneTimer=false) {
    axios.get(`/api/devices`)
        .then(x => x.data)
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
                const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }; //, hour: 'numeric', minute: 'numeric' };
                code += `<tr class="device-entry">`;
                code +=     `<td title="Device Type: ${capitalizeFirstLetter(el.device)}">  <i class="blue">${devIcons[el.device]}</i>  </td>`;
                code +=     `<td>${el.activated ?"": 
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
                if (el.device)
                    code += `<td class="border-radius clickable transition">
                                <span class="blue hover-bg-blue50 transition clickable h-padding-xl v-padding border-radius"
                                        onclick="redirect('/device/${el.id}')">
                                    <span>Details</span>
                                </span>
                            </td>`;
                else
                    code +=     `<td></td>`;
                if (!el["is-root"]) // only show delete button on non-root devices
                    code += `<td class="padding-top-xs visible-on-hover hover-bg-light-grey hover-red border-radius v-center middle clickable dark-grey transition"
                                 onclick="deleteDevice('${el.id}', this)">
                                <i style="margin: 3px 10px 0 0">clear</i>
                                <span>Delete</span>
                            </td>`;
                else
                    code += `<td></td>`;
                code +=     `<td style="width: 100%"></td>`;
                code += `</tr>`;
            });
            DEV_CONTAINER.innerHTML = code;
            updateDataEditable();
        })
        .catch(er => {
            alert("Failed to retrieve devices", er);
        })
        .finally(_ => {
            if (!oneTimer)
                setTimeout(fetchDevices, FETCH_DEVICES_INTERVALL * 1000);
        });
}
if (ADD_DEVICES) // basically check if the user is on the /devices page (this script is also used on the /device/abcdef page)
fetchDevices();



window.generateQrCode = (id, el=undefined, config={}) => {
    const qrCanvas = el ? el : document.createElement("canvas");
    QrCreator.render(Object.assign({}, {
        text: `jarvis://client?host=${window.location.hostname}&id=${id}`,
        radius: 0.5,      // 0.0 to 0.5
        ecLevel: 'L',     // L, M, Q, H
        fill: '#3f65ff',  // foreground color
        background: null, // color or null for transparent
        size: 200         // in pixels
    }, config), qrCanvas);
    if (!el) {
        qrCanvas.classList.add("margin-top-l");
        alert("Register Device", "Scan this QR code on your device:", qrCanvas);
    }
}

window.changeDeviceName = (newVal, el, oldVal) => {
    axios.post(`/api/device/set`, { id: el.dataset.id, key: "name", value: newVal })
        .then(x => x.data)
        .then(d => {
            if (!d.success)
                throw new Error(d.error);
        })
        .catch(er => {
            alert("Failed to change device name", er);
        });
}

window.deleteDevice = (id, el) => {
    if (el)
        loading(el.children[0]);
        axios.post(`/api/device/delete`, { id: id })
            .then(x => x.data)
            .then(d => {
                if (!d.success)
                    throw new Error(d.error);
                fetchDevices(true);
            })
            .catch(er => {
                alert("Failed to delete device", er);
            })
            .finally(_ => {
                if (el)
                    loadingStop(el.children[0]);
            });
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