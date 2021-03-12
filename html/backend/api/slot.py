from __main__ import *

@app.route("/api/slot/<slot_id>/add-data", methods=["POST"])
@login_required
def api_add_data_to_slot(slot_id: str):
    json_data = request.get_json(force=True)
    if "value" in json_data and "synonyms" in json_data:
        slot = Slot(slot_id)
        if not slot.found:
            return json.dumps({"success": False, "error": "slot not defined yet."})
        id = Security.id(16)
        slot["data"].append({
            "id": id,
            "created-at": int(time.time()),
            "modified-at": int(time.time()),
            "value": json_data["value"],
            "synonyms": list(map(str.strip, json_data["synonyms"].split(","))) if json_data["synonyms"].strip() != "" else []
        })
        slot.save()
        return json.dumps({"success": True, "id": id})
    return json.dumps({"success": False, "error": "you have to provide 'value' and 'synonyms' in json body"})


@app.route("/api/slot/<slot_id>/<key>")
@login_required
def api_set_slot_key(slot_id: str, key: str):
    value = request.args.get("value", None)        
    if key in ["name", "extensible", "strictness", "use-synonyms"]:
        if key == "extensible" or key == "use-synonyms":
            value = True if value == "true" else False
        if key == "strictness":
            value = float(value)
        slot = Slot(slot_id)
        slot[key] = value
        slot.save()
    return json.dumps({"success": False, "error": "invalid key. valid: 'name', 'extensible', 'use-synonyms' and 'strictness'"})


@app.route("/api/slot/<slot_id>/delete/<slot_value_id>")
@login_required
def api_slot_remove(slot_id: str, slot_value_id: str):
    slot = Slot(slot_id)
    if slot.found:
        new_data = []
        for x in slot["data"]:
            if x["id"] != slot_value_id:
                new_data.append(x)
        slot["data"] = new_data
        slot.save()
        return json.dumps({"success": True, "error": "successfully deleted data"})
    return json.dumps({"success": False, "error": "couldn't find any data"})


@app.route("/api/slot/<slot_id>/delete")
@login_required
def api_slot_delete(slot_id: str):
    return json.dumps({"success": False, "error": "not implemented"})


@app.route("/api/slot/<slot_id>/<item_id>/change", methods=["POST"])
@login_required
def api_slot_item_change(slot_id: str, item_id: str):
    json_data = request.get_json(force=True)
    if "value" in json_data:
        slot = Slot(slot_id)
        for i in range(len(slot["data"])):   # loop through data
            element = slot["data"][i]
            if element["id"] == item_id:    # if we found the id
                slot["data"][i]["value"] = json_data["value"]    # set the new value
        slot.save()
        return json.dumps({"success": True})
    elif "synonyms" in json_data:
        slot = Slot(slot_id)
        for i in range(len(slot["data"])):   # loop through data
            element = slot["data"][i]
            if element["id"] == item_id:    # if we found the id
                slot["data"][i]["synonyms"] = list(map(str.strip, json_data["synonyms"].split(","))) if json_data["synonyms"].strip() != "" else []
        slot.save()
        return json.dumps({"success": True})
    else:
        return json.dumps({"success": False, "error": "you need to provide 'value' or 'synonyms' in post body"})


@app.route("/api/slot/all")
@login_required
def api_slot_get_all():
    return json.dumps({"success": True, "slots": Slot.all()})