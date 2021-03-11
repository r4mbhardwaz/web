from __main__ import *

@app.route("/intent/edit/<skill_id>")
@app.route("/intent/edit/<skill_id>/<intent_id>")
@login_required
def create_intent(skill_id: str, intent_id: str = None):
    if intent_id is None:
        skill = Skill(skill_id)
        if skill.found:
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
        skill = Skill(skill_id)
        if skill.found:
            intent = skill.get_intent(intent_id)
            return render_template("intent/edit.html", skill=skill, intent=intent)
        else:
            return Response(json.dumps({"success": False, "error": "couldn't find skill by id"}))
