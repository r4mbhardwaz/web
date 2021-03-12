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
                swup.loadPage({url: `/intent/edit/${skillId}/${d.id}`});
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