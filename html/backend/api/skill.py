from __main__ import *

@app.route("/api/skill/<id>/delete")
@login_required
def api_delete_skill(id):
    Skill(id).delete()
    return json.dumps({"success": "maybe"})


@app.route("/api/skill/<id>/private", methods=["POST"])
@login_required
def api_skill_private(id):
    skill = Skill(id)
    if skill.found:
        skill["public"] = False
        skill.save()
        return Response(json.dumps({"success": True}), content_type="application/json")
    else:
        return Response(json.dumps({"success": False, "error": "couldn't find skill by id"}), content_type="application/json")


@app.route("/api/skill/<id>/public", methods=["POST"])
@login_required
def api_skill_public(id):
    skill = Skill(id)
    if skill.found:
        skill["public"] = True
        skill.save()
        return Response(json.dumps({"success": True}), content_type="application/json")
    else:
        return Response(json.dumps({"success": False, "error": "couldn't find skill by id"}), content_type="application/json")


@app.route("/api/skill/<id>/slot/remove", methods=["POST"])
@login_required
def api_skill_remove_slot(id):
    json_data = request.get_json(force=True)
    if "slot-id" in json_data:
        skill = Skill(id)
        if skill.found:
            new_slots = {}
            for key in skill["slots"]:
                if skill["slots"][key] != json_data["slot-id"]:
                    new_slots[key] = skill["slots"][key]
            skill["slots"] = new_slots
            skill.save()
            return Response(json.dumps({"success": True}), content_type="application/json")
        else:
            return Response(json.dumps({"success": False, "error": "skill not found by id"}), content_type="application/json")
    return Response(json.dumps({"success": False, "error": "need to provide 'slot-id' in json post body"}), content_type="application/json")
