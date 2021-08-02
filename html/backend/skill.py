from __main__ import app, Skill
from .decorators import login_required
from .variables import ICONS
from flask import render_template, redirect


@app.route("/skill/new", methods=['GET'])
@login_required
def new_skill_get():
    return render_template("skill/new.html", first_100_icons=ICONS[:50])


@app.route("/skill/edit/<id>")
@login_required
def edit_skill(id):
    skill = Skill.load(id)
    if not skill:
        return redirect("/skill/new?message=Skill does not exist yet.<br>You can create a skill here", 302)
    return render_template("skill/edit.html", skill=skill)

