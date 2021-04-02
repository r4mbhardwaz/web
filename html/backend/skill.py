from __main__ import *

@app.route("/skill/new", methods=['GET'])
@login_required
def new_skill_get():
    return render_template("skill/new.html", first_100_icons=ICONS[:50])


@app.route("/skill/new", methods=['POST'])
@login_required
def new_skill_post():
    skill = Skill()
    skill["name"] = request.form.get("skill-name", None)
    skill["icon"]["icon"] = request.form.get("skill-icon", None)
    skill["icon"]["color"] = request.form.get("skill-icon-color", "black")
    skill["language"] = request.form.get("skill-language", None)
    skill["description"] = request.form.get("skill-description", None)
    skill["public"] = True if request.form.get("skill-public", None) == "on" else False
    skill.save()
    return redirect(f"/skill/edit/{skill['id']}", code=302)


@app.route("/skill/edit/<id>")
@login_required
def edit_skill(id):
    skill = Skill(id)
    if not skill.found:
        return redirect("/skill/new?message=Skill does not exist yet.<br>You can create a skill here", 302)
    return render_template("skill/edit.html", skill=skill)

