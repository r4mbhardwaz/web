from core.Skill import Skill
from __main__ import *

@app.route("/api/intent/<skill_id>/<intent_id>/set", methods=["POST"])
@login_required
def api_intent_set_value(skill_id: str, intent_id: str):
    allowed = ["name"]
    json_data = request.get_json(force=True)
    if "key" in json_data and "value" in json_data:
        if json_data["key"] in allowed:
            skill = Skill(skill_id)
            if skill.found:
                intent = skill.get_intent(intent_id)
                if intent:
                    intent[json_data["key"]] = json_data["value"]
                    skill.update_intent(intent["id"], intent)
                    skill.save()
                    return Response(json.dumps({"success": True}), content_type="application/json")
                else:
                    return Response(json.dumps({"success": False, "error": "couldn't find intent by id"}), content_type="application/json")
            else:
                return Response(json.dumps({"success": False, "error": "couldn't find skill by id"}), content_type="application/json")
        else:
            return Response(json.dumps({"success": False, "error": "key not allowed to set"}), content_type="application/json")
    else:
        return Response(json.dumps({"success": False, "error": "need to provide key and value in json post body"}), content_type="application/json")

@app.route("/api/intent/<skill_id>/add", methods=["POST"])
@login_required
def api_intent_add(skill_id: str):
    json_data = request.get_json(force=True)
    if "name" in json_data and "description" in json_data:
        # TODO: perform checks to see if name and description are well formatted
        skill = Skill(skill_id)
        if skill.found:
            if skill.unused_intent():
                intent = skill.unused_intent()
            else:
                intent = Intent(True)
            intent["name"] = json_data["name"]
            intent["description"] = json_data["description"]
            intent["modified-at"] = int(time.time()) + 2
            skill.add_intent(intent)
            skill.save()
            return Response(json.dumps({"success": True, "id": intent["id"]}), content_type="application/json")
        else:
            return Response(json.dumps({"success": False, "error": "couldn't find skill by id"}), content_type="application/json")
    else:
        return Response(json.dumps({"success": False, "error": "need to provide 'name' and 'description' in json post body"}), content_type="application/json")

@app.route("/api/intent/<skill_id>/<intent_id>/delete", methods=["POST"])
@login_required
def api_intent_delete(skill_id: str, intent_id: str):
    skill = Skill(skill_id)
    if skill.found:
        intent = skill.get_intent(intent_id)
        if intent:
            success = skill.remove_intent(intent_id)
            resp = {"success": True} if success else {"success": False, "error": "failed to remove intent"}
            return Response(json.dumps(resp), content_type="application/json")
    return Response(json.dumps({"success": False, "error": "couldn't find skill or intent by id"}), content_type="application/json")