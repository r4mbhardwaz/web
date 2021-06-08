'use strict';


const FETCH_CLIENTS_INTERVIEW = 5; // seconds
const DEV_CONTAINER = id("devices-container").get(0);



function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
  

function fetchClients() {
    get(`/api/clients`)
    .then(JSON.parse)
    .then(d => {
        if (!d.success) { throw new Error(d.error); }
            qry(".device-entry").forEach(el => el.remove());
            let code = ``;
            d.clients.forEach(el => {
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
                code +=     `<td title="Device Type: ${capitalizeFirstLetter(el.device)}"> <i class="blue">${devIcons[el.device]}</i> </td>`;
                code +=     `<td title="${security.title}"> <i class="${security.color}">${security.icon}</i> </td>`;
                code +=     `<td>${el.name}</td>`;
                code +=     `<td>${new Date(el["created-at"] * 1000).toLocaleString(getLang(), options)}</td>`;
                code +=     `<td>${dateDelta(el["last-seen"] * 1000, 2)}</td>`;
                code += `</tr>`;
            });
            DEV_CONTAINER.innerHTML = code;
        })
        .catch(er => {
            alert("Failed to retrieve devices", er);
        })
        .finally(_ => {
            setTimeout(fetchClients, FETCH_CLIENTS_INTERVIEW * 1000);
        });
}
fetchClients();


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