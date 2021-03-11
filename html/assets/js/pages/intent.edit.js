if (window.askForIntentName) {
    prompt("Name your intent", `Please enter a name for this new intent.
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
    </ul>`.replaceAll("\n", ""), "Intent Name", input => {
        return /^[A-Za-z]{1}[A-Za-z0-9]{1,}$/.test(input)
    }).then(t => {
        if (t) {
            post(`/api/intent/${skillId}/${intentId}/set`, {
                key: "name",
                value: t
            });
        } else {
            swup.loadPage({url: "/skill/edit/{{ skill.id }}"});
        }
    });
}
