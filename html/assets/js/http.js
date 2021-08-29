/* HTTP */
window.http = {
    get: function(url, args = {}, log = true) {
        url = (url.includes("?") ? url + "&_no_cache=" + Date.now() : url + "?_no_cache=" + Date.now());
        if (log) {
            console.log("[get]", url);
        }
        return new Promise(function(accept, reject) {
            var xmlHttp = new XMLHttpRequest();
            xmlHttp.onreadystatechange = function() {
                if (xmlHttp.readyState == 4) {
                    if (xmlHttp.status == 200) {
                        accept(xmlHttp.responseText)
                    } else {
                        reject();
                    }
                }
            }
    
            for (var x in args) {
                xmlHttp[x] = args[x];
            }
    
            xmlHttp.open("GET", url, true);
            xmlHttp.send(null);
        });
    },
    
    post: function(url, jsonData) {
        console.log("[post]", url, jsonData);
        return new Promise(function(resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open("POST", url, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onreadystatechange = function() {
                if (this.readyState != 4) return;
    
                if (this.status == 200) {
                    resolve(this.responseText);
                } else {
                    reject();
                }
            };
            xhr.send(JSON.stringify(jsonData));
        });
    },
    
    postToUrl: function(path, params, method = 'post') {
        const form = document.createElement('form');
        form.method = method;
        form.action = path;
    
        for (const key in params) {
            if (params.hasOwnProperty(key)) {
                const hiddenField = document.createElement('input');
                hiddenField.type = 'hidden';
                hiddenField.name = key;
                hiddenField.value = params[key];
    
                form.appendChild(hiddenField);
            }
        }
    
        document.body.appendChild(form);
        form.submit();
    },
    
    getParam: function(n) {
        var url_string = window.location.href
        var url = new URL(url_string);
        return url.searchParams.get(n);

    }
}