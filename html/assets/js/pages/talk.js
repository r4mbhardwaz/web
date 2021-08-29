/*
 Copyright (c) 2021 Philipp Scheer
*/


'use strict';


class Conversation {
    constructor() {
        this.convoId = null;
    }

    write(msg) {
        http.post(`/api/conversation/write`, this.convoId ? {
            message: msg,
            $id: this.convoId
        } : { message: msg })
        .then(JSON.parse)
        .then(d => {
            
        }).catch(er => {
            console.error(er);
        });
    }
}
window.conversation = new Conversation();


(function attachInputHandler() {
    document.querySelector("#chat-input").addEventListener("keydown", ev => {
        if (ev.keyCode == 13 || ev.key == "Enter") {
            const value = document.querySelector("#chat-input").value;
            window.conversation.write(value);
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
