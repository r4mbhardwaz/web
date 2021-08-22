const nluContainer = document.querySelector("#nlu");

var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent
const recognition = new SpeechRecognition();

recognition.onstart = function() {
    console.log("We are listening. Try speaking into the microphone.");
};

recognition.onspeechend = function() {
    recognition.stop();
};
              
recognition.onresult = function(event) {
    var transcript = event.results[0][0].transcript;
    var confidence = event.results[0][0].confidence;
    console.log(event);
    console.log(transcript, confidence);
    id("nlu-input").val(transcript);
    id("nlu-input").enter();
};

window.setNLUStatus = function(result, orText) {
    const colorElement = id("nlu-status-color");
    const statusElement = id("nlu-status-text");
    colorElement.classList.remove("red");
    colorElement.classList.remove("green");
    colorElement.classList.remove("orange");
    if (orText) {
        colorElement.classList.add(result);
        id("nlu-status-text").text(orText);
    } else {
        let color = "red";
        let text = "NLU not trained";

        if (result.trained) {
            color = "green";
            text = "NLU trained and ready";
        } else {
            color = "red";
            text = "NLU not trained";
        }
        if (result.training) {
            color = "orange";
            text = "NLU currently training";
        }

        colorElement.classList.add(color);
        statusElement.text(text);
    }
};

if (nluContainer) {
    axios.get(`/api/assistant/status`, {}, false)
        .then(x => x.data)
        .then(d => {
            if (d.success) {
                const assistant = d.result;
                if (assistant.trained) {
                    nluContainer.classList.add("ready");
                    id("nlu-header").text("Try your assistant");
                    id("nlu-text").text("Record or try a query to try your assistant");
                    id("nlu-record").click(_ => {  recognition.start();  });
                }
                setNLUStatus(d.result);
            } else {
                throw new Error(d);
            }
        })
        .catch(er => {
            console.error(er);
        });

    (function getNluStatus() {
        axios.get(`/api/assistant/status`, {}, false)
            .then(x => x.data)
            .then(d => { setNLUStatus(d.result) })
            .catch(er => {  setNLUStatus("red", "NLU offline")  })
            .finally(_ => {
                setTimeout(getNluStatus, 3000);
            })
    })();

    id("nlu-input").enter(ev => {
        const utterance = id("nlu-input").get(0).value;
        id("nlu-output").text("<i class='rotating' style='margin:10px;position:static'>loop</i>");
        axios.post(`/api/assistant/parse`, {
            utterance: utterance
        })
        .then(x => x.data)
        .then(d => {
            if (d.success) {
                const output = id("nlu-output").get(0);
                output.classList.add("code");
                output.classList.add("size-13");
                output.style.userSelect = "text";
                output.style.whiteSpace = "pre-wrap";
                output.innerHTML = syntaxHighlight(JSON.stringify(d.result, null, 3));
            } else {
                throw new Error("Your data couldn't be submitted and no result was returned");
            }
        })
        .catch(er => {
            alert("Failed to parse NLU", er);
        });
    });
};

window.syntaxHighlight = function(json) {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
};
