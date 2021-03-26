window.SKILL_ERRORS = {
    "ERR_SKILL_NOT_FOUND": "The skill could not be found.<br><br>Most likely the skill got deleted and you'll need to create a new one",
    "ERR_SKILL_NOT_ALLOWED": "You're not allowed to set this key",
    "ERR_SKILL_INVALID_ARGS": "You need to provide a key and value!<br><br>Please try again"
}

qry("[data-newintent]").click(ev => {
    const skillId = ev.currentTarget.dataset.newintent;

    longPrompt("Create new Intent", `Enter a name and description for your intent
    <br><br>
    Choose a descriptive name that characterizes what this intent should do.
    <br><br>
    Good intent names are <span class='green'>getWeather, getWeatherForecast, turnOff, brighter,</span> etc...
    <br><br>
    Requirements:
    <br>
    <ul>
        <li>Minimum length: 2 characters</li>
        <li>Only uppercase, lowercase and numbers</li>
        <li>Does not start with a number</li>
        <li>No special characters including hyphens and underscores</li>
    </ul>`, "Intent name", "A short intent description", input => {
        return /^[A-Za-z]{1}[A-Za-z0-9]{1,}$/.test(input)
    }, textArea => {
        return true; // also allow empty descriptions
    }).then(data => {
        const name = data.input;
        const description = data.text;

        post(`/api/intent/${skillId}/add`, {
            name: name,
            description: description
        }).then(JSON.parse).then(d => {
            if (d.success) {
                redirect(`/intent/edit/${skillId}/${d.id}`);
            } else {
                throw new Error("server side error");
            }
        }).catch(er => {
            console.error(er);
            alert("Couldn't create intent", "An unknown error occured and we couldn't create your intent.<br><br>Please try again later");
        });
    });
});

qry("[data-deleteintent]").click(ev => {
    ev.stopPropagation();
    
    const target = ev.currentTarget;
    const intentId = target.dataset.deleteintent;

    loading(target.children[0])
    
    post(`/api/intent/${target.dataset.skillid}/${intentId}/delete`).then(JSON.parse).then(d => {
        if (d.success) {
            target.parentNode.remove();
        } else {
            throw new Error(`server side error ${JSON.stringify(d)}`)
        }
    }).catch(er => {
        alert("Couldn't delete intent", "An unknown error occured and we couldn't delete this intent!<br><br>Try refreshing this page and try again");
    }).finally(_ => {
        loadingStop(target.children[0])
    });
});

window.updateSkillName = function(newName, element, oldName) {
    const skillId = qry("[data-skillid]").get(0).dataset.skillid;

    id("skill-name").text(newName);

    post(`/api/skill/${skillId}/set`, {
        key: "name",
        value: newName
    })
    .then(JSON.parse)
    .then(d => {
        if (d.success) {
        } else {
            throw new Error(window.SKILL_ERRORS[d.code]);
        }
    })
    .catch(er => {
        alert("Couldn't update skill name", er);
    });
};

id("skill-description").click(_ => { launchDescriptionChange(); });

window.launchDescriptionChange = function() {
    longPrompt("Change Skill Description", "Enter a new description for this skill:", "", "Enter a New Description")
    .then(d => {
        if (!d) { return; }

        const skillId = qry("[data-skillid]").get(0).dataset.skillid;

        id("skill-description").text(d.text);

        post(`/api/skill/${skillId}/set`, {
            key: "description",
            value: d.text
        })
        .then(JSON.parse)
        .then(d => {
            if (d.success) {
            } else {
                throw new Error(window.SKILL_ERRORS[d.code]);
            }
        })
        .catch(er => {
            alert("Failed to change skill description", er);
        });
    });
    qry("#prompt input").get(0).value = "_";
    qry("#prompt input").get(0).parentElement.style.display = "none";
    qry("#prompt textarea").get(0).value = id("skill-description").get(0).innerHTML;
};
