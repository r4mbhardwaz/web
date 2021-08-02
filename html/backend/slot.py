from __main__ import *

@app.route("/slot/edit/<skill_id>/<intent_id>/<slot_id>")
@login_required
def add_slot(skill_id: str, intent_id: str, slot_id: str = None):
    skill = Skill.load(skill_id)
    if skill:
        intent = skill.get_intent(intent_id)
        if intent:
            if slot_id is None:
                already_existing_but_empty_slot = Slot.new_but_unused_slot()
                if already_existing_but_empty_slot:
                    id = already_existing_but_empty_slot
                    slot = Slot(id)
                else:
                    slot = Slot()
                    slot.save()
                return redirect(f"/slot/edit/{skill_id}/{intent['id']}/{slot['id']}", 302)
            slot = Slot(slot_id)
            if slot.found:
                return render_template("slot/edit.html", skill=skill, intent=intent, slot=slot)
        else:
            return redirect("/assistant?message=Couldn't find intent", 302)
    return redirect("/assistant?message=Couldn't find slot or skill, check your url", 302)
