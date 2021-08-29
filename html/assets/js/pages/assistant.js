
qry(".delete-skill").click(ev => {
    const target = ev.currentTarget;
    const skillId = target.dataset.skillid;

    loading(target.children[0])

    http.post(`/api/skill/${skillId}/delete`, {})
    .then(d => {
        redirect(window.location.pathname);
    }).catch(er => {
        alert("Failed to delete skill!", "An internal error occured and we were unable to delete your skill.<br><br>Please try again later");
    }).finally(_ => {
        loadingStop(target.children[0])
    });
});

function makeSkillPrivate(ev) {
    const target = ev.currentTarget;
    const skillId = target.dataset.privateskill;

    loading(target.children[0])

    http.post(`/api/skill/${skillId}/private`).then(JSON.parse).then(d => {
        if (d.success) {
            target.parentNode.classList.add("hidden");
            target.parentNode.classList.remove("visible");
            qry(`.privacy-state.id-${skillId}`).get(0).innerHTML = "Private";
            qry(`.privacy-state.id-${skillId}`).get(0).classList.remove("green");
            qry(`.privacy-state.id-${skillId}`).get(0).classList.add("red");
            
            setInterval(_ => {
                loadingStop(target.children[0])
                target.children[1].innerHTML = "Publish Skill";
                target.classList.add("hover-bg-green");
                target.classList.remove("hover-bg-orange");
                target.removeAttribute("data-privateskill");
                target.setAttribute("data-publicskill", skillId);
                target.removeEventListener("click", makeSkillPrivate);
                target.addEventListener("click", makeSkillPublic);
            }, 300);
        } else {
            throw new Error("Couldn't set skill to private");
        }
    }).catch(er => {
        alert("Couldn't set skill to private");
        console.error(er);
    });
}

function makeSkillPublic(ev) {
    const target = ev.currentTarget;
    const skillId = target.dataset.publicskill;

    loading(target.children[0])

    http.post(`/api/skill/${skillId}/public`).then(JSON.parse).then(d => {
        if (d.success) {
            target.parentNode.classList.add("hidden");
            target.parentNode.classList.remove("visible");
            qry(`.privacy-state.id-${skillId}`).get(0).innerHTML = "Public";
            qry(`.privacy-state.id-${skillId}`).get(0).classList.remove("red");
            qry(`.privacy-state.id-${skillId}`).get(0).classList.add("green");
            
            setTimeout(_ => {
                loadingStop(target.children[0])
                target.children[1].innerHTML = "Keep Skill Private";
                target.classList.add("hover-bg-orange");
                target.classList.remove("hover-bg-green");
                target.removeAttribute("data-publicskill");
                target.setAttribute("data-privateskill", skillId);
                target.removeEventListener("click", makeSkillPublic);
                target.addEventListener("click", makeSkillPrivate);
            }, 300);
        } else {
            throw new Error("Couldn't set skill to public");
        }
    }).catch(er => {
        alert("Couldn't set skill to public");
        console.error(er);
    });
}


qry("[data-privateskill]").click(makeSkillPrivate);
qry("[data-publicskill]").click(makeSkillPublic);
