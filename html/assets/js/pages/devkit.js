/*
 Copyright (c) 2021 Philipp Scheer
*/

'use strict';


let folderStructure = Vue.ref([]);

const app = Vue.createApp({
    data() {
        return {
            folderStructure
        }
    }
});


app.createApp(CodeEditor);


function loadFileIntoEditor(node) {
    post(`/api/devkit/file`, {
        path: node.path
    })
    .then(JSON.parse)
    .then(d => {
        
    })
    .catch(er => {
        console.error(er);
    })
    .finally(_ => {
        console.log("finally");
    });
}

(function keepFolderPanelUpToDate() {
    let isLoadingData = Vue.ref(true);

    app.component('folder-structure', {
        props: [ "label", "nodes", "layer", "data" ],
        data() {
            return {
                loading: isLoadingData
            }
        },
        methods: {
            loadFile(node) {
                loadFileIntoEditor(node);
            }
        },
        template: `<div v-if="loading" class="loader">
                    </div>
                    <div v-else>
                        <i v-if="label" :data-layer="layer"></i>
                        <span v-if="label" @click="loadFile(data)"> {{ label }} </span>
                        <folder-structure
                            v-for="node in nodes"
                            :nodes="node.children"
                            :layer="node.layer"
                            :data="node"
                            :label="node.name"></folder-structure>
                    </div>`
    });

    (function getFolderStructure() {
        isLoadingData.value = true;
        get(`/api/devkit/folders`)
        .then(JSON.parse)
        .then(d => {
            if (d.success) {
                let hide = [ "__pycache__", ".pyc", "__init__.py" ]

                function f(el) {
                    let keep = true;
                    hide.forEach(toHide => {
                        if (el.name.includes(toHide)) {
                            keep = false;
                        }
                    });
                    if (!keep) {
                        return keep;
                    }

                    if (el.children) {
                        el.children = el.children.filter(f);
                        return true;
                    } else {
                        return true;
                    }
                }

                function m(el) {
                    el.layer = "user";
                    el.children.map(m2);
                    return el;
                }
                function m2(el) {
                    el.layer = "lang";
                    if (el.children) {
                        el.children.map(m3);
                    }
                    return el;
                }
                function m3(el) {
                    if (el.type == "file") {
                        el.layer = "entity";
                        return el;
                    } else {
                        el.layer = "skill";
                        el.children.map(m4);
                        return el;
                    }
                }
                function m4(el) {
                    if (el.type != "file") {
                        return el;
                    }
                    if (el.name.includes("conf")) {
                        el.layer = "config";
                    } else {
                        el.layer = "intent";
                    }
                    return el;
                }

                let filtered = d.result.filter(f);
                let mapped   = filtered.map(m);
                folderStructure.value = mapped;
            }
        })
        .catch(er => {
            console.error(er);
        })
        .finally(_ => {
            isLoadingData.value = false;
            // setTimeout(getFolderStructure, 5000);
        })
    })();
})();

(function keepAssistantStatusUpToDate() {
    const ASSISTANT_STATUS = {
        connecting: 0,
        ok: 1,
        training: 2,
        connectionError: 3,
        fail: 4
    }
    
    let currentAssistantStatus = Vue.ref(ASSISTANT_STATUS.connecting);

    app.component('assistant-status', {
        data() {
            return {
                status: currentAssistantStatus
            }
        },
        computed: {
            dotColor() {
                return {
                    "green": this.status == ASSISTANT_STATUS.ok,
                    "orange": this.status == ASSISTANT_STATUS.connecting || this.status == ASSISTANT_STATUS.training,
                    "red": this.status >= 3
                }
            },
            statusString() {
                return [
                    "Connecting",
                    "Assistant Connected",
                    "Assistant Training",
                    "Connection Error",
                    "Assistant Failed"
                ][this.status]
            }
        },
        template: `<div>
                        <div class="dot xxl" :class="dotColor"></div>
                        <span> {{ statusString }} </span>
                    </div>`
    });

    (function getAssistantStatus() {
        get(`/api/assistant/status`)
        .then(JSON.parse)
        .then(d => {
            if (d.success) {
                if (d.result.training) {
                    currentAssistantStatus.value = ASSISTANT_STATUS.training;
                } else if (d.result.trained) {
                    currentAssistantStatus.value = ASSISTANT_STATUS.ok;
                }
            } else {
                currentAssistantStatus.value = ASSISTANT_STATUS.connectionError;
            }
        })
        .catch(er => {
            currentAssistantStatus.value = ASSISTANT_STATUS.connectionError;
        })
        .finally(_ => {
            setTimeout(getAssistantStatus, 5000);
        });
    })();
})();

app.mount("#devkit");
