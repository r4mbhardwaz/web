import json
from __main__ import Skill, Intent, app
from flask.wrappers import Response
from flask import render_template, redirect
from .decorators import login_required

@app.route("/intent/edit/<skill_id>")
@app.route("/intent/edit/<skill_id>/<intent_id>")
@login_required
def create_intent(skill_id: str, intent_id: str = None):
    if intent_id is None:
        skill = Skill.load(skill_id)
        if skill:
            if skill.unused_intent():
                intent = skill.unused_intent()
            else:
                intent = Intent(True)
            id = intent.id
            skill.add_intent(intent)
            skill.save()
            return redirect(f"/intent/edit/{skill_id}/{id}", code=302)
        return Response(json.dumps({"success": False, "error": "couldn't find skill by id"}))
    else:
        skill = Skill.load(skill_id)
        if skill:
            intent = skill.get_intent(intent_id)
            slots = intent["slots"]
            sorted_temp = sorted(list(slots.items()))
            slots.clear()
            slots.update(sorted_temp)
            intent["slots"] = slots
            return render_template("intent/edit.html", skill=skill, intent=intent)
        else:
            return Response(json.dumps({"success": False, "error": "couldn't find skill by id"}))
