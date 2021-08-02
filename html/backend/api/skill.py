import json
from __main__ import *
from ..decorators import login_required
from ..decorators import retrain


@app.route("/api/skill/<id>/delete", methods=["POST"])
@login_required
@retrain
def api_delete_skill(id):
    Skill.load(id).delete()
    return Response(json.dumps({"success": True}), content_type="application/json")


@app.route("/api/skill/<id>/private", methods=["POST"])
@login_required
@retrain
def api_skill_private(id):
    skill = Skill.load(id)
    if skill:
        skill["public"] = False
        skill.save()
        return Response(json.dumps({"success": True}), content_type="application/json")
    else:
        return Response(json.dumps({"success": False, "error": "Couldn't find Skill by ID"}), content_type="application/json")


@app.route("/api/skill/<id>/public", methods=["POST"])
@retrain
@login_required
def api_skill_public(id):
    skill = Skill.load(id)
    if skill:
        skill["public"] = True
        skill.save()
        return Response(json.dumps({"success": True}), content_type="application/json")
    else:
        return Response(json.dumps({"success": False, "error": "Couldn't find Skill by ID"}), content_type="application/json")


@app.route("/api/skill/<id>/slot/remove", methods=["POST"])
@retrain
@login_required
def api_skill_remove_slot(id):
    json_data = request.get_json(force=True)
    if "slot-id" in json_data:
        skill = Skill.load(id)
        if skill:
            new_slots = {}
            for key in skill["slots"]:
                if skill["slots"][key] != json_data["slot-id"]:
                    new_slots[key] = skill["slots"][key]
            skill["slots"] = new_slots
            skill.save()
            return Response(json.dumps({"success": True}), content_type="application/json")
        else:
            return Response(json.dumps({"success": False, "error": "Couldn't find Skill by ID"}), content_type="application/json")
    return Response(json.dumps({"success": False, "error": "Need to provide 'slot-id' in JSON POST body"}), content_type="application/json")


@app.route("/api/skill/<id>/set", methods=["POST"])
@login_required
@retrain
def api_skill_set_value(id: str):
    allowed = ["name", "description"]
    json_data = request.get_json(force=True)
    if "key" in json_data and "value" in json_data:
        if json_data["key"] in allowed:
            skill = Skill.load(id)
            if skill:
                skill[json_data["key"]] = json_data["value"]
                skill.save()
                return Response(json.dumps({"success": True}), content_type="application/json")
            else:
                return Response(json.dumps({
                    "success": False, 
                    "code": "ERR_SKILL_NOT_FOUND",
                    "error": "Couldn't find Skill by ID"
                }), content_type="application/json")
        else:
            return Response(json.dumps({
                "success": False, 
                "code": "ERR_SKILL_NOT_ALLOWED",
                "error": "Key not allowed to set"
            }), content_type="application/json")
    else:
        return Response(json.dumps({
            "success": False, 
            "code": "ERR_SKILL_INVALID_ARGS",
            "error": "Need to provide key and value in JSON POST body"
        }), content_type="application/json")


@app.route("/api/skill/new", methods=['POST'])
@login_required
def new_skill_post():
    skill_data = request.get_json(force=True)
    skill = Skill.new(skill_data)
    skill.save()
    return Response(json.dumps({ "success": True, "id": skill.id }), content_type="application/json")
