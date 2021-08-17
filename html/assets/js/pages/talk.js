/*
 Copyright (c) 2021 Philipp Scheer
*/


'use strict';


class Conversation {
    constructor() {
        this.convoId = null;
    }

    write(msg) {
        post(`/api/conversation/write`, {
            message: msg,
            id: this.convoId
        })
        .then(JSON.parse)
        .then(d => {
           console.log(d); 
        }).catch(er => {
            console.error(er);
        });
    }
}