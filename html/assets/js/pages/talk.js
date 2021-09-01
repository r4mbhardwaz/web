/*
 Copyright (c) 2021 Philipp Scheer
*/


'use strict';


const vueApp = Vue.createApp({});
const chats = Vue.ref([]);
vueApp.component("chats", {
    data() {
        return {
            chats: chats
            /**
             * {
             *  own: true|false,
             *  text: html or text
             * }
             */
        }
    },
    template:  `<div id="chats">
                    <div v-for="chat in chats" 
                         :class="{ 'own': chat.own, 'remote': !chat.own }">
                        {{ chat.text }}
                    </div>
                </div>`
});
vueApp.mount("#app");

class Conversation {
    constructor() {
        this.convoId = null;
        this.data = []
    }

    write(msg) {
        return new Promise((res, rej) => {
            http.post(`/api/conversation/write`, this.convoId ? {
                message: msg,
                $id: this.convoId
            } : { message: msg })
            .then(JSON.parse)
            .then(d => {
                if (d.success) {
                    const result = d.result;
                    this.data.push(result);
                    res(result.response, result.$raw, result.$id);
                } else {
                    throw new Error(d.error);
                }
            }).catch(er => {
                rej(er);
            });
        });
    }
}
window.conversation = new Conversation();


function pushMessage(msg, isOwn) {
    chats.value.push({ own: isOwn, text: msg });
}

(function attachInputHandler() {
    document.querySelector("#chat-input").addEventListener("keydown", ev => {
        if (ev.keyCode == 13 || ev.key == "Enter") {
            const value = document.querySelector("#chat-input").value;
            document.querySelector("#chat-input").value = "";
            pushMessage(value, true);
            window.conversation.write(value).then(res => {
                console.log(res);
                if (res.text)
                    pushMessage(res.text, false);
                // res.speech and res.card are not supported yet
            });
        }
    });
})();

(function applyNightModeToggle() {
    function getNight() {
        return JSON.parse(window.localStorage.getItem("night"));
    }
    function setNight(val) {
        window.localStorage.setItem("night", JSON.stringify(val));
    }
    function updateNight() {
        if (getNight()) document.documentElement.classList.add("night");
        else            document.documentElement.classList.remove("night");
    }

    if (!getNight()) {
        setNight(false);
    }

    updateNight();

    document.querySelector("#mode").addEventListener("click", ev => {
        setNight(!getNight());
        updateNight();
    });
})();

