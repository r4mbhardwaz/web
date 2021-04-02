from core.Skill import Skill
from __main__ import *


@app.route("/api/intent/<skill_id>/<intent_id>/set", methods=["POST"])
@login_required
@retrain
def api_intent_set_value(skill_id: str, intent_id: str):
    allowed = ["name", "description"]
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
                    return Response(json.dumps({
                        "success": False, 
                        "code": "ERR_INTENT_NOT_FOUND",
                        "error": "couldn't find intent by id"
                    }), content_type="application/json")
            else:
                return Response(json.dumps({
                    "success": False, 
                    "code": "ERR_INTENT_SKILL_NOT_FOUND",
                    "error": "couldn't find skill by id"
                }), content_type="application/json")
        else:
            return Response(json.dumps({
                "success": False, 
                "code": "ERR_INTENT_NOT_ALLOWED",
                "error": "key not allowed to set"
            }), content_type="application/json")
    else:
        return Response(json.dumps({
            "success": False, 
            "code": "ERR_INTENT_INVALID_ARGS",
            "error": "need to provide key and value in json post body"
        }), content_type="application/json")


@app.route("/api/intent/<skill_id>/add", methods=["POST"])
@login_required
@retrain
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
@retrain
def api_intent_delete(skill_id: str, intent_id: str):
    skill = Skill(skill_id)
    if skill.found:
        intent = skill.get_intent(intent_id)
        if intent:
            success = skill.remove_intent(intent_id)
            resp = {"success": True} if success else {"success": False, "error": "failed to remove intent"}
            return Response(json.dumps(resp), content_type="application/json")
    return Response(json.dumps({"success": False, "error": "couldn't find skill or intent by id"}), content_type="application/json")


@app.route("/api/intent/<skill_id>/<intent_id>/add-slot", methods=["POST"])
@login_required
@retrain
def api_intent_add_slot(skill_id: str, intent_id: str):
    json_data = request.get_json(force=True)
    if "name" not in json_data or "slot-id" not in json_data:
        return Response(json.dumps({"success": False, "code": "ERR_INTENT_INVALID_ARGS", "error": "need to provide 'name' and 'slot-id' in json post body"}), content_type="application/json")
    slot_name = json_data["name"]
    slot_id = json_data["slot-id"]
    skill = Skill(skill_id)
    if not skill.found:
        return Response(json.dumps({"success": False, "code": "ERR_INTENT_SKILL_NOT_FOUND", "error": "couldn't find skill by id"}), content_type="application/json")
    intent = skill.get_intent(intent_id)
    if not intent:
        return Response(json.dumps({"success": False, "code": "ERR_INTENT_NOT_FOUND", "error": "couldn't find intent by id"}), content_type="application/json")
    slot = Slot(slot_id)
    if not slot.found:
        return Response(json.dumps({"success": False, "code": "ERR_INTENT_SLOT_NOT_FOUND", "error": "couldn't find slot by id"}), content_type="application/json")
    intent.add_slot(slot_name, slot, True)
    skill.update_intent(intent_id, intent)
    skill.save()
    return Response(json.dumps({"success": True}), content_type="application/json")


@app.route("/api/intent/<skill_id>/<intent_id>/change-slot", methods=["POST"])
@login_required
@retrain
def api_intent_change_slot(skill_id: str, intent_id: str):
    json_data = request.get_json(force=True)
    if "name" not in json_data or "slot-id" not in json_data:
        return Response(json.dumps({"success": False, "code": "ERR_INTENT_INVALID_ARGS", "error": "need to provide 'name' and 'slot-id' in json post body"}), content_type="application/json")
    slot_name = json_data["name"]
    slot_id = json_data["slot-id"]
    skill = Skill(skill_id)
    if not skill.found:
        return Response(json.dumps({"success": False, "code": "ERR_INTENT_SKILL_NOT_FOUND", "error": "couldn't find skill by id"}), content_type="application/json")
    intent = skill.get_intent(intent_id)
    if not intent:
        return Response(json.dumps({"success": False, "code": "ERR_INTENT_NOT_FOUND", "error": "couldn't find intent by id"}), content_type="application/json")
    slot = Slot(slot_id)
    if not slot.found:
        return Response(json.dumps({"success": False, "code": "ERR_INTENT_SLOT_NOT_FOUND", "error": "couldn't find slot by id"}), content_type="application/json")
    intent.change_slot(slot_name, slot, True)
    skill.update_intent(intent_id, intent)
    skill.save()
    return Response(json.dumps({"success": True}), content_type="application/json")


@app.route("/api/intent/<skill_id>/<intent_id>/<slot_name>/remove", methods=["POST"])
@login_required
@retrain
def api_intent_remove_slot(skill_id: str, intent_id: str, slot_name: str):
    skill = Skill(skill_id)
    if not skill.found:
        return Response(json.dumps({
            "success": False, 
            "code": "ERR_INTENT_SKILL_NOT_FOUND", 
            "error": "couldn't find skill by id"}), content_type="application/json")
    intent = skill.get_intent(intent_id)
    if not intent:
        return Response(json.dumps({
            "success": False, 
            "code": "ERR_INTENT_NOT_FOUND", 
            "error": "couldn't find intent by id"}), content_type="application/json")
    if slot_name in intent["slots"]:
        del intent["slots"][slot_name]
        skill.update_intent(intent["id"], intent)
        skill.save()
        return Response(json.dumps({"success": True}), content_type="application/json")
    return Response(json.dumps({
        "success": False, 
        "code": "ERR_INTENT_SLOT_NOT_FOUND", 
        "error": "slot couldn't be found by name"}), content_type="application/json")


@app.route("/api/intent/<skill_id>/<intent_id>/<slot_name>/rename", methods=["POST"])
@login_required
@retrain
def api_intent_rename_slot(skill_id: str, intent_id: str, slot_name: str):
    json_data = request.get_json(force=True)
    if "new-name" not in json_data:
        return Response(json.dumps({
            "success": False, 
            "code": "ERR_INTENT_INVALID_ARGS", 
            "error": "need to provide field 'new-name' in json post body"}), content_type="application/json")
    new_name = json_data["new-name"]
    skill = Skill(skill_id)
    if not skill.found:
        return Response(json.dumps({
            "success": False, 
            "code": "ERR_INTENT_SKILL_NOT_FOUND", 
            "error": "couldn't find skill by id"}), content_type="application/json")
    intent = skill.get_intent(intent_id)
    if not intent:
        return Response(json.dumps({
            "success": False, 
            "code": "ERR_INTENT_NOT_FOUND", 
            "error": "couldn't find intent by id"}), content_type="application/json")
    if new_name in intent["slots"]:
        return Response(json.dumps({
            "success": False, 
            "code": "ERR_INTENT_SLOT_EXISTS", 
            "error": "a slot with this name already exists"}), content_type="application/json")
    if slot_name in intent["slots"]:
        intent["slots"][new_name] = intent["slots"][slot_name]
        del intent["slots"][slot_name]
        skill.update_intent(intent["id"], intent)
        skill.save()
        return Response(json.dumps({"success": True}), content_type="application/json")
    return Response(json.dumps({
        "success": False, 
        "code": "ERR_INTENT_SLOT_NOT_FOUND", 
        "error": "slot couldn't be found by name"}), content_type="application/json")


@app.route("/api/intent/<skill_id>/<intent_id>/add-training-data", methods=["POST"])
@login_required
@retrain
def api_intent_add_training_data(skill_id: str, intent_id: str):
    json_data = request.get_json(force=True)
    if "sentence" not in json_data or json_data["sentence"].strip() == "":
        return Response(json.dumps({
            "success": False, 
            "code": "ERR_INTENT_DATA_ADD_INVALID_ARGS", 
            "error": "need to provide non-empty field 'sentence' in json post body"}), content_type="application/json")
    sentence = json_data["sentence"]
    skill = Skill(skill_id)
    if not skill.found:
        return Response(json.dumps({
            "success": False, 
            "code": "ERR_INTENT_SKILL_NOT_FOUND", 
            "error": "couldn't find skill by id"}), content_type="application/json")
    intent = skill.get_intent(intent_id)
    if not intent:
        return Response(json.dumps({
            "success": False, 
            "code": "ERR_INTENT_NOT_FOUND", 
            "error": "couldn't find intent by id"}), content_type="application/json")
    utteranceid = Security.id(16)
    intent["utterances"].append({
        "id": utteranceid,
        "created-at": int(time.time()),
        "modified-at": int(time.time()),
        "data": [{
            "text": sentence
        }]
    })
    skill.update_intent(intent["id"], intent)
    skill.save()
    return Response(json.dumps({"success": True, "id": utteranceid}), content_type="application/json")


@app.route("/api/intent/<skill_id>/<intent_id>/delete-training-data", methods=["POST"])
@login_required
@retrain
def api_intent_delete_training_data(skill_id: str, intent_id: str):
    json_data = request.get_json(force=True)
    if "training-data-id" not in json_data:
        return Response(json.dumps({
            "success": False, 
            "code": "ERR_INTENT_INVALID_ARGS", 
            "error": "need to provide field 'training-data-id' in json post body"}), content_type="application/json")
    utterance_id = json_data["training-data-id"]
    skill = Skill(skill_id)
    if not skill.found:
        return Response(json.dumps({
            "success": False, 
            "code": "ERR_INTENT_SKILL_NOT_FOUND", 
            "error": "couldn't find skill by id"}), content_type="application/json")
    intent = skill.get_intent(intent_id)
    if not intent:
        return Response(json.dumps({
            "success": False, 
            "code": "ERR_INTENT_NOT_FOUND", 
            "error": "couldn't find intent by id"}), content_type="application/json")
    utt_id = -1
    for i in range(len(intent["utterances"])):
        utt = intent["utterances"][i]
        if utt["id"] == utterance_id:
            utt_id = i
            break
    if utt_id == -1:
        return Response(json.dumps({
            "success": False, 
            "code": "ERR_INTENT_DATA_NOT_FOUND", 
            "error": "couldn't find intent data by id"}), content_type="application/json")
    del intent["utterances"][utt_id]
    skill.update_intent(intent["id"], intent)
    skill.save()
    return Response(json.dumps({"success": True}), content_type="application/json")


@app.route("/api/intent/<skill_id>/<intent_id>/modify-training-data", methods=["POST"])
@login_required
@retrain
def api_intent_modify_training_data(skill_id: str, intent_id: str):
    json_data = request.get_json(force=True)
    if "id" not in json_data or "data" not in json_data:
        return Response(json.dumps({
            "success": False, 
            "code": "ERR_INTENT_DATA_MODIFY_INVALID_ARGS", 
            "error": "need to provide non-empty field 'id' and 'data' in json post body"}), content_type="application/json")
    data_id = json_data["id"]
    new_data = json_data["data"]
    skill = Skill(skill_id)
    if not skill.found:
        return Response(json.dumps({
            "success": False, 
            "code": "ERR_INTENT_SKILL_NOT_FOUND", 
            "error": "couldn't find skill by id"}), content_type="application/json")
    intent = skill.get_intent(intent_id)
    if not intent:
        return Response(json.dumps({
            "success": False, 
            "code": "ERR_INTENT_NOT_FOUND", 
            "error": "couldn't find intent by id"}), content_type="application/json")
    utt_id = -1
    for i in range(len(intent["utterances"])):
        utt = intent["utterances"][i]
        if utt["id"] == data_id:
            utt_id = i
            break
    if utt_id == -1:
        return Response(json.dumps({
            "success": False, 
            "code": "ERR_INTENT_DATA_NOT_FOUND", 
            "error": "couldn't find intent data by id"}), content_type="application/json")
    intent["utterances"][utt_id]["data"] = new_data
    intent["utterances"][utt_id]["modified-at"] = int(time.time())
    skill.update_intent(intent["id"], intent)
    skill.save()
    return Response(json.dumps({"success": True}), content_type="application/json")
