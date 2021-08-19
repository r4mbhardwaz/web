import time
import json
from __main__ import app, Slot, Skill
from flask import request
from flask.wrappers import Response
from ..decorators import login_required, retrain
from jarvis import Security
import re


@app.route("/api/slot/create", methods=["POST"])
@login_required
@retrain
def slot_create_new():
    json_data = request.get_json(force=True)
    # TODO: check json_data["name"] format with regex
    if "name" in json_data and "description" in json_data:
        slot = Slot.new()
        slot["created-at"] = int(time.time()) - 1
        slot["name"] = json_data["name"]
        slot["description"] = json_data["description"]
        slot.save()
        return Response(json.dumps({"success": True, "id": slot.id}), content_type="application/json")
    else:
        return Response(json.dumps({"success": False, "error": "need to provide 'name' and 'description' in json post body"}), content_type="application/json")


@app.route("/api/slot/<slot_id>/add-data", methods=["POST"])
@login_required
@retrain
def api_add_data_to_slot(slot_id: str):
    json_data = request.get_json(force=True)
    if "value" in json_data and "synonyms" in json_data:
        if json_data["value"].strip() == "":
            return Response(json.dumps({"success":False, "code": "ERR_SLOT_VALUE_EMPTY", "error": "value must not be empty"}), content_type="application/json")
        slot = Slot.load(slot_id)
        if not slot:
            return json.dumps({"success": False, "code": "ERR_SLOT_NOT_FOUND", "error": "slot not defined yet."})
        id = Security.id(16)
        slot["data"].append({
            "id": id,
            "created-at": int(time.time()),
            "modified-at": int(time.time()),
            "value": json_data["value"],
            "synonyms": list(map(str.strip, json_data["synonyms"].split(","))) if json_data["synonyms"].strip() != "" else []
        })
        slot.save()
        return Response(json.dumps({"success": True, "id": id}), content_type="application/json")
    return Response(json.dumps({"success": False, "code": "ERR_SLOT_ARGS_MISSING", "error": "you have to provide 'value' and 'synonyms' in json body"}), content_type="application/json")


@app.route("/api/slot/<slot_id>/set", methods=["POST"])
@login_required
@retrain
def api_set_slot_key(slot_id: str):
    json_data = request.get_json(force=True)
    key = json_data["key"]
    value = json_data["value"]
    if key in ["name", "description", "extensible", "strictness", "use-synonyms"]:
        slot = Slot.load(slot_id)
        slot[key] = value
        slot.save()
        return json.dumps({"success": True})
    return json.dumps({"success": False, "code": "ERR_SLOT_INVALID_ARGS", "error": "invalid key. valid: 'name', 'extensible', 'use-synonyms' and 'strictness'"})


@app.route("/api/slot/<slot_id>/delete/<slot_value_id>")
@login_required
@retrain
def api_slot_remove(slot_id: str, slot_value_id: str):
    slot = Slot.load(slot_id)
    if slot:
        new_data = []
        for x in slot["data"]:
            if x["id"] != slot_value_id:
                new_data.append(x)
        slot["data"] = new_data
        slot.save()
        return json.dumps({"success": True, "error": "successfully deleted data"})
    return json.dumps({"success": False, "code": "ERR_SLOT_NOT_FOUND", "error": "couldn't find any data"})


@app.route("/api/slot/<slot_id>/delete")
@login_required
@retrain
def api_slot_delete(slot_id: str):
    return json.dumps({"success": False, "error": "not implemented"})


@app.route("/api/slot/<slot_id>/<item_id>/change", methods=["POST"])
@login_required
@retrain
def api_slot_item_change(slot_id: str, item_id: str):
    json_data = request.get_json(force=True)
    if "value" in json_data:
        slot = Slot.load(slot_id)
        for i in range(len(slot["data"])):   # loop through data
            element = slot["data"][i]
            if element["id"] == item_id:    # if we found the id
                slot["data"][i]["value"] = json_data["value"]    # set the new value
                slot["data"][i]["modified-at"] = int(time.time())
        slot.save()
        return json.dumps({"success": True})
    elif "synonyms" in json_data:
        slot = Slot.load(slot_id)
        for i in range(len(slot["data"])):   # loop through data
            element = slot["data"][i]
            if element["id"] == item_id:    # if we found the id
                slot["data"][i]["synonyms"] = list(map(str.strip, json_data["synonyms"].split(","))) if json_data["synonyms"].strip() != "" else []
                slot["data"][i]["modified-at"] = int(time.time())
        slot.save()
        return json.dumps({"success": True})
    else:
        return json.dumps({"success": False, "error": "you need to provide 'value' or 'synonyms' in post body"})


@app.route("/api/slot/<slot_id>/import", methods=["POST"])
@login_required
@retrain
def api_slot_import(slot_id):
    json_data = request.get_json(force=True)
    if "values" not in json_data:
        return Response(json.dumps({
            "success": False, 
            "code": "ERR_SLOT_INVALID_ARGS",
            "error": "need to provide field 'values' in json post body"
            }), content_type="application/json")
    slot = Slot.load(slot_id)
    if not slot:
        return Response(json.dumps({
            "success": False, 
            "code": "ERR_SLOT_NOT_FOUND",
            "error": "couldn't find slot by id"
            }), content_type="application/json")
    values = json_data["values"]
    for value in values:
        slot["data"].append({
            "id": Security.id(16),
            "created-at": int(time.time()),
            "modified-at": int(time.time()),
            "value": value,
            "synonyms": []
        })
    slot.save()
    return Response(json.dumps({"success":True}), content_type="application/json")


@app.route("/api/slot/<slot_id>/load-data", methods=["POST"])
@login_required
def api_slot_load_data(slot_id):
    json_data = request.get_json(force=True)
    if "start" not in json_data or "count" not in json_data:
        return Response(json.dumps({
            "success": False, 
            "code": "ERR_SLOT_INVALID_ARGS",
            "error": "need to provide field 'start' and 'count' in json post body"
            }), content_type="application/json")
    slot = Slot.load(slot_id)
    if not slot:
        return Response(json.dumps({
            "success": False, 
            "code": "ERR_SLOT_NOT_FOUND",
            "error": "couldn't find slot by id"
            }), content_type="application/json")
    start = json_data["start"]
    count = json_data["count"]
    return Response(json.dumps({
        "success": True, 
        "data": slot["data"][start:start+count]
        }), content_type="application/json")


@app.route("/api/slot/<slot_id>/empty", methods=["POST"])
@login_required
@retrain
def api_slot_empty(slot_id):
    slot = Slot.load(slot_id)
    if not slot:
        return Response(json.dumps({
            "success": False, 
            "code": "ERR_SLOT_NOT_FOUND",
            "error": "couldn't find slot by id"
            }), content_type="application/json")
    slot["data"] = []
    slot.save()
    return Response(json.dumps({
        "success": True
    }), content_type="application/json")


@app.route("/api/slot/all")
@login_required
def api_slot_get_all():
    user_created_slots = Slot.all()
    snips_builtin_slots = []

    # """
    # Entity	        Identifier	        Category	        Supported Languages
    # AmountOfMoney	snips/amountOfMoney	Grammar Entity	    de, en, es, fr, it, ja, ko, pt_br, pt_pt
    # Duration    	snips/duration	    Grammar Entity	    de, en, es, fr, it, ja, ko, pt_br, pt_pt
    # Number      	snips/number	    Grammar Entity	    de, en, es, fr, it, ja, ko, pt_br, pt_pt
    # Ordinal     	snips/ordinal	    Grammar Entity	    de, en, es, fr, it, ja, ko, pt_br, pt_pt
    # Temperature 	snips/temperature	Grammar Entity	    de, en, es, fr, it, ja, ko, pt_br, pt_pt
    # Datetime    	snips/datetime	    Grammar Entity	    de, en, es, fr, it, ja, ko, pt_br, pt_pt
    # Date        	snips/date	        Grammar Entity	    en
    # Time        	snips/time	        Grammar Entity	    en
    # DatePeriod  	snips/datePeriod	Grammar Entity	    en
    # TimePeriod  	snips/timePeriod	Grammar Entity	    en
    # Percentage  	snips/percentage	Grammar Entity	    de, en, es, fr, it, ja, pt_br, pt_pt
    # MusicAlbum  	snips/musicAlbum	Gazetteer Entity	de, en, es, fr, it, ja, pt_br, pt_pt
    # MusicArtist 	snips/musicArtist	Gazetteer Entity	de, en, es, fr, it, ja, pt_br, pt_pt
    # MusicTrack  	snips/musicTrack	Gazetteer Entity	de, en, es, fr, it, ja, pt_br, pt_pt
    # City        	snips/city	        Gazetteer Entity	de, en, es, fr, it, ja, pt_br, pt_pt
    # Country     	snips/country	    Gazetteer Entity	de, en, es, fr, it, ja, pt_br, pt_pt
    # Region      	snips/region	    Gazetteer Entity	de, en, es, fr, it, ja, pt_br, pt_pt
    # """

    # def get_slots_for_language(lang: str):
    #     slots = []
    #     for obj in Slot.BUILTINS:
    #         if lang in obj["languages"]:
    #             slots.append({ 
    #                 "name": obj["slot_name"], 
    #                 "full-name": obj["name"], 
    #                 "description": obj["code-samples"], 
    #                 "static": True }) ## this has to match the database stlye!!!
    #     return slots

    # regex = "http([a-zA-Z0-9:/.]+)/intent/edit/([0-9a-f]+)/([0-9a-f]+)"
    # language = "en"
    # if request.referrer and bool(re.match(regex, request.referrer)):
    #     domain, skill_id, intent_id = re.search(regex, request.referrer).groups()
    #     skill = Skill.load(skill_id)
    #     if skill:
    #         language = skill["language"]

    # snips_builtin_slots = get_slots_for_language(language)

    return json.dumps({"success": True, "slots": user_created_slots + snips_builtin_slots})
