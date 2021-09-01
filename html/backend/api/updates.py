from __main__ import app, API_endpoint
import json
import time
from jarvis import Config
from flask import request
from flask.wrappers import Response
from ..decorators import login_required


@app.route("/api/update/download", methods=["POST"])
@login_required
def api_update_download():
    return Response(json.dumps(API_endpoint("update/download", {})), content_type="application/json")


@app.route("/api/update/install", methods=["POST"])
@login_required
def api_update_install():
    return Response(json.dumps(API_endpoint("update/install", {})), content_type="application/json")


@app.route("/api/update/poll", methods=["POST"])
@login_required
def api_update_poll():
    return Response(json.dumps(API_endpoint("update/poll", {})), content_type="application/json")


@app.route("/api/update/schedule", methods=["POST"])
@login_required
def api_update_schedule():
    json_data = request.get_json(force=True)
    max_future_days = 30
    def set_schedule(key):
        if not isinstance(json_data[key], int):
            return Response(json.dumps({"success": False, "error": f"The given {key} timestamp is not an integer!"}), content_type="application/json")
        if json_data[key] < time.time():
            return Response(json.dumps({"success": False, "error": "The date has to be in the future!"}), content_type="application/json")
        if json_data[key] > time.time() + (60 * 60 * 24 * (max_future_days + 1)):
            return Response(json.dumps({"success": False, "error": f"The date has to be a maximum of {max_future_days} days in the future!"}), content_type="application/json")
        cnf = Config()
        cnf.set(f"schedule-{key}", json_data[key])
        return Response(json.dumps({"success": True}), content_type="application/json")
    if "install" in json_data:
        return set_schedule("install")
    if "download" in json_data:
        return set_schedule("download")
    return Response(json.dumps({"success": False, "error": "You can only schedule an installation or download!"}))


@app.route("/api/update/schedule/cancel", methods=["POST"])
@login_required
def api_cancel_scheduled_update():
    try:
        cnf = Config()
        cnf.set("schedule-install", False)
        return Response(json.dumps({"success": True}))
    except Exception:
        return Response(json.dumps({"success": False, "error": "Database connection failed"}))

