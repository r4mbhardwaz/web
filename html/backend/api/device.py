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
    if "name" in json_data: # TODO: normalize using the Server::Client class
        new_client = {
            "ip": None,
            "data": {},
            "name": json_data["name"],
            "secure": False,
            "public-key": None,
            "last-seen": int(time.time()),
            "created-at": int(time.time()),
            "modified-at": int(time.time()),
            "activated": False
        }
        Database().table("clients").insert(new_client)
        del result["error"]
        result["success"] = True
        result["result"]  = new_client["_id"],
    return Response(json.dumps(result), content_type="application/json")
