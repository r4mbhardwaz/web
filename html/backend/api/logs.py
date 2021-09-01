from __main__ import app
import json
import time
import traceback
from jarvis import Database
from flask import request
from flask.wrappers import Response
from ..decorators import login_required


@app.route("/api/logs/get", methods=["GET"])
@login_required
def api_get_all_logs():
    max_minutes = int(request.args.get("min", -1))
    min_severity = int(request.args.get("sev", 0))
    severities = ["S", "I", "W", "E", "C"]
    filter_severities = severities[min_severity:]
    try:
        logs = list(Database().table("logs").find({
                "timestamp": { "$gt": time.time() - max_minutes },
                "importance": { "$in": filter_severities }
            }).sort("timestamp").reverse()) # newest first
        for i in range(len(logs)):
            del logs[i]["_id"]
            del logs[i]["_rev"]
        return Response(json.dumps({"success": True, "logs": logs, "length": len(logs)}), content_type="application/json")
    except Exception:
        print(traceback.format_exc())
        return Response(json.dumps({"success": False, "error": "Database connection failed"}), content_type="application/json")


@app.route("/api/logs/delete", methods=["POST"])
@login_required
def api_delete_all_logs():
    try:
        Database().table("logs").all().delete()
        return Response(json.dumps({"success": True}))
    except Exception:
        return Response(json.dumps({"success": False, "error": "Database connection failed"}), content_type="application/json")


@app.route("/api/log/delete", methods=["POST"])
@login_required
def api_delete_one_log():
    json_data = request.get_json(force=True)
    if "timestamp" in json_data and "referrer" in json_data and "tag" in json_data:
        try:
            Database().table("logs").find({
                "timestamp": { "$eq": json_data["timestamp"] },
                "referrer":  { "$eq": json_data["referrer"]  },
                "tag":       { "$eq": json_data["tag"]       }
            }).delete()
            return Response(json.dumps({"success": True}))
        except Exception:
            return Response(json.dumps({"success": False, "error": "Database connection failed"}), content_type="application/json")
    else:
        return Response(json.dumps({"success": False, "error": "Need to provide fields 'timestamp', 'referrer' and 'tag'"}), content_type="application/json")

