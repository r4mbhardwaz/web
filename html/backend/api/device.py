import json
import time
from __main__ import app, login_required
from flask import session, redirect, request
from flask.wrappers import Response
from jarvis import Database, Config


@app.route("/api/device/new", methods=["POST"])
@login_required
def api_device_new():
    json_data = request.get_json(force=True)
    result = { "success": False, "error": "missing required 'name' field" }
    if "name" in json_data: # TODO: normalize using the Server::Device class
        new_device = {
            "name": json_data["name"],
            "device": None,
            "activated": False,
            "last-seen": int(time.time()),
            "created-at": int(time.time()),
            "modified-at": int(time.time())
        }
        Database().table("devices").insert(new_device)
        del result["error"]
        result["success"] = True
        result["result"]  = new_device["_id"],
    return Response(json.dumps(result), content_type="application/json")


@app.route("/api/device/set", methods=["POST"])
@login_required
def api_device_set_value():
    json_data = request.get_json(force=True)
    if not ("key" in json_data and "id" in json_data and "value" in json_data):
        return Response(json.dumps({ "success": False, "error": "Missing device ID, key or value" }), content_type="application/json")
    allowed_keys = ["name"]
    if json_data["key"] in allowed_keys:
        device = Database().table("devices").find({ "_id": { "$eq": json_data["id"] }})
        def update_name(old):
            old[json_data["key"]] = json_data["value"]
            return old
        device.update(update_name)
        return Response(json.dumps({ "success": True }), content_type="application/json")
    return Response(json.dumps({ "success": False, "error": "Invalid key specified" }), content_type="application/json")


@app.route("/api/device/delete", methods=["POST"])
@login_required
def api_device_delete():
    json_data = request.get_json(force=True)
    if "id" not in json_data:
        return Response(json.dumps({"success": False, "error": "Need to specify device ID"}), content_type="application/json")
    dev = Database().table("devices").find({ "_id": { "$eq": json_data["id"] }})
    if dev.found:
        if "is-root" in dev[0] and dev[0]["is-root"]:
            return Response(json.dumps({"success": False, "error": "Cannot delete the Jarvis device"}), content_type="application/json") 
        dev.delete()
        return Response(json.dumps({"success": True}), content_type="application/json") 
    else:
        return Response(json.dumps({"success": False, "error": "Device not found!"}), content_type="application/json") 


@app.route("/api/devices")
@login_required
def api_get_devices():
    try:
        devices = list(Database().table("devices").all())
        for i in range(len(devices)):
            devices[i]["id"] = devices[i]["_id"]
            del devices[i]["_rev"]
            del devices[i]["_id"]
        return Response(json.dumps({ "success": True, "devices": devices }))
    except Exception:
        return Response(json.dumps({"success": False, "error": "Database connection failed"}))
