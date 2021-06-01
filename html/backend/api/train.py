from __main__ import *

import json
from copy import deepcopy
from jarvis import MQTT


@app.route("/api/assistant/status")
@login_required
def api_assistant_status():
    result = MQTT.onetime("jarvis/satellite/nlu/status", {}, timeout=2)
    return Response(json.dumps({"success": True, "result": json.loads(result)}), content_type="application/json")


@app.route("/api/assistant/train", methods=["POST", "GET"])
@login_required
def api_assistant_train():
    data = {}
    all_skills = Skill.all(as_json=True, resolve_slots=True)

    # data["skills"] = deepcopy(all_skills) # ONLY FOR DEBUG
    data["entities"] = get_entities(deepcopy(all_skills))
    data["intents"] = get_intents(deepcopy(all_skills), get_slots(deepcopy(all_skills)))
    data["language"] = "de" # TODO: add option for language change

    mqtt = MQTT(client_id="web")
    mqtt.publish("jarvis/satellite/nlu/train", json.dumps({"data": data}))
    return Response(json.dumps({"success": True}), content_type="application/json")


@app.route("/api/assistant/parse", methods=["POST"])
@login_required
def api_assistant_parse():
    json_data = request.get_json(force=True)
    if "utterance" not in json_data:
        return Response(json.dumps({
            "success": False,
            "code": "ERR_ASSISTANT_INVALID_ARGS",
            "error": "need to provide field 'utterance' in json post body"
        }), content_type="application/json")
    result = MQTT.onetime("jarvis/satellite/nlu/parse", {"utterance": json_data["utterance"]}, timeout=2)
    return Response(json.dumps({"success": bool(result), "result": json.loads(result)["result"]}))


def get_intents(skills, slots):
    intents = {}
    for skill in skills:
        for intent in skill["intents"]:
            unique_intent_name = f"{skill['name']}${intent['name']}"
            for i in range(len(intent["utterances"])):
                del intent["utterances"][i]["created-at"]
                del intent["utterances"][i]["modified-at"]
                del intent["utterances"][i]["id"]
                for j in range(len(intent["utterances"][i]["data"])):
                    if "slot" in intent["utterances"][i]["data"][j]:
                        intent["utterances"][i]["data"][j]["slot_name"] = slots[intent["utterances"][i]["data"][j]["slot"]]["name"]
                        intent["utterances"][i]["data"][j]["entity"] = slots[intent["utterances"][i]["data"][j]["slot"]]["entity"]
                        del intent["utterances"][i]["data"][j]["slot"]
            intents[unique_intent_name] = {
                "utterances": intent["utterances"]
            }
    return intents

def get_entities(skills):
    entities = {}
    for skill in skills:
        for intent in skill["intents"]:
            for slot_name in intent["slots"]:
                entity = intent["slots"][slot_name]
                entity_name = entity["name"]
                del entity["description"]
                del entity["modified-at"]
                del entity["created-at"]
                del entity["name"]
                del entity["id"]
                del entity["quality"]
                # rename keys
                entity["automatically_extensible"] = entity.pop("extensible")
                entity["matching_strictness"] = entity.pop("strictness")
                entity["use_synonyms"] = entity.pop("use-synonyms")

                for i in range(len(entity["data"])):
                    del entity["data"][i]["created-at"]
                    del entity["data"][i]["modified-at"]
                    del entity["data"][i]["id"]

                entities[entity_name] = entity
    return entities

def get_slots(skills):
    slots = {}
    for skill in skills:
        for intent in skill["intents"]:
            for slot_name in intent["slots"]:
                slots[intent["slots"][slot_name]["id"]] = { "name": slot_name, 
                                                            "entity": intent["slots"][slot_name]["name"] }
    return slots